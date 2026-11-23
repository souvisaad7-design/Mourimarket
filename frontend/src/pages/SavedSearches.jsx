// "Notify me" for a search, and the page listing the saved searches.
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EmptyState, ErrorBox, Icon, PageHeader, Spinner, useCityName } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export const ALERT_KEYS = ['q', 'category', 'city', 'minPrice', 'maxPrice', 'condition'];

/** "Hilux · Nouakchott · ≤ 400,000 MRU" */
export function useSearchLabel() {
  const { t, tl, price } = useI18n();
  const { categories, meta } = useApp();
  const cityName = useCityName();
  return (f) => {
    const cat = categories.find((c) => c.slug === f.category);
    return [
      f.q && `«${f.q}»`,
      cat && tl(cat),
      f.city && cityName(meta.cities, f.city),
      f.minPrice != null && f.minPrice !== '' && f.maxPrice != null && f.maxPrice !== '' ? `${price(f.minPrice)} – ${price(f.maxPrice)}`
        : f.minPrice != null && f.minPrice !== '' ? `≥ ${price(f.minPrice)}`
          : f.maxPrice != null && f.maxPrice !== '' ? `≤ ${price(f.maxPrice)}` : null,
      f.condition && t(`common.${f.condition}`),
    ].filter(Boolean).join(' · ');
  };
}

/** Button on the results page: save the current filters as an alert. */
export function SaveSearchButton({ filters }) {
  const { t } = useI18n();
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const label = useSearchLabel();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const f = Object.fromEntries(ALERT_KEYS.filter((k) => filters[k]).map((k) => [k, filters[k]]));
  if (!Object.keys(f).length) return null;
  const save = async () => {
    if (!user) return navigate('/login', { state: { from: location.pathname + location.search } });
    setBusy(true);
    try {
      await api('/saved-searches', { method: 'POST', body: { name: label(f).slice(0, 120) || t('alerts.search'), filters: f } });
      setDone(true);
      notify(t('alerts.saved'));
    } catch (err) { notify(err.code === 'too_many_saved_searches' ? t('errors.too_many_saved_searches') : t('common.error')); } finally { setBusy(false); }
  };
  return done ? (
    <Link to="/saved-searches" className="btn-outline border-brand-600 text-brand-700"><Icon name="check" className="h-4 w-4" />{t('alerts.on')}</Link>
  ) : (
    <button type="button" className="btn-accent" onClick={save} disabled={busy}><Icon name="bell" className="h-4 w-4" />{t('alerts.notifyMe')}</button>
  );
}

export default function SavedSearches() {
  const { t, ago, number } = useI18n();
  const label = useSearchLabel();
  const { data, loading, error, reload } = useApi('/saved-searches');
  useDocumentTitle(t('alerts.title'));
  const toggle = async (s) => { await api(`/saved-searches/${s.id}`, { method: 'PATCH', body: { isActive: !s.is_active } }); reload(); };
  const remove = async (s) => { await api(`/saved-searches/${s.id}`, { method: 'DELETE' }); reload(); };
  const link = (f) => `/products?${new URLSearchParams(Object.entries(f).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, String(v)]))}`;
  return (
    <div className="container-page max-w-3xl py-8">
      <PageHeader title={t('alerts.title')} />
      <p className="mb-4 text-sm text-slate-600">{t('alerts.intro')}</p>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? (
        <EmptyState icon="bell" title={t('alerts.empty')}>
          <Link to="/products" className="btn-primary mt-3">{t('alerts.start')}</Link>
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {data.items.map((s) => (
            <li key={s.id} className={`card flex flex-wrap items-center gap-3 p-4 ${s.is_active ? '' : 'opacity-60'}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800"><Icon name="search" className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{label(s.filters) || s.name}</p>
                <p className="text-xs text-slate-500">
                  {s.is_active ? t('alerts.active') : t('alerts.paused')}
                  {s.hits > 0 && ` · ${t('alerts.hits', { n: number(s.hits) })}`}{s.last_hit_at && ` · ${ago(s.last_hit_at)}`}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Link to={link(s.filters)} className="btn-outline px-3 py-1.5 text-xs">{t('alerts.view')}</Link>
                <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => toggle(s)}>{s.is_active ? t('alerts.pause') : t('alerts.resume')}</button>
                <button className="btn-ghost p-1.5 text-rose-600" onClick={() => remove(s)} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
