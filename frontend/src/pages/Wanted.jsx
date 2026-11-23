// "Wanted" ads: buyers say what they are looking for, sellers who have it answer.
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar, CategoryIcon, CitySelect, EmptyState, ErrorBox, Field, Icon, Modal, Pagination, Spinner, useCityName, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

function NewWanted({ open, onClose, onDone }) {
  const { t, tl } = useI18n();
  const { categories, meta, user } = useApp();
  const [f, setF] = useState({ title: '', description: '', categoryId: '', city: user?.city || '', budget: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = useFieldError(error);
  const set = (k) => (e) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await api('/wanted', { method: 'POST', body: f }); onDone(); onClose(); setF({ ...f, title: '', description: '', budget: '' }); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={t('wanted.new')} size="lg">
      <form onSubmit={submit} className="space-y-3">
        <Field label={t('wanted.what')} error={fieldError('title')}><input className="input" value={f.title} onChange={set('title')} maxLength={140} placeholder={t('wanted.whatPh')} required /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t('form.category')} optional>
            <select className="input" value={f.categoryId} onChange={set('categoryId')}>
              <option value="">{t('form.choose')}</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{tl(c)}</option>)}
            </select>
          </Field>
          <Field label={t('form.city')} optional><CitySelect value={f.city} onChange={set('city')} cities={meta.cities} placeholder={t('common.allCities')} /></Field>
          <Field label={t('wanted.budget')} optional error={fieldError('budget')}><input className="input" type="number" min="0" inputMode="numeric" dir="ltr" value={f.budget} onChange={set('budget')} placeholder="MRU" /></Field>
        </div>
        <Field label={t('wanted.details')} optional><textarea className="input" rows={3} maxLength={2000} value={f.description} onChange={set('description')} placeholder={t('wanted.detailsPh')} /></Field>
        <ErrorBox error={error} />
        <button className="btn-primary w-full" disabled={busy}><Icon name="check" className="h-4 w-4" />{t('wanted.publish')}</button>
        <p className="text-center text-xs text-slate-500">{t('wanted.publishHint')}</p>
      </form>
    </Modal>
  );
}

function ReplyDialog({ ad, onClose }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!ad) return null;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { const { conversationId } = await api(`/wanted/${ad.id}/reply`, { method: 'POST', body: { body } }); navigate(`/messages/${conversationId}`); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t('wanted.iHaveIt')}>
      <form onSubmit={submit} className="space-y-3">
        <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold">{ad.title}</p>
        <textarea className="input" rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('wanted.replyPh')} required aria-label={t('wanted.replyPh')} />
        <ErrorBox error={error} />
        <button className="btn-primary w-full" disabled={busy || !body.trim()}><Icon name="send" className="h-4 w-4 rtl:-scale-x-100" />{t('common.send')}</button>
      </form>
    </Modal>
  );
}

function WantedCard({ w, mine, onChange, onReply }) {
  const { t, tl, price, ago } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const setStatus = async (status) => { await api(`/wanted/${w.id}`, { method: 'PATCH', body: { status } }); onChange(); };
  const remove = async () => { await api(`/wanted/${w.id}`, { method: 'DELETE' }); onChange(); };
  const cat = w.category_slug ? { name_ar: w.category_name_ar, name_fr: w.category_name_fr, name_en: w.category_name_en } : null;
  const expired = new Date(w.expires_at) < new Date();
  return (
    <li className={`card flex flex-col gap-3 p-4 ${w.status !== 'active' || expired ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-300/30 text-2xl" aria-hidden="true">{w.category_icon ? <CategoryIcon icon={w.category_icon} /> : '🙋'}</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug">{w.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{[cat && tl(cat), w.city && cityName(meta.cities, w.city), ago(w.created_at)].filter(Boolean).join(' · ')}</p>
        </div>
        {w.budget != null && <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 ltr-nums">≤ {price(w.budget)}</span>}
      </div>
      {w.description && <p className="whitespace-pre-line text-sm text-slate-700">{w.description}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="flex items-center gap-2 text-xs text-slate-500"><Avatar name={w.user_name} url={w.user_avatar} size="h-6 w-6" />{w.user_name} · {t('wanted.replies', { n: w.replies })}</span>
        {mine ? (
          <div className="flex gap-1.5">
            {w.status === 'active' && !expired
              ? <button className="btn-outline px-3 py-1.5 text-xs" onClick={() => setStatus('closed')}>✓ {t('wanted.found')}</button>
              : <button className="btn-outline px-3 py-1.5 text-xs" onClick={() => setStatus('active')}>{t('wanted.renew')}</button>}
            <button className="btn-ghost p-1.5 text-rose-600" onClick={remove} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
          </div>
        ) : <button className="btn-primary px-3 py-1.5 text-sm" onClick={() => onReply(w)}>🙋 {t('wanted.iHaveIt')}</button>}
      </div>
    </li>
  );
}

export default function Wanted() {
  const { t, tl, number } = useI18n();
  const { user, categories, meta } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const mine = params.get('mine') === '1';
  const page = Number(params.get('page')) || 1;
  const q = new URLSearchParams({ page, ...(mine ? { mine: '1' } : {}), ...['category', 'city', 'q'].reduce((o, k) => (params.get(k) ? { ...o, [k]: params.get(k) } : o), {}) });
  const { data, loading, error, reload } = useApi(`/wanted?${q}`);
  const [creating, setCreating] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  useDocumentTitle(t('wanted.title'));
  const update = (patch) => { const n = new URLSearchParams(params); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); n.delete('page'); setParams(n); };
  const needLogin = (fn) => (user ? fn() : navigate('/login', { state: { from: location.pathname + location.search } }));

  return (
    <div className="container-page py-6">
      <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-5 text-white sm:p-7">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">🙋 {t('wanted.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-white/80">{t('wanted.intro')}</p>
        <button className="btn-accent mt-4" onClick={() => needLogin(() => setCreating(true))}><Icon name="plus" className="h-4 w-4" />{t('wanted.new')}</button>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="tablist" className="flex rounded-xl bg-slate-100 p-1">
          <button role="tab" aria-selected={!mine} onClick={() => update({ mine: '' })} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${!mine ? 'bg-surface shadow' : 'text-slate-600'}`}>{t('wanted.all')}</button>
          {user && <button role="tab" aria-selected={mine} onClick={() => update({ mine: '1' })} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mine ? 'bg-surface shadow' : 'text-slate-600'}`}>{t('wanted.mine')}</button>}
        </div>
        {!mine && (
          <>
            <select className="input w-auto" value={params.get('category') || ''} onChange={(e) => update({ category: e.target.value })} aria-label={t('form.category')}>
              <option value="">{t('common.allCategories')}</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{tl(c)}</option>)}
            </select>
            <CitySelect value={params.get('city') || ''} onChange={(v) => update({ city: v })} cities={meta.cities} placeholder={t('common.allCities')} className="input w-auto" aria-label={t('form.city')} />
          </>
        )}
        {data && <span className="text-sm text-slate-500">{t('common.results', { n: number(data.total) })}</span>}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? (
        <EmptyState icon="search" title={mine ? t('wanted.emptyMine') : t('wanted.empty')}>
          <button className="btn-primary mt-3" onClick={() => needLogin(() => setCreating(true))}>{t('wanted.new')}</button>
        </EmptyState>
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((w) => <WantedCard key={w.id} w={w} mine={user?.id === w.user_id} onChange={reload} onReply={(ad) => needLogin(() => setReplyTo(ad))} />)}
          </ul>
          <Pagination page={page} total={data.total} limit={data.limit} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n); }} />
        </>
      )}
      <NewWanted open={creating} onClose={() => setCreating(false)} onDone={() => { update({ mine: '1' }); reload(); }} />
      <ReplyDialog ad={replyTo} onClose={() => setReplyTo(null)} />
      <p className="mt-6 text-center text-xs text-slate-500"><Link to="/safety" className="link">{t('wanted.safety')}</Link></p>
    </div>
  );
}
