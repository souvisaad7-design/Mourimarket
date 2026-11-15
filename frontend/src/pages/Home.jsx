import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/ProductCard.jsx';
import { CitySelect, Icon, Spinner } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export function SearchBar({ initial = {}, large = false }) {
  const { t, tl } = useI18n();
  const { categories, meta } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState(initial.q || '');
  const [category, setCategory] = useState(initial.category || '');
  const [city, setCity] = useState(initial.city || '');

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    navigate(`/products?${params}`);
  };

  return (
    <form onSubmit={submit} className={`grid gap-2 rounded-2xl bg-white p-2 shadow-lg sm:grid-cols-[1fr_auto_auto_auto] ${large ? '' : 'shadow-sm'}`} role="search">
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input className="input border-0 ps-10 focus:ring-0" placeholder={t('common.searchPlaceholder')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('common.search')} />
      </div>
      <select className="input sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)} aria-label={t('products.category')}>
        <option value="">{t('common.allCategories')}</option>
        {categories.map((c) => <option key={c.id} value={c.slug}>{tl(c)}</option>)}
      </select>
      <CitySelect value={city} onChange={setCity} cities={meta.cities} placeholder={t('common.allCities')} aria-label={t('products.city')} />
      <button className="btn-primary px-6">{t('common.search')}</button>
    </form>
  );
}

export function CategoryTiles({ categories }) {
  const { tl, number } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
      {categories.map((c) => (
        <Link key={c.id} to={`/products?category=${c.slug}`} className="card flex flex-col items-center gap-2 px-2 py-4 text-center transition hover:border-brand-300 hover:shadow-md">
          <span className="text-3xl" aria-hidden="true">{c.icon}</span>
          <span className="text-xs font-semibold leading-tight text-slate-800">{tl(c)}</span>
          <span className="text-[11px] text-slate-500 ltr-nums">{number(c.product_count)}</span>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const { t, number } = useI18n();
  const { categories } = useApp();
  useDocumentTitle(t('brand.tagline'));
  const latest = useApi('/products?limit=12&sort=newest');
  const stores = useApi('/stores');
  const stats = useApi('/stats/public');

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white">
        <div className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -start-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="container-page relative py-12 sm:py-20">
          <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-gold-400">{t('brand.tagline')}</p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-5xl">{t('home.heroTitle')}</h1>
          <p className="mt-4 max-w-2xl text-brand-50/90 sm:text-lg">{t('home.heroSubtitle')}</p>
          <div className="mt-8 max-w-4xl text-slate-800"><SearchBar large /></div>
          {stats.data && (
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {[['products', 'statsProducts'], ['users', 'statsUsers'], ['stores', 'statsStores']].map(([k, label]) => (
                <div key={k} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{t(`home.${label}`)}</dt>
                  <dd className="text-2xl font-bold text-gold-400 ltr-nums">{number(stats.data[k])}</dd>
                  <span className="text-brand-50/80">{t(`home.${label}`)}</span>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="container-page mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('home.browseCategories')}</h2>
          <Link to="/categories" className="link text-sm">{t('common.viewAll')}</Link>
        </div>
        <CategoryTiles categories={categories} />
      </section>

      <section className="container-page mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('home.latest')}</h2>
          <Link to="/products" className="link text-sm">{t('common.viewAll')}</Link>
        </div>
        {latest.loading ? <Spinner /> : <ProductGrid items={latest.data?.items || []} />}
      </section>

      <section className="container-page mt-14">
        <h2 className="mb-6 text-center text-xl font-bold">{t('home.howTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card p-6">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-slate-900">{n}</span>
              <h3 className="font-bold">{t(`home.how${n}`)}</h3>
              <p className="mt-1 text-sm text-slate-600">{t(`home.how${n}Text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {stores.data?.items?.length > 0 && (
        <section className="container-page mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('home.featuredStores')}</h2>
            <Link to="/stores" className="link text-sm">{t('common.viewAll')}</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stores.data.items.slice(0, 4).map((s) => (
              <Link key={s.id} to={`/stores/${s.slug}`} className="card flex items-center gap-3 p-4 hover:shadow-md">
                {s.logo_url ? <img src={s.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" /> : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-800"><Icon name="store" /></span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.name}</p>
                  <p className="text-xs text-slate-500">{t('store.products', { n: number(s.product_count) })}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page mt-14">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-slate-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('home.ctaTitle')}</h2>
            <p className="mt-2 max-w-xl text-slate-300">{t('home.ctaText')}</p>
          </div>
          <Link to="/sell" className="btn-accent shrink-0 px-6 py-3 text-base"><Icon name="plus" />{t('nav.post')}</Link>
        </div>
      </section>
    </>
  );
}
