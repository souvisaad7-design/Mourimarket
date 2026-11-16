import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, EmptyState, ErrorBox, Icon, Spinner } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

function Thread({ id, onActivity }) {
  const { t, price, dateTime } = useI18n();
  const { user, refreshCounts } = useApp();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true });
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottom = useRef();

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
  }, [id, refreshCounts]);

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
          ) : <span className="text-xs text-slate-400">{t('messages.deletedProduct')}</span>}
        </div>
        {c.product_cover && <img src={c.product_cover} alt="" className="h-10 w-12 rounded-lg object-cover" />}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
        {messages.map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${mine ? 'bg-brand-700 text-white' : 'bg-surface text-slate-800'}`}>
                <p className="whitespace-pre-line break-words">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-brand-100' : 'text-slate-400'}`}>
                  {dateTime(m.created_at)}{mine && m.read_at ? ' ✓✓' : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <textarea
          className="input min-h-[44px] flex-1 resize-none" rows={1} maxLength={2000} value={body}
          onChange={(e) => setBody(e.target.value)} placeholder={t('messages.placeholder')} aria-label={t('messages.placeholder')}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
        />
        <button className="btn-primary px-3" disabled={sending || !body.trim()} aria-label={t('common.send')}>
          <Icon name="send" className="h-5 w-5 rtl:-scale-x-100" />
        </button>
      </form>
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
        <div className="card grid h-[calc(100vh-13rem)] min-h-[420px] overflow-hidden md:grid-cols-[320px_1fr]">
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
                    <p className="truncate text-xs text-brand-700">{c.product_title || t('messages.deletedProduct')}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-xs ${c.unread ? 'text-slate-800' : 'text-slate-500'}`}>{c.last_message}</p>
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
