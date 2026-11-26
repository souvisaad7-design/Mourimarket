// Souk AI hub: shopping assistant, search by photo, recommendations and price check.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard.jsx';
import { EmptyState, ErrorBox, Field, Icon } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useDocumentTitle } from '../lib/hooks.js';
import { compressImage } from '../lib/image.js';
import { clearSeen, personalizeOn, seenIds, setPersonalize } from '../lib/souk-ai.js';

const Dot = () => <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent align-middle" aria-hidden="true" />;

const TABS = [['assistant', '💬'], ['photo', '📷'], ['foryou', '🎯'], ['price', '💰']];

export function AiBadge({ className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-700 to-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white ${className}`}>✨ Souk AI</span>;
}

/** Shown in place of a feature that needs the AI service when it is off. */
function AiOff() {
  const { t } = useI18n();
  return <EmptyState icon="info" title={t('ai.off')} />;
}

function LoginFirst() {
  const { t } = useI18n();
  const location = useLocation();
  return (
    <EmptyState icon="user" title={t('ai.loginFirst')}>
      <Link to="/login" state={{ from: location.pathname + location.search }} className="btn-primary">{t('nav.login')}</Link>
    </EmptyState>
  );
}

// ---------- 💬 Shopping assistant ----------

const CHAT_KEY = 'sc_ai_chat';
const loadChat = () => { try { return JSON.parse(sessionStorage.getItem(CHAT_KEY)) || []; } catch { return []; } };

function Assistant() {
  const { t, lang } = useI18n();
  const [msgs, setMsgs] = useState(loadChat);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const end = useRef(null);
  useEffect(() => { try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(msgs.slice(-20))); } catch { /* ignore */ } }, [msgs]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [msgs, busy]);

  const send = async (q) => {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    const next = [...msgs, { role: 'user', text: question }];
    setMsgs(next); setText(''); setBusy(true); setError(null);
    try {
      const r = await api('/ai/assistant', {
        method: 'POST',
        body: { lang, messages: next.slice(-10).map((m) => ({ role: m.role, text: m.text.slice(0, 1500) })) },
      });
      setMsgs([...next, { role: 'assistant', text: r.reply || t('ai.noReply'), products: r.products, searched: r.searched, found: r.found }]);
      setRemaining(r.remaining);
    } catch (err) {
      setError(err);
      setMsgs(msgs); setText(question);
    } finally { setBusy(false); }
  };

  return (
    <div className="card flex flex-col p-0">
      <div className="max-h-[60vh] min-h-[280px] space-y-4 overflow-y-auto p-4" aria-live="polite">
        {!msgs.length && (
          <div className="space-y-3 py-4 text-center">
            <p className="text-lg font-bold">{t('ai.assistantHello')}</p>
            <p className="text-sm text-slate-500">{t('ai.assistantIntro')}</p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {t('ai.examples').split('|').map((ex) => (
                <button key={ex} type="button" className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm text-brand-800 hover:bg-brand-100" onClick={() => send(ex)}>{ex}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'space-y-3'}>
            <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-800'}`}>
              {m.text}
            </div>
            {m.role === 'assistant' && m.products?.length > 0 && <ProductGrid items={m.products} />}
            {m.role === 'assistant' && m.searched && !m.products?.length && (
              <p className="text-xs text-slate-500">🔎 {t('ai.nothingShown')} <Link to="/wanted" className="link">{t('ai.postWanted')}</Link></p>
            )}
          </div>
        ))}
        {busy && <p className="flex items-center gap-2 text-sm text-slate-500"><Dot /> {t('ai.thinking')}</p>}
        <div ref={end} />
      </div>
      <div className="border-t border-slate-200 p-3">
        <ErrorBox error={error} />
        <form className="mt-1 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input className="input flex-1" value={text} onChange={(e) => setText(e.target.value)} maxLength={1500} placeholder={t('ai.askPlaceholder')} aria-label={t('ai.askPlaceholder')} disabled={busy} />
          <button className="btn-primary px-4" disabled={busy || !text.trim()} aria-label={t('ai.send')}><Icon name="send" className="h-4 w-4" /></button>
        </form>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>{t('ai.disclaimer')}</span>
          <span className="flex items-center gap-3">
            {remaining !== null && <span>{t('ai.remaining', { n: remaining })}</span>}
            {msgs.length > 0 && <button type="button" className="link" onClick={() => { setMsgs([]); setError(null); }}>{t('ai.newChat')}</button>}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- 📷 Search by photo ----------

function PhotoSearch() {
  const { t, lang } = useI18n();
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = async (file) => {
    if (!file) return;
    setError(null); setResult(null); setBusy(true);
    try {
      const { file: small } = await compressImage(file, { maxWidth: 1024 });
      setPreview(URL.createObjectURL(small));
      const form = new FormData();
      form.append('image', small, small.name || 'photo.jpg');
      form.append('lang', lang);
      setResult(await api('/ai/visual-search', { method: 'POST', body: form }));
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="card flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-start">
        {preview ? <img src={preview} alt="" className="h-28 w-28 shrink-0 rounded-xl object-cover" /> : <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-5xl" aria-hidden="true">📷</span>}
        <div className="flex-1 space-y-2">
          <p className="font-bold">{t('ai.photoTitle')}</p>
          <p className="text-sm text-slate-500">{t('ai.photoHint')}</p>
          <label className={`btn-primary inline-flex cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            <Icon name="image" className="h-4 w-4" />{preview ? t('ai.photoAnother') : t('ai.photoPick')}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} disabled={busy} />
          </label>
        </div>
      </div>
      <ErrorBox error={error} />
      {busy && <ProductGridSkeleton count={4} />}
      {result && (
        <div className="space-y-3">
          <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm">🔎 {result.description}</p>
          {result.exact ? (
            <>
              <h3 className="font-bold">{t('ai.photoFound', { n: result.products.length })}</h3>
              <ProductGrid items={result.products} />
            </>
          ) : (
            <>
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{t('ai.photoNoMatch')} <Link to="/wanted" className="font-bold underline">{t('ai.postWanted')}</Link></p>
              {(result.products.length > 0 || result.related.length > 0) && (
                <>
                  <h3 className="font-bold">{t('ai.photoRelated')}</h3>
                  <ProductGrid items={result.products.length ? result.products : result.related} />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- 🎯 Recommendations ----------

export function Recommendations({ limit, compact = false }) {
  const { t } = useI18n();
  const { user } = useApp();
  const [on, setOn] = useState(personalizeOn);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let live = true;
    api('/ai/recommendations', { query: { seen: seenIds().join(','), personal: on ? '1' : '0' } })
      .then((d) => live && setData(d)).catch((e) => live && setError(e));
    return () => { live = false; };
  }, [on, user?.id]);
  const items = (data?.items || []).slice(0, limit || 12);
  if (compact) {
    if (!items.length || data?.basis !== 'personal') return null;
    return (
      <section aria-labelledby="for-you">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="for-you" className="flex items-center gap-2 text-xl font-bold">🎯 {t('ai.forYou')} <AiBadge /></h2>
          <Link to="/ai?tab=foryou" className="link text-sm">{t('ai.seeAll')}</Link>
        </div>
        <ProductGrid items={items} />
      </section>
    );
  }
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
        <p className="text-slate-600">{on ? t('ai.forYouHint') : t('ai.forYouOff')}</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={on} onChange={(e) => { setPersonalize(e.target.checked); setOn(e.target.checked); }} />
            {t('ai.personalize')}
          </label>
          {on && <button type="button" className="link text-xs" onClick={() => { clearSeen(); setOn(false); setTimeout(() => setOn(true)); }}>{t('ai.clearHistory')}</button>}
        </div>
      </div>
      <ErrorBox error={error} />
      {!data ? <ProductGridSkeleton count={8} /> : (
        <>
          <h3 className="font-bold">{data.basis === 'personal' ? t('ai.forYouTitle') : t('ai.popularTitle')}</h3>
          {items.length ? <ProductGrid items={items} /> : <EmptyState icon="grid" title={t('ai.noRecs')} />}
        </>
      )}
    </div>
  );
}

// ---------- 💰 Price check ----------

export function PriceHint({ stats, compact = false }) {
  const { t, price } = useI18n();
  const number = (v) => price(v).replace(/\s*MRU$/, ''); // same grouping as prices everywhere (1,150,000)
  if (!stats || stats.basis === 'none' || !stats.n) {
    return compact ? null : <p className="text-sm text-slate-500">{t('ai.priceNone')}</p>;
  }
  return (
    <div className={`rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}>
      <p className="font-bold">💰 {t('ai.priceRange', { low: number(stats.low), high: number(stats.high) })}</p>
      <p className="mt-1">{t('ai.priceMedian', { median: number(stats.median) })} · {t(stats.basis === 'similar' ? 'ai.priceBasisSimilar' : 'ai.priceBasisCategory', { n: stats.n })}{stats.confidence === 'low' ? ` · ${t('ai.priceLowConfidence')}` : ''}</p>
    </div>
  );
}

function PriceCheck() {
  const { t, lang } = useI18n();
  const { categories } = useApp();
  const [f, setF] = useState({ categoryId: '', q: '', condition: '' });
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { setStats(await api('/ai/price', { query: f })); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const name = (c) => c[`name_${lang}`] || c.name_ar;
  return (
    <form onSubmit={run} className="card space-y-4 p-5">
      <p className="text-sm text-slate-600">{t('ai.priceIntro')}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={t('form.category')}>
          <select className="input" required value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
            <option value="">—</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{name(c)}</option>)}
          </select>
        </Field>
        <Field label={t('ai.priceWhat')} optional><input className="input" value={f.q} maxLength={120} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder={t('ai.priceWhatPh')} /></Field>
        <Field label={t('form.condition')} optional>
          <select className="input" value={f.condition} onChange={(e) => setF({ ...f, condition: e.target.value })}>
            <option value="">—</option><option value="new">{t('common.new')}</option><option value="used">{t('common.used')}</option>
          </select>
        </Field>
      </div>
      <button className="btn-primary" disabled={busy || !f.categoryId}>{busy ? <Dot /> : '💰'} {t('ai.priceRun')}</button>
      <ErrorBox error={error} />
      {stats && <PriceHint stats={stats} />}
    </form>
  );
}

// ---------- Page ----------

export default function SoukAI() {
  const { t } = useI18n();
  const { user, meta } = useApp();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'assistant';
  useDocumentTitle('Souk AI');
  const ai = meta.ai || { features: {} };
  const needsAi = (feature, node) => (!ai.features?.[feature] ? <AiOff /> : !user ? <LoginFirst /> : node);
  return (
    <div className="container-page max-w-5xl py-6">
      <header className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-700 p-6 text-white">
        <p className="text-sm font-semibold text-gold-300">✨ Souk AI</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{t('ai.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">{t('ai.subtitle')}</p>
      </header>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
        {TABS.map(([k, emoji]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setParams({ tab: k }, { replace: true })}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === k ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <span aria-hidden="true">{emoji}</span> {t(`ai.tabs.${k}`)}
          </button>
        ))}
      </div>
      {tab === 'assistant' && needsAi('assistant', <Assistant />)}
      {tab === 'photo' && needsAi('visual', <PhotoSearch />)}
      {tab === 'foryou' && <Recommendations />}
      {tab === 'price' && <PriceCheck />}
    </div>
  );
}

/** Home-page invitation to try Souk AI. */
export function AiPromo() {
  const { t } = useI18n();
  const { meta } = useApp();
  if (!meta.ai?.enabled) return null;
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-700 p-5 text-white sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gold-300">✨ Souk AI</p>
          <h2 className="mt-1 text-lg font-bold sm:text-xl">{t('ai.promoTitle')}</h2>
          <p className="mt-1 text-sm text-white/80">{t('ai.promoText')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/ai" className="btn rounded-full bg-gold-400 px-4 text-ink hover:bg-gold-500">💬 {t('ai.tabs.assistant')}</Link>
          {meta.ai.features?.visual && <Link to="/ai?tab=photo" className="btn rounded-full border-2 border-white/60 px-4 text-white hover:bg-white/10">📷 {t('ai.tabs.photo')}</Link>}
        </div>
      </div>
    </section>
  );
}

/** Floating ✨ button that opens Souk AI (hidden where it would cover page actions). */
export function AiFab() {
  const { meta } = useApp();
  const { t } = useI18n();
  const { pathname } = useLocation();
  if (!meta.ai?.enabled || pathname.startsWith('/ai') || pathname.startsWith('/messages') || pathname.startsWith('/sell') || /\/edit$/.test(pathname)) return null;
  const onListing = /^\/products\/\d+$/.test(pathname);
  return (
    <Link to="/ai" aria-label="Souk AI" title={t('ai.fabTitle')}
      className={`fixed end-4 z-30 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-700 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-xl transition hover:scale-105 ${onListing ? 'bottom-24 sm:bottom-6' : 'bottom-20 sm:bottom-6'}`}>
      <span aria-hidden="true">✨</span><span className="hidden sm:inline">Souk AI</span>
    </Link>
  );
}

