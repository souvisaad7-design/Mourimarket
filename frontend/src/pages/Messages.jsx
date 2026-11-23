import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, EmptyState, ErrorBox, Field, Icon, Modal, Spinner } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api, getToken } from '../lib/api.js';
import { compressImage } from '../lib/image.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

/** A private chat file (photo / voice note): fetched with the login token, shown from memory. */
function usePrivateFile(url) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let alive = true; let objectUrl = null;
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => { if (b && alive) { objectUrl = URL.createObjectURL(b); setSrc(objectUrl); } })
      .catch(() => {});
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);
  return src;
}

function ChatImage({ url }) {
  const src = usePrivateFile(url);
  const [open, setOpen] = useState(false);
  if (!src) return <div className="flex h-40 w-48 items-center justify-center rounded-xl bg-slate-200/60"><Spinner /></div>;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block overflow-hidden rounded-xl"><img src={src} alt="" className="max-h-64 max-w-[15rem] object-cover" /></button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <img src={src} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </>
  );
}

function ChatAudio({ url, duration }) {
  const src = usePrivateFile(url);
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true">🎤</span>
      {src ? <audio src={src} controls preload="metadata" className="h-9 w-56 max-w-full" aria-label={t('chat.voiceNote')} /> : <Spinner />}
      {duration ? <span className="text-[11px] opacity-75 ltr-nums">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</span> : null}
    </div>
  );
}

const OFFER_STYLE = { pending: 'bg-gold-300/40 text-brand-900', accepted: 'bg-emerald-100 text-emerald-800', declined: 'bg-rose-100 text-rose-700', countered: 'bg-slate-200 text-slate-700', withdrawn: 'bg-slate-200 text-slate-500', superseded: 'bg-slate-200 text-slate-500' };

/** A price offer in the conversation, with the buttons the other person needs. */
function OfferCard({ m, mine, conversationId, onChange, onCounter }) {
  const { t, price } = useI18n();
  const [busy, setBusy] = useState('');
  const act = async (action) => {
    setBusy(action);
    try { await api(`/conversations/${conversationId}/offers/${m.id}`, { method: 'POST', body: { action } }); onChange(); } catch { onChange(); } finally { setBusy(''); }
  };
  const open = m.offer_status === 'pending';
  return (
    <div className="min-w-[13rem] space-y-2">
      <p className={`text-xs font-semibold ${mine ? 'text-white/80' : 'text-slate-500'}`}>💰 {mine ? t('chat.youOffered') : t('chat.theyOffered')}</p>
      <p className="text-2xl font-bold ltr-nums">{price(m.amount)}</p>
      <span className={`badge ${OFFER_STYLE[m.offer_status] || ''}`}>{t(`chat.offerStatus.${m.offer_status}`)}</span>
      {open && !mine && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button type="button" className="btn-primary px-3 py-1.5 text-xs" disabled={Boolean(busy)} onClick={() => act('accept')}>{t('chat.accept')}</button>
          <button type="button" className="btn-accent px-3 py-1.5 text-xs" disabled={Boolean(busy)} onClick={() => onCounter(m)}>{t('chat.counter')}</button>
          <button type="button" className="btn-outline px-3 py-1.5 text-xs" disabled={Boolean(busy)} onClick={() => act('decline')}>{t('chat.decline')}</button>
        </div>
      )}
      {open && mine && <button type="button" className="text-xs underline opacity-80" disabled={Boolean(busy)} onClick={() => act('withdraw')}>{t('chat.withdraw')}</button>}
    </div>
  );
}

/** Ask for an amount (new offer or counter-offer). */
function OfferDialog({ open, onClose, onSubmit, initial, title, reference }) {
  const { t, price } = useI18n();
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { if (open) { setAmount(initial ? String(initial) : ''); setError(null); } }, [open, initial]);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await onSubmit(Number(amount)); onClose(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={submit} className="space-y-3">
        {reference ? <p className="text-sm text-slate-600">{t('chat.askedPrice')}: <strong className="ltr-nums">{price(reference)}</strong></p> : null}
        <Field label={t('chat.yourPrice')}>
          <div className="flex items-center gap-2"><input className="input text-lg" type="number" min="1" inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus /><span className="text-sm text-slate-500">MRU</span></div>
        </Field>
        <ErrorBox error={error} />
        <button className="btn-primary w-full" disabled={busy || !(Number(amount) > 0)}>💰 {t('chat.sendOffer')}</button>
      </form>
    </Modal>
  );
}

/** Hold-free voice recording: tap to start, tap to send (max 2 minutes). */
function useRecorder(onDone) {
  const [state, setState] = useState({ recording: false, seconds: 0 });
  const rec = useRef(null);
  const timer = useRef(null);
  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => window.MediaRecorder?.isTypeSupported?.(m)) || '';
    const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks = [];
    const began = Date.now();
    r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    r.onstop = () => {
      stream.getTracks().forEach((tr) => tr.stop());
      clearInterval(timer.current);
      const seconds = Math.round((Date.now() - began) / 1000);
      setState({ recording: false, seconds: 0 });
      if (!r.cancelled && chunks.length && seconds >= 1) onDone(new Blob(chunks, { type: r.mimeType || 'audio/webm' }), seconds);
    };
    r.start();
    rec.current = r;
    setState({ recording: true, seconds: 0 });
    timer.current = setInterval(() => setState((s) => {
      if (s.seconds + 1 >= 120) rec.current?.stop();
      return { ...s, seconds: s.seconds + 1 };
    }), 1000);
  };
  const stop = () => rec.current?.state === 'recording' && rec.current.stop();
  const cancel = () => { if (rec.current) { rec.current.cancelled = true; stop(); } };
  useEffect(() => () => { clearInterval(timer.current); cancel(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, start, stop, cancel, supported: typeof window !== 'undefined' && Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia) };
}

function Thread({ id, onActivity }) {
  const { t, price, dateTime } = useI18n();
  const { user, refreshCounts } = useApp();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true });
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [tick, setTick] = useState(0);
  const [offerFor, setOfferFor] = useState(null); // null | { counter: message } | { new: true }
  const photo = useRef();
  const bottom = useRef();
  const refresh = () => setTick((n) => n + 1);
  const append = (message) => { setState((s) => ({ ...s, messages: [...s.messages, message], changed: true, sendError: null })); onActivity(); };
  const sendMedia = async (blob, name, duration) => {
    const fd = new FormData();
    fd.append('file', blob, name);
    if (duration) fd.append('duration', String(duration));
    setSending(true);
    try { const { message } = await api(`/conversations/${id}/media`, { method: 'POST', body: fd }); append(message); } catch (error) { setState((s) => ({ ...s, sendError: error })); } finally { setSending(false); }
  };
  const recorder = useRecorder((blob, seconds) => sendMedia(blob, `voice.${blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'}`, seconds));
  const pickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const small = (await compressImage(file).catch(() => null))?.file || file;
    sendMedia(small, small.name || 'photo.webp');
  };
  const startRecording = () => recorder.start().catch(() => setState((s) => ({ ...s, sendError: { code: 'mic_denied' } })));

  useEffect(() => {
    let cancelled = false;
    const load = (initial) => api(`/conversations/${id}`)
      .then((d) => {
        if (cancelled) return;
        setState((s) => ({ ...d, loading: false, changed: initial || d.messages.length !== s.messages?.length }));
        refreshCounts();
      })
      .catch((error) => !cancelled && setState({ loading: false, error }));
    load(true);
    // Simple polling keeps the thread fresh without websockets.
    const timer = setInterval(() => load(false), 8000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [id, refreshCounts, tick]);

  useEffect(() => {
    if (state.changed) bottom.current?.scrollIntoView({ block: 'end' });
  }, [state.messages?.length, state.changed]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const { message } = await api(`/conversations/${id}/messages`, { method: 'POST', body: { body } });
      setState((s) => ({ ...s, messages: [...s.messages, message], changed: true }));
      setBody('');
      onActivity();
    } catch (error) {
      setState((s) => ({ ...s, sendError: error }));
    } finally { setSending(false); }
  };

  if (state.loading) return <Spinner />;
  if (state.error) return <div className="p-4"><ErrorBox error={state.error} /></div>;
  const { conversation: c, messages } = state;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 p-3">
        <button className="btn-ghost p-1.5 md:hidden" onClick={() => navigate('/messages')} aria-label={t('common.back')}>
          <Icon name="chevron" className="h-5 w-5 ltr:rotate-180" />
        </button>
        <Link to={`/users/${c.other_id}`}><Avatar name={c.other_name} size="h-10 w-10" /></Link>
        <div className="min-w-0 flex-1">
          <Link to={`/users/${c.other_id}`} className="block truncate font-semibold hover:underline">{c.other_name}</Link>
          {c.product_id ? (
            <Link to={`/products/${c.product_id}`} className="block truncate text-xs text-brand-700 hover:underline">
              {t('messages.about', { title: c.product_title })} · <span className="ltr-nums">{price(c.product_price)}</span>
            </Link>
          ) : c.wanted_id ? <Link to="/wanted" className="block truncate text-xs text-brand-700 hover:underline">🙋 {t('wanted.about', { title: c.wanted_title })}</Link>
            : <span className="text-xs text-slate-400">{t('messages.deletedProduct')}</span>}
        </div>
        {c.product_cover && <img src={c.product_cover} alt="" className="h-10 w-12 rounded-lg object-cover" />}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${mine ? 'bg-brand-700 text-white' : 'bg-surface text-slate-800'}`}>
                {m.kind === 'offer' ? <OfferCard m={m} mine={mine} conversationId={c.id} onChange={refresh} onCounter={(o) => setOfferFor({ counter: o })} />
                  : m.kind === 'image' ? <ChatImage url={`/api/conversations/${c.id}/files/${m.file_id}`} />
                    : m.kind === 'audio' ? <ChatAudio url={`/api/conversations/${c.id}/files/${m.file_id}`} duration={m.duration} />
                      : <p className="whitespace-pre-line break-words">{m.body}</p>}
                <p className={`mt-1 text-[10px] ${mine ? 'text-brand-100' : 'text-slate-400'}`}>
                  {dateTime(m.created_at)}{mine && m.read_at ? ' ✓✓' : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      {recorder.recording ? (
        <div className="flex items-center gap-3 border-t border-slate-200 bg-rose-50 p-3" role="status">
          <span className="h-3 w-3 animate-pulse rounded-full bg-rose-600" aria-hidden="true" />
          <span className="flex-1 text-sm font-semibold text-rose-700">{t('chat.recording')} <span className="ltr-nums">{Math.floor(recorder.seconds / 60)}:{String(recorder.seconds % 60).padStart(2, '0')}</span> / 2:00</span>
          <button type="button" className="btn-ghost text-sm" onClick={recorder.cancel}>{t('common.cancel')}</button>
          <button type="button" className="btn-primary px-3" onClick={recorder.stop} aria-label={t('common.send')}><Icon name="send" className="h-5 w-5 rtl:-scale-x-100" /></button>
        </div>
      ) : (
      <>
      <div className="flex gap-1.5 overflow-x-auto border-t border-slate-200 px-3 pt-2">
        {c.product_id && c.product_availability === 'available' && (
          <button type="button" className="btn-outline shrink-0 rounded-full border-gold-400 px-3 py-1.5 text-xs font-bold text-brand-800" onClick={() => setOfferFor({ new: true })}>💰 {t('chat.makeOffer')}</button>
        )}
        <button type="button" className="btn-outline shrink-0 rounded-full px-3 py-1.5 text-xs" onClick={() => photo.current?.click()} disabled={sending}>📷 {t('chat.photo')}</button>
        <input ref={photo} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
        {recorder.supported && <button type="button" className="btn-outline shrink-0 rounded-full px-3 py-1.5 text-xs" onClick={startRecording} disabled={sending}>🎤 {t('chat.voice')}</button>}
      </div>
      <form onSubmit={send} className="flex gap-2 p-3 pt-2">
        <textarea
          className="input min-h-[44px] flex-1 resize-none" rows={1} maxLength={2000} value={body}
          onChange={(e) => setBody(e.target.value)} placeholder={t('messages.placeholder')} aria-label={t('messages.placeholder')}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
        />
        <button className="btn-primary px-3" disabled={sending || !body.trim()} aria-label={t('common.send')}>
          <Icon name="send" className="h-5 w-5 rtl:-scale-x-100" />
        </button>
      </form>
      </>
      )}
      <OfferDialog open={Boolean(offerFor)} onClose={() => setOfferFor(null)}
        title={offerFor?.counter ? t('chat.counter') : t('chat.makeOffer')}
        initial={offerFor?.counter ? Number(offerFor.counter.amount) : Number(c.product_price) || ''}
        reference={c.product_price}
        onSubmit={async (amount) => {
          if (offerFor?.counter) await api(`/conversations/${c.id}/offers/${offerFor.counter.id}`, { method: 'POST', body: { action: 'counter', amount } });
          else await api(`/conversations/${c.id}/offers`, { method: 'POST', body: { amount } });
          refresh(); onActivity();
        }} />
      {state.sendError && <div className="px-3 pb-3"><ErrorBox error={state.sendError} /></div>}
    </div>
  );
}

export default function Messages() {
  const { id } = useParams();
  const { t, ago } = useI18n();
  const { data, loading, error, reload } = useApi('/conversations');
  useDocumentTitle(t('messages.title'));
  useEffect(() => {
    const timer = setInterval(reload, 15000);
    return () => clearInterval(timer);
  }, [reload]);

  return (
    <div className="container-page py-6">
      <h1 className="mb-4 text-2xl font-bold">{t('messages.title')}</h1>
      <ErrorBox error={error} />
      {loading && !data ? <Spinner /> : !data?.items?.length ? (
        <EmptyState icon="chat" title={t('messages.empty')}><Link to="/products" className="btn-primary">{t('nav.products')}</Link></EmptyState>
      ) : (
        <div className="card grid h-[calc(100dvh-21rem)] min-h-[240px] overflow-hidden sm:h-[calc(100vh-13rem)] sm:min-h-[420px] md:grid-cols-[320px_1fr]">
          <ul className={`overflow-y-auto border-slate-200 md:border-e ${id ? 'hidden md:block' : ''}`}>
            {data.items.map((c) => (
              <li key={c.id}>
                <Link to={`/messages/${c.id}`} className={`flex items-center gap-3 border-b border-slate-100 p-3 hover:bg-slate-50 ${String(c.id) === id ? 'bg-brand-50' : ''}`}>
                  <Avatar name={c.other_name} size="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm ${c.unread ? 'font-bold' : 'font-semibold'}`}>{c.other_name}</p>
                      <span className="shrink-0 text-[11px] text-slate-400">{ago(c.last_message_at)}</span>
                    </div>
                    <p className="truncate text-xs text-brand-700">{c.product_title || (c.wanted_title ? `🙋 ${c.wanted_title}` : t('messages.deletedProduct'))}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-xs ${c.unread ? 'text-slate-800' : 'text-slate-500'}`}>{c.last_kind && c.last_kind !== 'text' ? t(`chat.preview.${c.last_kind}`) : c.last_message}</p>
                      {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[11px] font-bold text-white">{c.unread}</span>}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <section className={`${id ? '' : 'hidden md:flex'} min-h-0 flex-col md:flex`}>
            {id ? <Thread key={id} id={id} onActivity={reload} /> : (
              <div className="flex flex-1 items-center justify-center text-slate-400">{t('messages.select')}</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
