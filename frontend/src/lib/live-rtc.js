// Souk Live in the browser: WebRTC between the host and the viewers, with viewers relaying the video
// to other viewers (a tree), so the host's upload does not grow with the audience and no paid media
// server is needed. The API only passes signalling messages and tells each peer its parent / children.
//
//   host ──► viewer A ──► viewer C
//        └─► viewer B ──► viewer D
//
// Only a parent sends offers (it is the one with the video); a child only answers. ICE candidates that
// arrive before the remote description are queued.
import { api } from './api.js';

const VIDEO_KBPS = 700; // per link: ~480p at 24 fps, light enough for 4G uploads
const fast = 1500;
const slow = 3000;

/** Can this device afford to relay the video to others? (not on mobile data / data saver). */
export function canRelayHere() {
  const c = navigator.connection;
  if (c?.saveData) return false;
  if (c?.type === 'cellular') return false;
  if (c?.effectiveType && c.effectiveType !== '4g') return false;
  return true;
}

export class LiveSession {
  /**
   * role: 'host' | 'viewer'. Callbacks: onStream(stream), onState(state), onPoll(pollResponse).
   * Host: pass `stream` (camera); call start(). Viewer: call join().
   */
  constructor({ liveId, role, stream = null, onStream, onState, onPoll }) {
    Object.assign(this, { liveId, role, stream, onStream, onState, onPoll });
    this.peerId = null; this.token = null; this.iceServers = [];
    this.parentId = null;
    this.up = null;               // connection to my parent (viewers)
    this.down = new Map();        // child peerId -> RTCPeerConnection
    this.pendingIce = new Map();  // peerId -> candidates waiting for the remote description
    this.sinceSignal = 0; this.sinceComment = 0;
    this.connected = role === 'host';
    this.stopped = false; this.timer = null;
  }

  state(s) { this.onState?.(s); }

  async start() {
    const r = await api(`/live/${this.liveId}/start`, { method: 'POST' });
    Object.assign(this, { peerId: r.peerId, token: r.token, iceServers: r.iceServers });
    this.state('live');
    this.loop();
  }

  async join() {
    this.canRelay = canRelayHere();
    const r = await api(`/live/${this.liveId}/join`, { method: 'POST', body: { canRelay: this.canRelay } });
    Object.assign(this, { peerId: r.peerId, token: r.token, iceServers: r.iceServers, parentId: r.parentId });
    this.state('connecting');
    this.loop();
  }

  loop() {
    if (this.stopped) return;
    this.timer = setTimeout(async () => {
      try { await this.poll(); } catch (err) { if (err?.status === 403 || err?.status === 404) { this.state('ended'); return; } }
      this.loop();
    }, this.connected ? slow : fast);
  }

  async poll() {
    const r = await api(`/live/${this.liveId}/poll`, {
      query: { peer: this.peerId, token: this.token, since: this.sinceSignal, comments: this.sinceComment, connected: this.connected ? 1 : 0 },
    });
    if (r.comments?.length) this.sinceComment = r.comments.at(-1).id;
    this.onPoll?.(r);
    if (r.status !== 'live') { this.state(r.status === 'removed' ? 'removed' : 'ended'); this.stop(false); return; }
    // My parent changed (the old one left): drop the old link and wait for the new parent's offer.
    if (this.role === 'viewer' && r.parentId !== this.parentId) {
      this.parentId = r.parentId;
      this.closeUp();
      this.state(r.parentId ? 'reconnecting' : 'waiting');
    }
    for (const s of r.signals || []) {
      this.sinceSignal = Math.max(this.sinceSignal, Number(s.id));
      await this.handleSignal(s).catch(() => {});
    }
    // Send the video to every child I have not connected yet; close links to children that left.
    const kids = new Set(r.children || []);
    for (const id of kids) if (!this.down.has(id) && this.outgoingStream()) await this.offerTo(id).catch(() => {});
    for (const [id, pc] of this.down) if (!kids.has(id)) { pc.close(); this.down.delete(id); }
  }

  outgoingStream() { return this.role === 'host' ? this.stream : this.remoteStream; }

  signal(to, kind, payload) {
    return api(`/live/${this.liveId}/signal`, { method: 'POST', body: { from: this.peerId, token: this.token, to, kind, payload } }).catch(() => {});
  }

  newPc(otherId) {
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    pc.onicecandidate = (e) => { if (e.candidate) this.signal(otherId, 'ice', e.candidate.toJSON()); };
    return pc;
  }

  async offerTo(childId) {
    const pc = this.newPc(childId);
    this.down.set(childId, pc);
    const stream = this.outgoingStream();
    for (const track of stream.getTracks()) {
      const sender = pc.addTrack(track, stream);
      if (track.kind === 'video') {
        // Cap the bitrate of each link so a phone can feed its children.
        const p = sender.getParameters();
        p.encodings = [{ ...(p.encodings?.[0] || {}), maxBitrate: VIDEO_KBPS * 1000 }];
        sender.setParameters(p).catch(() => {});
      }
    }
    pc.onconnectionstatechange = () => { if (['failed', 'closed'].includes(pc.connectionState)) { pc.close(); this.down.delete(childId); } };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.signal(childId, 'offer', { type: offer.type, sdp: offer.sdp });
  }

  async handleSignal(s) {
    const from = s.from_peer;
    if (s.kind === 'offer' && this.role === 'viewer' && from === this.parentId) {
      this.closeUp();
      const pc = this.newPc(from);
      this.up = pc;
      pc.ontrack = (e) => {
        this.remoteStream = e.streams[0] || new MediaStream([e.track]);
        this.onStream?.(this.remoteStream);
        // Relay the new track to my children too.
        for (const child of this.down.values()) {
          child.getSenders().filter((x) => x.track?.kind === e.track.kind).forEach((x) => x.replaceTrack(e.track).catch(() => {}));
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') { this.connected = true; this.state('watching'); }
        if (pc.connectionState === 'failed') { this.connected = false; this.state('reconnecting'); }
      };
      await pc.setRemoteDescription(s.payload);
      await this.flushIce(from, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await this.signal(from, 'answer', { type: answer.type, sdp: answer.sdp });
    } else if (s.kind === 'answer') {
      const pc = this.down.get(from);
      if (pc && pc.signalingState === 'have-local-offer') { await pc.setRemoteDescription(s.payload); await this.flushIce(from, pc); }
    } else if (s.kind === 'ice') {
      const pc = from === this.parentId ? this.up : this.down.get(from);
      if (pc?.remoteDescription) await pc.addIceCandidate(s.payload).catch(() => {});
      else this.pendingIce.set(from, [...(this.pendingIce.get(from) || []), s.payload]);
    } else if (s.kind === 'bye') {
      const pc = this.down.get(from);
      if (pc) { pc.close(); this.down.delete(from); }
    }
  }

  async flushIce(from, pc) {
    for (const c of this.pendingIce.get(from) || []) await pc.addIceCandidate(c).catch(() => {});
    this.pendingIce.delete(from);
  }

  closeUp() { if (this.up) { this.up.close(); this.up = null; } this.connected = false; }

  /** Leave: close every link and tell the server (children are then re-attached elsewhere). */
  stop(tellServer = true) {
    this.stopped = true;
    clearTimeout(this.timer);
    this.closeUp();
    for (const pc of this.down.values()) pc.close();
    this.down.clear();
    if (tellServer && this.peerId && this.role === 'viewer') {
      const body = JSON.stringify({ peer: this.peerId, token: this.token });
      try { navigator.sendBeacon(`/api/live/${this.liveId}/leave`, new Blob([body], { type: 'application/json' })); } catch { /* ignore */ }
    }
  }
}

/** Record the host's camera on the device (only when the host agreed), at a small size. */
export function startRecorder(stream) {
  if (typeof MediaRecorder === 'undefined') return null;
  const types = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  const mimeType = types.find((t) => MediaRecorder.isTypeSupported?.(t));
  if (!mimeType) return null;
  const chunks = [];
  const rec = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 600_000, audioBitsPerSecond: 64_000 });
  rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
  rec.start(5000);
  return {
    ext: mimeType.includes('mp4') ? 'mp4' : 'webm',
    stop: () => new Promise((resolve) => {
      if (rec.state === 'inactive') { resolve(new Blob(chunks, { type: mimeType.split(';')[0] })); return; }
      rec.onstop = () => resolve(new Blob(chunks, { type: mimeType.split(';')[0] }));
      rec.stop();
    }),
  };
}
