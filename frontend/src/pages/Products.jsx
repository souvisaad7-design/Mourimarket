import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/ProductCard.jsx';
import { CitySelect, EmptyState, ErrorBox, Icon, Pagination, Spinner } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

const FILTER_KEYS = ['q', 'category', 'city', 'minPrice', 'maxPrice', 'condition', 'sort', 'availability', 'page'];

/** All listings + search results. Every filter lives in the URL so results are shareable. */
export default function Products() {
  const { t, tl, number } = useI18n();
  const { categories, meta } = useApp();
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const current = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const [draft, setDraft] = useState(current);
  useEffect(() => { setDraft(Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']))); }, [params]);

  const apiParams = new URLSearchParams({ limit: '24' });
  for (const k of FILTER_KEYS) if (current[k]) apiParams.set(k, current[k]);
  const { data, loading, error } = useApi(`/products?${apiParams}`);

  const category = categories.find((c) => c.slug === current.category);
  const title = current.q ? t('products.searchFor', { q: current.q }) : category ? tl(category) : t('products.title');
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
        <select id="f-cat" className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
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
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded accent-brand-700" checked={draft.availability === 'all'} onChange={(e) => setDraft({ ...draft, availability: e.target.checked ? 'all' : '' })} />
        {t('products.includeSold')}
      </label>
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
        <div className="flex items-center gap-2">
          <button className="btn-outline lg:hidden" onClick={() => setShowFilters(!showFilters)}><Icon name="filter" className="h-4 w-4" />{t('common.filters')}</button>
          <label className="sr-only" htmlFor="sort">{t('products.sort')}</label>
          <select id="sort" className="input w-auto" value={current.sort || 'newest'} onChange={(e) => update({ sort: e.target.value })}>
            <option value="newest">{t('products.sortNewest')}</option>
            <option value="oldest">{t('products.sortOldest')}</option>
            <option value="price_asc">{t('products.sortPriceAsc')}</option>
            <option value="price_desc">{t('products.sortPriceDesc')}</option>
          </select>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => update({ category: '' })} className={`badge shrink-0 px-3 py-1.5 text-sm ${!current.category ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>{t('common.all')}</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => update({ category: c.slug })} className={`badge shrink-0 gap-1 px-3 py-1.5 text-sm ${current.category === c.slug ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>
            <span aria-hidden="true">{c.icon}</span>{tl(c)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>{filters}</aside>
        <section>
          <ErrorBox error={error} />
          {loading ? <Spinner /> : data?.items?.length ? (
            <>
              <ProductGrid items={data.items} />
              <Pagination page={data.page} total={data.total} limit={data.limit} onPage={(p) => update({ page: String(p) })} />
            </>
          ) : !error && <EmptyState icon="search" title={t('products.noResults')} />}
        </section>
      </div>
    </div>
  );
}
