// Souk Live: live video selling. Lists, the host's form and studio, and the viewer's room.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { put } from '@vercel/blob';
import { Avatar, ErrorBox, Field, Icon, Spinner, VerifiedBadge } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { LiveSession, startRecorder } from '../lib/live-rtc.js';
import { FollowButton, ReportDialog } from './Social.jsx';

/** Date and time of a scheduled live, in the visitor's language (Latin digits). */
export const whenText = (d, lang, style = 'medium') => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : lang, { dateStyle: style, timeStyle: 'short' }).format(new Date(d));

function LiveBadge({ status, viewers }) {
  const { t, number } = useI18n();
  if (status === 'live') return <span className="badge gap-1 bg-rose-600 text-white">● {t('live.onAir')}{viewers !== undefined && <span className="ltr-nums">· 👁 {number(viewers)}</span>}</span>;
  return <span className="badge bg-slate-800/80 text-white">{t(`live.status.${status}`)}</span>;
}

export function LiveCard({ live }) {
  const { t, lang } = useI18n();
  return (
    <Link to={`/live/${live.id}`} className="card group overflow-hidden p-0 transition hover:shadow-lg">
      <div className="relative aspect-video bg-gradient-to-br from-brand-900 to-rose-900">
        {live.cover_url && <img src={live.cover_url} alt="" className="h-full w-full object-cover opacity-70" />}
        <span className="absolute start-2 top-2"><LiveBadge status={live.status} viewers={live.status === 'live' ? live.viewers : undefined} /></span>
        {live.status === 'scheduled' && <span className="absolute bottom-2 start-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">🗓 {whenText(live.scheduled_at, lang)}</span>}
        {live.status === 'ended' && live.recording_url && <span className="absolute bottom-2 start-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">▶ {t('live.replay')}</span>}
      </div>
      <div className="flex items-center gap-2 p-3">
        <Avatar name={live.store_name || live.host_name} url={live.store_logo || live.host_avatar} size="h-9 w-9" />
        <div className="min-w-0">
          <p className="truncate font-bold">{live.title}</p>
          <p className="flex items-center gap-1 truncate text-xs text-slate-500">{live.store_name || live.host_name}{live.host_verified && <VerifiedBadge small />}</p>
        </div>
      </div>
    </Link>
  );
}

/** Home-page strip: lives on air right now. */
export function LiveNowStrip() {
  const { t } = useI18n();
  const { data } = useApi('/live?status=live');
  if (!data?.items?.length) return null;
  return (
    <section aria-labelledby="live-now">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="live-now" className="flex items-center gap-2 text-xl font-bold"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-600" />{t('live.nowTitle')}</h2>
        <Link to="/live" className="link text-sm">{t('ai.seeAll')}</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{data.items.slice(0, 4).map((l) => <LiveCard key={l.id} live={l} />)}</div>
    </section>
  );
}

export default function LiveList() {
  const { t } = useI18n();
  const { user } = useApp();
  const now = useApi('/live?status=live');
  const soon = useApi('/live?status=scheduled');
  const past = useApi('/live?status=ended');
  const mine = useApi(user ? '/live/mine' : null, undefined, [user?.id]);
  useDocumentTitle('Souk Live');
  const section = (title, q, emptyText) => (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {q.loading ? <Spinner /> : q.data?.items?.length
        ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{q.data.items.map((l) => <LiveCard key={l.id} live={l} />)}</div>
        : <p className="text-sm text-slate-500">{emptyText}</p>}
    </section>
  );
  return (
    <div className="container-page max-w-5xl space-y-8 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-br from-rose-700 via-rose-600 to-brand-800 p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold">🔴 Souk Live</h1>
          <p className="mt-1 max-w-xl text-sm text-white/85">{t('live.subtitle')}</p>
        </div>
        {mine.data?.canHost && <Link to="/live/new" className="btn rounded-full bg-white px-5 font-bold text-rose-700 hover:bg-rose-50">+ {t('live.create')}</Link>}
      </header>
      {mine.data?.items?.some((l) => ['scheduled', 'live'].includes(l.status)) && section(t('live.myLives'), { data: { items: mine.data.items.filter((l) => ['scheduled', 'live'].includes(l.status)) } }, '')}
      {section(`● ${t('live.nowTitle')}`, now, t('live.noneNow'))}
      {section(`🗓 ${t('live.upcoming')}`, soon, t('live.noneSoon'))}
      {section(`▶ ${t('live.replays')}`, past, t('live.noneReplays'))}
      {user && mine.data && !mine.data.canHost && <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">ℹ️ {t('live.hostRule')}</p>}
    </div>
  );
}

/** Create or schedule a live (verified merchants). */
export function LiveForm() {
  const { t } = useI18n();
  const { user } = useApp();
  const navigate = useNavigate();
  const products = useApi(`/products?seller=${user.id}&limit=60`);
  const [f, setF] = useState({ title: '', description: '', when: 'now', scheduledAt: '', visibility: 'public', record: false, commentsEnabled: true, productIds: [] });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(t('live.create'));
  const toggle = (id) => setF((x) => ({ ...x, productIds: x.productIds.includes(id) ? x.productIds.filter((p) => p !== id) : [...x.productIds, id].slice(0, 20) }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { live } = await api('/live', {
        method: 'POST',
        body: { title: f.title, description: f.description, visibility: f.visibility, record: f.record, commentsEnabled: f.commentsEnabled, productIds: f.productIds,
          scheduledAt: f.when === 'later' && f.scheduledAt ? new Date(f.scheduledAt).toISOString() : null },
      });
      navigate(`/live/${live.id}`);
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <div className="container-page max-w-2xl py-6">
      <h1 className="mb-4 text-2xl font-bold">🔴 {t('live.create')}</h1>
      <form onSubmit={submit} className="card space-y-4 p-5">
        <Field label={t('live.titleLabel')}><input className="input" required minLength={3} maxLength={140} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={t('live.titlePh')} /></Field>
        <Field label={t('form.description')} optional><textarea className="input" rows={2} maxLength={1000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-2">
          {['now', 'later'].map((w) => (
            <label key={w} className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-center text-sm font-semibold ${f.when === w ? 'border-rose-600 bg-rose-50 text-rose-800' : 'border-slate-200'}`}>
              <input type="radio" className="sr-only" checked={f.when === w} onChange={() => setF({ ...f, when: w })} />{t(`live.when.${w}`)}
            </label>
          ))}
        </div>
        {f.when === 'later' && <Field label={t('live.date')} hint={t('live.dateHint')}><input type="datetime-local" className="input" required value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} /></Field>}
        <Field label={t('live.products')} hint={t('live.productsHint')}>
          {products.loading ? <Spinner /> : (
            <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
              {(products.data?.items || []).map((p) => (
                <label key={p.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-2 text-sm ${f.productIds.includes(p.id) ? 'border-brand-600 bg-brand-50' : 'border-slate-200'}`}>
                  <input type="checkbox" checked={f.productIds.includes(p.id)} onChange={() => toggle(p.id)} />
                  {p.cover_url && <img src={p.cover_url} alt="" className="h-9 w-9 rounded object-cover" />}
                  <span className="truncate">{p.title}</span>
                </label>
              ))}
            </div>
          )}
        </Field>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.record} onChange={(e) => setF({ ...f, record: e.target.checked })} /> {t('live.recordConsent')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.commentsEnabled} onChange={(e) => setF({ ...f, commentsEnabled: e.target.checked })} /> {t('live.allowComments')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.visibility === 'followers'} onChange={(e) => setF({ ...f, visibility: e.target.checked ? 'followers' : 'public' })} /> {t('live.followersOnly')}</label>
        </div>
        <ErrorBox error={error} />
        <button className="btn w-full rounded-xl bg-rose-600 py-3 font-bold text-white hover:bg-rose-700" disabled={busy}>{f.when === 'later' ? t('live.schedule') : t('live.prepare')}</button>
      </form>
    </div>
  );
}

// ---------- The live room (host studio + viewer) ----------

function Chat({ live, comments, canModerate, onPost, onDelete, onMute, onReport, disabled }) {
  const { t } = useI18n();
  const { user } = useApp();
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const box = useRef(null);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }); }, [comments.length]);
  const send = async (e) => {
    e.preventDefault();
    setError(null);
    try { await onPost(text); setText(''); } catch (err) { setError(err); }
  };
  return (
    <div className="flex h-full flex-col">
      <div ref={box} className="min-h-[160px] flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {!comments.length && <p className="text-center text-xs text-slate-400">{t('live.chatEmpty')}</p>}
        {comments.map((c) => (
          <div key={c.id} className="group flex items-start gap-2 text-sm">
            <span className="font-bold text-brand-700">{c.name}{c.user_id === live.host_id ? ' 🎙' : ''}</span>
            <span className="min-w-0 flex-1 break-words">{c.body}</span>
            {canModerate && c.user_id !== live.host_id && (
              <span className="flex shrink-0 gap-1 opacity-60 group-hover:opacity-100">
                <button type="button" title={t('common.delete')} onClick={() => onDelete(c)}>🗑</button>
                <button type="button" title={t('live.mute')} onClick={() => onMute(c)}>🔇</button>
              </span>
            )}
            {!canModerate && user && user.id !== c.user_id && <button type="button" className="shrink-0 opacity-40 hover:opacity-100" title={t('social.report')} onClick={() => onReport(c)}>🚩</button>}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="border-t border-slate-200 p-2">
        {user ? (
          <div className="flex gap-2">
            <input className="input flex-1 py-2" value={text} maxLength={300} onChange={(e) => setText(e.target.value)} placeholder={disabled ? t('live.chatOff') : t('live.chatPh')} disabled={disabled} />
            <button className="btn-primary px-3" disabled={disabled || !text.trim()} aria-label={t('ai.send')}><Icon name="send" className="h-4 w-4" /></button>
          </div>
        ) : <Link to="/login" className="link block text-center text-sm">{t('live.loginToChat')}</Link>}
        <ErrorBox error={error} />
      </form>
    </div>
  );
}

function ProductsRail({ products, pinned, isHost, onPin, liveId }) {
  const { t, price } = useI18n();
  if (!products.length) return null;
  const order = [...products].sort((a, b) => (b.id === pinned) - (a.id === pinned));
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {order.map((p) => (
        <div key={p.id} className={`flex w-60 shrink-0 items-center gap-2 rounded-xl border-2 bg-surface p-2 ${p.id === pinned ? 'border-rose-500' : 'border-slate-200'}`}>
          {p.cover_url && <img src={p.cover_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />}
          <div className="min-w-0 flex-1">
            {p.id === pinned && <p className="text-[10px] font-bold text-rose-600">📌 {t('live.pinned')}</p>}
            <Link to={`/products/${p.id}`} className="block truncate text-sm font-semibold hover:underline">{p.title}</Link>
            <p className="text-sm font-bold text-brand-700 ltr-nums">{price(p.price)}</p>
            {isHost ? (
              <button type="button" className="text-xs font-semibold text-rose-700" onClick={() => onPin(p.id === pinned ? null : p.id)}>{p.id === pinned ? t('live.unpin') : `📌 ${t('live.pin')}`}</button>
            ) : p.availability === 'sold' ? <span className="text-xs text-rose-600">{t('common.sold')}</span> : (
              <Link to={`/checkout/${p.id}?live=${liveId}`} className="mt-0.5 inline-block rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-ink hover:bg-gold-500">🛒 {t('live.order')}</Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Upload the recording made on the host's device (only if the host agreed before the live). */
async function uploadRecording(liveId, blob, ext, onProgress) {
  const { token, pathname, contentType } = await api(`/live/${liveId}/recording-token`, { method: 'POST', body: { ext } });
  const res = await put(pathname, blob, { access: 'public', token, contentType, multipart: true, onUploadProgress: (e) => onProgress?.(Math.round(e.percentage)) });
  await api(`/live/${liveId}/recording`, { method: 'POST', body: { url: res.url } });
}

export function LiveRoom() {
  const { id } = useParams();
  const { t, number, lang } = useI18n();
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(`/live/${id}`, undefined, [id, user?.id]);
  const video = useRef(null);
  const session = useRef(null);
  const recorder = useRef(null);
  const [cam, setCam] = useState(null);
  const [facing, setFacing] = useState('user');
  const [state, setState] = useState('idle');
  const [poll, setPoll] = useState(null);
  const [comments, setComments] = useState([]);
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState(null);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(0);
  const live = data?.live;
  const isHost = data?.isHost;
  useDocumentTitle(live?.title);

  const onPoll = (r) => {
    setPoll(r);
    if (r.comments?.length) setComments((c) => [...c, ...r.comments.filter((x) => !c.some((y) => y.id === x.id))].slice(-200));
    if (r.removedComments?.length) setComments((c) => c.filter((x) => !r.removedComments.includes(Number(x.id))));
  };

  // Everyone (also guests) follows the chat and viewer count; viewers also join the video tree.
  useEffect(() => {
    if (!live || live.status !== 'live' || isHost) return undefined;
    const s = new LiveSession({ liveId: live.id, role: 'viewer', onPoll, onState: setState, onStream: (st) => { if (video.current) { video.current.srcObject = st; video.current.play().catch(() => {}); } } });
    session.current = s;
    s.join().catch((err) => { setProblem(err); setState(err?.code === 'live_full' ? 'full' : err?.code === 'host_offline' ? 'hostOffline' : 'error'); });
    const leave = () => s.stop();
    window.addEventListener('pagehide', leave);
    return () => { window.removeEventListener('pagehide', leave); s.stop(); };
  }, [live?.id, live?.status, isHost]); // eslint-disable-line react-hooks/exhaustive-deps

  // Host: camera preview before going live.
  useEffect(() => {
    if (!isHost || !live || !['scheduled', 'live'].includes(live.status)) return undefined;
    let stream;
    let stop = false;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } }, audio: { echoCancellation: true, noiseSuppression: true } })
      .then((st) => {
        if (stop) { st.getTracks().forEach((tr) => tr.stop()); return; }
        stream = st; setCam(st);
        if (video.current) { video.current.srcObject = st; video.current.muted = true; video.current.play().catch(() => {}); }
        // Switching camera while live: give the new tracks to every child link.
        if (session.current) {
          session.current.stream = st;
          for (const pc of session.current.down.values()) {
            pc.getSenders().forEach((sn) => { const tr = st.getTracks().find((x) => x.kind === sn.track?.kind); if (tr) sn.replaceTrack(tr).catch(() => {}); });
          }
        }
      })
      .catch(() => setProblem({ code: 'camera_denied' }));
    return () => { stop = true; stream?.getTracks().forEach((tr) => tr.stop()); };
  }, [isHost, live?.id, live?.status, facing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => session.current?.stop(), []);

  if (loading) return <Spinner />;
  if (error) return <div className="container-page max-w-3xl py-8"><ErrorBox error={error} /></div>;

  const goLive = async () => {
    if (!cam) return;
    setBusy('start'); setProblem(null);
    try {
      const s = new LiveSession({ liveId: live.id, role: 'host', stream: cam, onPoll, onState: setState });
      session.current = s;
      await s.start();
      if (live.record) recorder.current = startRecorder(cam);
      reload();
    } catch (err) { setProblem(err); } finally { setBusy(''); }
  };
  const endLive = async () => {
    if (!window.confirm(t('live.endConfirm'))) return;
    setBusy('end');
    try {
      session.current?.stop(false);
      await api(`/live/${live.id}/end`, { method: 'POST' });
      cam?.getTracks().forEach((tr) => tr.stop());
      const rec = recorder.current;
      recorder.current = null;
      if (rec && live.record) {
        const blob = await rec.stop();
        if (blob.size) {
          setBusy('upload');
          await uploadRecording(live.id, blob, rec.ext, setProgress).catch(() => notify(t('live.uploadFailed')));
        }
      }
      notify(t('live.ended'));
      reload();
    } finally { setBusy(''); }
  };
  const postComment = async (text) => { const r = await api(`/live/${live.id}/comments`, { method: 'POST', body: { body: text } }); setComments((c) => [...c, r.comment]); };
  const delComment = async (c) => { await api(`/live/${live.id}/comments/${c.id}`, { method: 'DELETE' }); setComments((x) => x.filter((y) => y.id !== c.id)); };
  const mute = async (c) => { if (window.confirm(t('live.muteConfirm', { name: c.name }))) { await api(`/live/${live.id}/mute/${c.user_id}`, { method: 'POST' }); setComments((x) => x.filter((y) => y.user_id !== c.user_id)); } };
  const pin = async (productId) => { await api(`/live/${live.id}/pin`, { method: 'POST', body: { productId } }); setPoll((p) => ({ ...p, pinned: productId })); };
  const removeLive = async () => { if (window.confirm(t('live.deleteConfirm'))) { await api(`/live/${live.id}`, { method: 'DELETE' }); navigate('/live'); } };

  const status = poll?.status || live.status;
  const onAir = status === 'live';
  const viewers = poll?.viewers ?? live.viewers;
  const stateText = {
    connecting: t('live.connecting'), reconnecting: t('live.reconnecting'), waiting: t('live.connecting'), full: t('live.full'),
    hostOffline: t('live.hostOffline'), error: t('live.cantConnect'), ended: t('live.endedShort'), removed: t('live.removedShort'),
  }[state];

  return (
    <div className="container-page max-w-6xl py-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl bg-black">
            {live.status === 'ended' && live.recording_url
              ? <video src={live.recording_url} controls playsInline className="aspect-video w-full" />
              : <video ref={video} playsInline autoPlay muted={isHost} controls={!isHost && onAir} className={`aspect-video w-full object-cover ${isHost && facing === 'user' ? '-scale-x-100' : ''}`} />}
            <div className="absolute start-3 top-3 flex items-center gap-2">
              <LiveBadge status={status} viewers={onAir ? viewers : undefined} />
              {onAir && live.record && <span className="badge bg-black/60 text-white">⏺ {t('live.recording')}</span>}
            </div>
            {!isHost && stateText && onAir && state !== 'watching' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-6 text-center text-white">{stateText}</div>
            )}
            {!onAir && !(live.status === 'ended' && live.recording_url) && !isHost && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-900 to-rose-900 p-6 text-center text-white">
                {live.status === 'scheduled'
                  ? <><p className="text-lg font-bold">🗓 {t('live.startsAt')}</p><p>{whenText(live.scheduled_at, lang, 'full')}</p></>
                  : <p className="text-lg font-bold">{t(`live.status.${live.status}`)}</p>}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-start gap-3">
            <Avatar name={live.store_name || live.host_name} url={live.store_logo || live.host_avatar} size="h-11 w-11" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold">{live.title}</h1>
              <Link to={live.store_slug ? `/stores/${live.store_slug}` : `/users/${live.host_id}`} className="flex items-center gap-1 text-sm text-slate-600 hover:underline">{live.store_name || live.host_name}{live.host_verified && <VerifiedBadge small />}</Link>
              {live.description && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{live.description}</p>}
            </div>
            {!isHost && <FollowButton userId={live.host_id} />}
            {!isHost && user && <button type="button" className="btn-ghost px-2 text-sm" onClick={() => setReport({ type: 'live', id: live.id })}>🚩</button>}
          </div>

          {isHost && (
            <div className="card space-y-3 p-4">
              <ErrorBox error={problem} />
              {['scheduled', 'live'].includes(live.status) && (
                <div className="flex flex-wrap gap-2">
                  {!onAir && <button type="button" className="btn flex-1 rounded-xl bg-rose-600 py-3 font-bold text-white hover:bg-rose-700" disabled={!cam || busy} onClick={goLive}>{busy === 'start' ? t('common.loading') : `● ${t('live.goLive')}`}</button>}
                  {onAir && <button type="button" className="btn flex-1 rounded-xl bg-ink py-3 font-bold text-white" disabled={Boolean(busy)} onClick={endLive}>{t('live.end')}</button>}
                  <button type="button" className="btn-outline" onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}>🔄 {t('live.switchCamera')}</button>
                </div>
              )}
              {onAir && <p className="text-sm text-slate-600">👁 {t('live.viewersNow', { n: number(viewers || 0) })} · {t('live.peak', { n: number(Math.max(live.peak_viewers, viewers || 0)) })}</p>}
              {busy === 'upload' && <p className="text-sm">⏫ {t('live.uploading')} <span className="ltr-nums">{progress}%</span></p>}
              {live.status === 'scheduled' && <p className="text-xs text-slate-500">ℹ️ {t('live.hostTips')}</p>}
              {['ended', 'cancelled', 'scheduled'].includes(live.status) && <button type="button" className="link text-sm text-rose-600" onClick={removeLive}>{t('live.delete')}</button>}
              {live.status === 'ended' && live.recording_url && <button type="button" className="link text-sm" onClick={async () => { await api(`/live/${live.id}/recording`, { method: 'DELETE' }); reload(); }}>{t('live.deleteRecording')}</button>}
            </div>
          )}

          <ProductsRail products={data.products} pinned={poll?.pinned} isHost={isHost} onPin={pin} liveId={live.id} />
        </div>

        <aside className="card flex h-[420px] flex-col overflow-hidden p-0 lg:h-[calc(100vh-140px)]">
          <h2 className="border-b border-slate-200 px-3 py-2 text-sm font-bold">💬 {t('live.chat')}</h2>
          <Chat live={live} comments={comments} canModerate={data.canModerate} disabled={!onAir || (poll ? !poll.commentsEnabled : !live.comments_enabled) || data.muted}
            onPost={postComment} onDelete={delComment} onMute={mute} onReport={(c) => setReport({ type: 'live_comment', id: c.id })} />
        </aside>
      </div>
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}
