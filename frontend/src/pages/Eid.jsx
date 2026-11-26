// Seasonal "Eid sheep market" (سوق الأضاحي): livestock listings fit for Eid al-Adha, with filters that
// matter for a sacrifice (animal, weight, city, budget), a countdown to Eid and a short buyer's guide.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard.jsx';
import { CitySelect, EmptyState, ErrorBox } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

/** Home-page banner while the Eid market is on. */
export function EidBanner() {
  const { t, number } = useI18n();
  const { meta } = useApp();
  if (!meta.eid) return null;
  const d = meta.eid.daysLeft;
  return (
    <Link to="/eid" className="flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-l from-amber-500 via-amber-600 to-brand-800 p-5 text-white shadow-lg transition hover:brightness-105">
      <span className="text-5xl" aria-hidden="true">🐑</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-bold">{t('eid.title')}</span>
        <span className="block text-sm text-white/90">{d > 0 ? t('eid.daysLeft', { n: number(d) }) : d === 0 ? t('eid.today') : t('eid.subtitle')}</span>
      </span>
      <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-700">{t('eid.browse')}</span>
    </Link>
  );
}

export default function Eid() {
  const { t, number } = useI18n();
  const { meta } = useApp();
  const [f, setF] = useState({ animal: 'sheep', city: '', maxPrice: '', minWeight: '' });
  useDocumentTitle(t('eid.title'));
  const params = new URLSearchParams({ category: 'livestock', sort: 'price_asc', limit: '40' });
  if (f.animal) params.set('a.animal', f.animal);
  if (f.city) params.set('city', f.city);
  if (f.maxPrice) params.set('maxPrice', f.maxPrice);
  if (f.minWeight) params.set('a.weightKg.min', f.minWeight);
  const list = useApi(`/products?${params}`, undefined, [params.toString()]);
  const d = meta.eid?.daysLeft;
  return (
    <div className="container-page max-w-6xl space-y-5 py-6">
      <header className="flex flex-wrap items-center gap-4 rounded-3xl bg-gradient-to-l from-amber-500 via-amber-600 to-brand-800 p-6 text-white">
        <span className="text-6xl" aria-hidden="true">🐑</span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{t('eid.title')}</h1>
          <p className="mt-1 text-sm text-white/90">{t('eid.subtitle')}</p>
          {d > 0 && <p className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-bold">⏳ {t('eid.daysLeft', { n: number(d) })}</p>}
        </div>
        <Link to="/sell?category=livestock" className="btn rounded-full bg-white px-5 font-bold text-amber-700 hover:bg-amber-50">+ {t('eid.sell')}</Link>
      </header>

      <div className="card grid gap-3 p-4 sm:grid-cols-4">
        <div className="flex gap-1.5 sm:col-span-4" role="radiogroup" aria-label={t('attrs.animal')}>
          {['sheep', 'goat', 'cow', 'camel', ''].map((a) => (
            <button key={a || 'all'} type="button" role="radio" aria-checked={f.animal === a} onClick={() => setF({ ...f, animal: a })}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${f.animal === a ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {a ? t(`attrs.opts.animal.${a}`) : t('eid.allAnimals')}
            </button>
          ))}
        </div>
        <CitySelect value={f.city} onChange={(v) => setF({ ...f, city: v })} cities={meta.cities} placeholder={t('common.allCities')} />
        <input className="input" type="number" min="0" inputMode="numeric" dir="ltr" placeholder={t('eid.maxPrice')} value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: e.target.value })} aria-label={t('eid.maxPrice')} />
        <input className="input" type="number" min="0" inputMode="numeric" dir="ltr" placeholder={t('eid.minWeight')} value={f.minWeight} onChange={(e) => setF({ ...f, minWeight: e.target.value })} aria-label={t('eid.minWeight')} />
        <button type="button" className="btn-ghost text-sm" onClick={() => setF({ animal: 'sheep', city: '', maxPrice: '', minWeight: '' })}>{t('eid.reset')}</button>
      </div>

      <ErrorBox error={list.error} />
      {list.loading ? <ProductGridSkeleton /> : list.data?.items?.length ? (
        <>
          <p className="text-sm text-slate-500">{t('eid.count', { n: number(list.data.total) })}</p>
          <ProductGrid items={list.data.items} />
        </>
      ) : (
        <EmptyState icon="search" title={t('eid.none')}>
          <Link to="/wanted" className="btn-outline rounded-full">🙋 {t('eid.postWanted')}</Link>
        </EmptyState>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-2 p-5 text-sm leading-relaxed">
          <h2 className="text-lg font-bold">📋 {t('eid.guideTitle')}</h2>
          <ul className="ms-5 list-disc space-y-1">{t('eid.guide').split('|').map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="text-xs text-slate-500">{t('eid.guideNote')}</p>
        </div>
        <div className="card space-y-2 p-5 text-sm leading-relaxed">
          <h2 className="text-lg font-bold">🛡️ {t('eid.safetyTitle')}</h2>
          <ul className="ms-5 list-disc space-y-1">{t('eid.safety').split('|').map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </section>
    </div>
  );
}
