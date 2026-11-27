import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard.jsx';
import { CategoryIcon, CitySelect, EmptyState, ErrorBox, Icon, Pagination } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import LocationBar from '../components/LocationBar.jsx';
import MapView, { MAURITANIA } from '../components/MapView.jsx';
import { useGeo } from '../context/LocationContext.jsx';
import { SaveSearchButton } from './SavedSearches.jsx';
import { AttributeFilters } from '../components/Attributes.jsx';
import { useModule } from '../lib/modules.js';

// `near` is the radius in km around the visitor; their position itself never goes in the URL.
const FILTER_KEYS = ['q', 'category', 'city', 'minPrice', 'maxPrice', 'condition', 'sort', 'availability', 'featured', 'deals', 'swap', 'near', 'view', 'page'];
const RADII = ['2', '5', '10', '25', '50'];

/** All listings + search results. Every filter lives in the URL so results are shareable. */
export default function Products() {
  const barterOn = useModule('barter');
  const livestockOn = useModule('livestock');
  const { t, tl, number } = useI18n();
  const { categories, meta } = useApp();
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Category details filters live in the URL too: a.brand, a.year.min, a.mileage.max …
  const readParams = () => ({
    ...Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])),
    ...Object.fromEntries([...params.keys()].filter((k) => k.startsWith('a.')).map((k) => [k, params.get(k) || ''])),
  });
  const current = readParams();
  const [draft, setDraft] = useState(current);
  useEffect(() => { setDraft(readParams()); }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const { query: here } = useGeo();
  const near = here ? current.near : '';
  const mapView = current.view === 'map';
  const apiParams = new URLSearchParams({ limit: mapView ? '60' : '24' });
  for (const k of Object.keys(current)) if (current[k] && !['near', 'view'].includes(k)) apiParams.set(k, current[k]);
  if (here) { apiParams.set('lat', here.lat); apiParams.set('lng', here.lng); }
  if (near) {
    apiParams.set('radius', near);
    if (!current.sort) apiParams.set('sort', 'distance');
  }
  if (current.sort === 'distance' && !here) apiParams.delete('sort');
  const { data, loading, error } = useApi(`/products?${apiParams}`);

  const category = categories.find((c) => c.slug === current.category);
  const title = current.q ? t('products.searchFor', { q: current.q })
    : current.featured ? t('home.featured')
    : current.deals ? `🔥 ${t('nav.offers')}`
    : near ? t('geo.nearTitle', { km: near })
    : category ? tl(category) : t('products.title');
  useDocumentTitle(title);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const applyDraft = (e) => {
    e?.preventDefault();
    update({ ...draft, page: '' });
    setShowFilters(false);
  };

  const filters = (
    <form onSubmit={applyDraft} className="card space-y-4 p-4">
      <div>
        <label className="label" htmlFor="f-q">{t('common.search')}</label>
        <input id="f-q" className="input" value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} placeholder={t('common.searchPlaceholder')} />
      </div>
      <div>
        <label className="label" htmlFor="f-cat">{t('products.category')}</label>
        <select id="f-cat" className="input" value={draft.category} onChange={(e) => setDraft({ ...Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, k.startsWith('a.') ? '' : v])), category: e.target.value })}>
          <option value="">{t('common.allCategories')}</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{tl(c)}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="f-city">{t('products.city')}</label>
        <CitySelect id="f-city" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} cities={meta.cities} placeholder={t('common.allCities')} />
      </div>
      <div>
        <span className="label">{t('form.price')}</span>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="number" min="0" inputMode="numeric" placeholder={t('products.minPrice')} value={draft.minPrice} onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })} aria-label={t('products.minPrice')} />
          <input className="input" type="number" min="0" inputMode="numeric" placeholder={t('products.maxPrice')} value={draft.maxPrice} onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })} aria-label={t('products.maxPrice')} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="f-cond">{t('products.condition')}</label>
        <select id="f-cond" className="input" value={draft.condition} onChange={(e) => setDraft({ ...draft, condition: e.target.value })}>
          <option value="">{t('products.anyCondition')}</option>
          <option value="new">{t('common.new')}</option>
          <option value="used">{t('common.used')}</option>
        </select>
      </div>
      <AttributeFilters categorySlug={draft.category} values={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded accent-brand-700" checked={draft.availability === 'all'} onChange={(e) => setDraft({ ...draft, availability: e.target.checked ? 'all' : '' })} />
        {t('products.includeSold')}
      </label>
      {barterOn && (
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded accent-violet-700" checked={draft.swap === '1'} onChange={(e) => setDraft({ ...draft, swap: e.target.checked ? '1' : '' })} />
        🔄 {t('swap.filter')}
      </label>
      )}
      <div className="flex gap-2">
        <button className="btn-primary flex-1">{t('common.apply')}</button>
        <button type="button" className="btn-outline" onClick={() => { setParams(new URLSearchParams()); setShowFilters(false); }}>{t('common.reset')}</button>
      </div>
    </form>
  );

  return (
    <div className="container-page py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {data && <p className="mt-1 text-sm text-slate-500">{t('common.results', { n: number(data.total) })}</p>}
        </div>
        <SaveSearchButton filters={current} />
        <div className="flex items-center gap-2">
          <button className="btn-outline lg:hidden" onClick={() => setShowFilters(!showFilters)}><Icon name="filter" className="h-4 w-4" />{t('common.filters')}</button>
          <label className="sr-only" htmlFor="sort">{t('products.sort')}</label>
          <div className="flex rounded-xl bg-surface p-1 ring-1 ring-slate-200" role="group" aria-label={t('geo.view')}>
            <button type="button" onClick={() => update({ view: '' })} aria-pressed={!mapView} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${!mapView ? 'bg-brand-700 text-white' : 'text-slate-600'}`}><Icon name="grid" className="me-1 inline h-3.5 w-3.5" />{t('geo.listView')}</button>
            <button type="button" onClick={() => update({ view: 'map' })} aria-pressed={mapView} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${mapView ? 'bg-brand-700 text-white' : 'text-slate-600'}`}><Icon name="pin" className="me-1 inline h-3.5 w-3.5" />{t('geo.mapView')}</button>
          </div>
          <select id="sort" className="input w-auto" value={current.sort || (near ? 'distance' : current.q ? 'relevance' : 'newest')} onChange={(e) => update({ sort: e.target.value })}>
            {here && <option value="distance">{t('geo.sortDistance')}</option>}
            {current.q && <option value="relevance">{t('products.sortRelevance')}</option>}
            <option value="newest">{t('products.sortNewest')}</option>
            <option value="oldest">{t('products.sortOldest')}</option>
            <option value="price_asc">{t('products.sortPriceAsc')}</option>
            <option value="price_desc">{t('products.sortPriceDesc')}</option>
          </select>
        </div>
      </div>

      <LocationBar className="mb-3" />
      {/* "Near me": only once we know where the visitor is */}
      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label={t('geo.nearMe')}>
        <span className="text-sm font-bold text-slate-700"><span aria-hidden="true">📍 </span>{t('geo.nearMe')}:</span>
        {here ? (
          <>
            <button type="button" onClick={() => update({ near: '' })} aria-pressed={!near} className={`badge px-3 py-1.5 text-sm ${!near ? 'bg-brand-700 text-white' : 'bg-surface text-slate-700 ring-1 ring-slate-200'}`}>{t('geo.anyDistance')}</button>
            {RADII.map((r) => (
              <button key={r} type="button" onClick={() => update({ near: r })} aria-pressed={near === r} className={`badge px-3 py-1.5 text-sm ${near === r ? 'bg-brand-700 text-white' : 'bg-surface text-slate-700 ring-1 ring-slate-200'}`}>
                {t('geo.withinKm', { km: r })}
              </button>
            ))}
          </>
        ) : <span className="text-xs text-slate-500">{t('geo.locateFirst')}</span>}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => update({ category: '' })} className={`badge shrink-0 px-3 py-1.5 text-sm ${!current.category ? 'bg-brand-700 text-white' : 'bg-surface text-slate-700 ring-1 ring-slate-200'}`}>{t('common.all')}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => update({ category: c.slug })} className={`badge shrink-0 gap-1 px-3 py-1.5 text-sm ${current.category === c.slug ? 'bg-brand-700 text-white' : 'bg-surface text-slate-700 ring-1 ring-slate-200'}`}>
            <span aria-hidden="true"><CategoryIcon icon={c.icon} /></span>{tl(c)}
          </button>
        ))}
      </div>

      {livestockOn && current.category === 'livestock' && (
        <Link to="/livestock" className="mb-4 flex items-center gap-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
          <span className="text-2xl" aria-hidden="true">🐪</span><span className="flex-1">{t('livestock.title')} · {t('livestock.marketsTitle')}</span><span aria-hidden="true">←</span>
        </Link>
      )}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>{filters}</aside>
        <section>
          <ErrorBox error={error} />
          {loading ? <ProductGridSkeleton /> : data?.items?.length ? (
            mapView ? (
              <ResultsMap items={data.items} here={here} />
            ) : (
              <>
                <ProductGrid items={data.items} />
                <Pagination page={data.page} total={data.total} limit={data.limit} onPage={(p) => update({ page: String(p) })} />
              </>
            )
          ) : !error && (
            <EmptyState icon="search" title={near ? t('geo.noneNearby', { km: near }) : t('products.noResults')}>
              {near && <button type="button" className="btn-outline" onClick={() => update({ near: String(Math.min(2000, Number(near) * 4)) })}>{t('geo.widen')}</button>}
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}

/** The results on a map (approximate places unless the seller showed the exact one). */
function ResultsMap({ items, here }) {
  const { t, price } = useI18n();
  const markers = items.filter((p) => p.map_lat != null).map((p) => ({
    id: p.id, lat: p.map_lat, lng: p.map_lng, title: p.title, href: `/products/${p.id}`, linkLabel: t('geo.openListing'),
    subtitle: `${price(p.price)}${p.distance_km != null ? ` · ≈ ${t('geo.km', { km: p.distance_km })}` : ''}`,
  }));
  return (
    <div className="space-y-2">
      <MapView className="h-[60vh] min-h-[340px]" center={MAURITANIA.center} zoom={MAURITANIA.zoom} markers={markers}
        me={here ? { ...here, title: t('geo.you') } : null} label={t('geo.mapView')} />
      <p className="text-xs text-slate-500">{t('geo.mapApproxNote', { n: markers.length })}</p>
    </div>
  );
}
