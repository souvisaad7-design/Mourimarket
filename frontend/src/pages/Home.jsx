import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard.jsx';
import { CitySelect, Icon, VerifiedBadge, useCityName } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

/** Search box with live suggestions (listings + categories) while typing. */
export function SearchBar({ initial = {}, large = false }) {
  const { t, tl } = useI18n();
  const { categories, meta } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState(initial.q || '');
  const [category, setCategory] = useState(initial.category || '');
  const [city, setCity] = useState(initial.city || '');
  const [suggest, setSuggest] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef();

  // Debounced suggestions.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setSuggest(null); return undefined; }
    const timer = setTimeout(() => {
      api('/products/suggest', { query: { q: term } }).then(setSuggest).catch(() => setSuggest(null));
    }, 180);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (params) => {
    setOpen(false);
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    navigate(`/products?${sp}`);
  };
  const submit = (e) => {
    e.preventDefault();
    go({ q: q.trim(), category, city });
  };

  const options = [
    ...(suggest?.categories || []).map((c) => ({ key: `c-${c.slug}`, label: tl(c), icon: c.icon, onPick: () => go({ category: c.slug, city }) })),
    ...(suggest?.titles || []).map((p) => ({ key: `p-${p.id}`, label: p.title, onPick: () => { setOpen(false); navigate(`/products/${p.id}`); } })),
  ];
  const showList = open && q.trim().length >= 2 && options.length > 0;

  const onKeyDown = (e) => {
    if (!showList) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % (options.length + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? options.length : a - 1)); }
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' && active >= 0 && active < options.length) { e.preventDefault(); options[active].onPick(); }
  };

  return (
    <form onSubmit={submit} className={`grid gap-2 rounded-2xl bg-surface p-2 sm:grid-cols-[1fr_auto_auto_auto] ${large ? 'shadow-xl' : 'shadow-sm'}`} role="search">
      <div className="relative" ref={box}>
        <Icon name="search" className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          className="input border-0 ps-10 focus:ring-0" placeholder={t('common.searchPlaceholder')} value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
          aria-label={t('common.search')} role="combobox" aria-expanded={showList} aria-autocomplete="list" aria-controls="search-suggestions"
          autoComplete="off" enterKeyHint="search"
        />
        {showList && (
          <ul id="search-suggestions" role="listbox" className="card absolute inset-x-0 top-full z-40 mt-2 max-h-80 animate-fade-in overflow-y-auto p-1.5 text-slate-800">
            {options.map((o, i) => (
              <li key={o.key} role="option" aria-selected={active === i}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={o.onPick}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm ${active === i ? 'bg-slate-100' : 'hover:bg-slate-100'}`}>
                  {o.icon ? <span aria-hidden="true">{o.icon}</span> : <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />}
                  <span className="truncate">{o.label}</span>
                </button>
              </li>
            ))}
            <li role="option" aria-selected={active === options.length}>
              <button type="submit" onMouseDown={(e) => e.preventDefault()}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm font-semibold text-brand-700 ${active === options.length ? 'bg-slate-100' : 'hover:bg-slate-100'}`}>
                <Icon name="search" className="h-4 w-4 shrink-0" />{t('search.seeAll', { q: q.trim() })}
              </button>
            </li>
          </ul>
        )}
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
    <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 lg:grid-cols-9">
      {categories.map((c) => (
        <Link key={c.id} to={`/products?category=${c.slug}`}
          className="card flex w-28 shrink-0 snap-start flex-col items-center gap-2 px-2 py-4 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md sm:w-auto">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl" aria-hidden="true">{c.icon}</span>
          <span className="text-xs font-semibold leading-tight text-slate-800">{tl(c)}</span>
          <span className="text-[11px] text-slate-500 ltr-nums">{number(c.product_count)}</span>
        </Link>
      ))}
    </div>
  );
}

function SectionHeader({ title, to, icon }) {
  const { t } = useI18n();
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl font-bold">{icon}{title}</h2>
      {to && <Link to={to} className="link flex items-center gap-1 text-sm">{t('common.viewAll')}<Icon name="chevron" className="h-4 w-4 rtl:rotate-180" /></Link>}
    </div>
  );
}

export default function Home() {
  const { t, number } = useI18n();
  const { categories, meta } = useApp();
  const cityName = useCityName();
  useDocumentTitle(t('brand.tagline'));
  const featured = useApi('/products?featured=1&limit=8');
  const latest = useApi('/products?limit=12&sort=newest');
  const stores = useApi('/stores');
  const stats = useApi('/stats/public');
  const cities = useApi('/stats/cities');

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
          <defs>
            <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" /></pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div className="pointer-events-none absolute -end-24 -top-24 h-96 w-96 rounded-full bg-gold-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -start-20 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="container-page relative py-12 sm:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-gold-400 ring-1 ring-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />{t('brand.tagline')}
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">{t('home.heroTitle')}</h1>
          <p className="mt-4 max-w-2xl text-white/80 sm:text-lg">{t('home.heroSubtitle')}</p>
          <div className="mt-8 max-w-4xl text-slate-800"><SearchBar large /></div>
          {stats.data && (
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {[['products', 'statsProducts'], ['users', 'statsUsers'], ['stores', 'statsStores']].map(([k, label]) => (
                <div key={k} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{t(`home.${label}`)}</dt>
                  <dd className="text-2xl font-bold text-gold-400 ltr-nums">{number(stats.data[k])}</dd>
                  <span className="text-white/75">{t(`home.${label}`)}</span>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-10">
        <SectionHeader title={t('home.browseCategories')} to="/categories" />
        <CategoryTiles categories={categories} />
      </section>

      {/* Featured */}
      {(featured.loading || featured.data?.items?.length > 0) && (
        <section className="container-page mt-12">
          <SectionHeader title={t('home.featured')} to="/products?featured=1"
            icon={<span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-ink"><Icon name="star" filled className="h-4 w-4" /></span>} />
          {featured.loading ? <ProductGridSkeleton count={4} /> : <ProductGrid items={featured.data.items} />}
        </section>
      )}

      {/* Latest */}
      <section className="container-page mt-12">
        <SectionHeader title={t('home.latest')} to="/products" />
        {latest.loading ? <ProductGridSkeleton /> : <ProductGrid items={latest.data?.items || []} />}
      </section>

      {/* Cities */}
      {cities.data?.items?.length > 0 && (
        <section className="container-page mt-12">
          <SectionHeader title={t('home.popularCities')} />
          <div className="flex flex-wrap gap-2">
            {cities.data.items.map((c) => (
              <Link key={c.city} to={`/products?city=${c.city}`}
                className="card flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition hover:border-brand-300 hover:shadow-md">
                <Icon name="pin" className="h-4 w-4 text-brand-700" />{cityName(meta.cities, c.city)}
                <span className="badge bg-slate-100 text-slate-600 ltr-nums">{number(c.n)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="container-page mt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[['shield', 1], ['check', 2], ['star', 3]].map(([icon, n]) => (
            <div key={n} className="card flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon name={icon} className="h-5 w-5" /></span>
              <div>
                <h3 className="font-bold">{t(`home.trust${n}`)}</h3>
                <p className="mt-0.5 text-sm text-slate-600">{t(`home.trust${n}Text`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stores */}
      {stores.data?.items?.length > 0 && (
        <section className="container-page mt-14">
          <SectionHeader title={t('home.featuredStores')} to="/stores" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stores.data.items.slice(0, 4).map((s) => (
              <Link key={s.id} to={`/stores/${s.slug}`} className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                {s.logo_url ? <img src={s.logo_url} alt="" className="h-14 w-14 rounded-2xl object-cover" /> : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-800"><Icon name="store" /></span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate font-semibold">{s.name}{s.verified && <VerifiedBadge small />}</p>
                  <p className="text-xs text-slate-500">{t('store.products', { n: number(s.product_count) })}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="container-page mt-14">
        <h2 className="mb-6 text-center text-xl font-bold">{t('home.howTitle')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card p-6">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-ink">{n}</span>
              <h3 className="font-bold">{t(`home.how${n}`)}</h3>
              <p className="mt-1 text-sm text-slate-600">{t(`home.how${n}Text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-14">
        <div className="relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-brand-600/40 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white">{t('home.ctaTitle')}</h2>
            <p className="mt-2 max-w-xl text-white/70">{t('home.ctaText')}</p>
          </div>
          <Link to="/sell" className="btn-accent relative shrink-0 px-6 py-3 text-base"><Icon name="plus" />{t('nav.post')}</Link>
        </div>
      </section>
    </>
  );
}
