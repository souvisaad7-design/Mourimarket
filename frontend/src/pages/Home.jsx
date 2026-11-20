import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel.jsx';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard.jsx';
import { CategoryIcon, EmptyState, Icon, VerifiedBadge, useCityName } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useGeo } from '../context/LocationContext.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export function CategoryTiles({ categories }) {
  const { tl } = useI18n();
  return (
    <div className="relative">
      <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-9">
        {categories.map((c) => (
          <Link key={c.id} to={`/products?category=${c.slug}`}
            className="group flex w-[5.5rem] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-100/70 px-1.5 py-2 text-center transition hover:-translate-y-1 hover:border-brand-300 hover:bg-surface hover:shadow-md sm:w-auto sm:gap-2 sm:px-2 sm:py-4">
            <span className="text-[2rem] leading-none drop-shadow-sm transition group-hover:scale-110 sm:text-5xl" aria-hidden="true"><CategoryIcon icon={c.icon} /></span>
            <span className="text-[11px] font-bold leading-tight text-slate-800 sm:text-xs">{tl(c)}</span>
          </Link>
        ))}
      </div>
      {/* Phones: a soft fade on the far edge shows the row scrolls sideways */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 -end-4 w-16 from-slate-50 via-slate-50/60 to-transparent ltr:bg-gradient-to-l rtl:bg-gradient-to-r sm:hidden" />
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
      <h2 className="relative pb-1.5 text-lg font-bold sm:pb-2 sm:text-xl after:absolute after:bottom-0 after:start-0 after:h-1 after:w-3/4 after:rounded-full after:bg-brand-700">{children}</h2>
      {action}
    </div>
  );
}

function PillLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 rounded-full border border-brand-700 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">
      {children}<Icon name="arrow" className="h-3.5 w-3.5 ltr:rotate-180" />
    </Link>
  );
}

/** Green line art of a Mauritanian skyline for the "why" card. */
function MiniSkyline() {
  return (
    <svg viewBox="0 0 260 80" className="mt-auto h-20 w-full text-brand-600" aria-hidden="true">
      <g fill="currentColor" opacity="0.85">
        <path d="M0 80V66h260v14z" />
        <path d="M18 66V40h10v26zM23 40v-12l-4-6h8l-4 6z" />
        <path d="M44 66c1-14 0-26-3-36 7-5 15-5 22 1-7-2-13-1-19 3 3-7 8-10 15-10-6 0-11 2-15 7-3-6-8-9-15-9 6 1 11 4 13 9" />
        <path d="M82 66V48a14 14 0 0 1 28 0v18z" />
        <path d="M120 66V30h12v36zM126 30V16l-5-7h10l-5 7zM116 42h20M116 54h20" />
        <path d="M150 66V50h40v16zM158 66V56a12 12 0 0 1 24 0v10zM150 50l20-12 20 12z" opacity="0.7" />
        <path d="M206 66V36h10v30zM211 36V22l-4-6h8l-4 6z" />
        <path d="M236 66c1-12 0-22-3-31 6-4 13-4 19 1-6-2-11-1-16 3" />
      </g>
    </svg>
  );
}

function WhyCard() {
  const { t } = useI18n();
  const items = [['shield', 'why1'], ['bolt', 'why2'], ['handshake', 'why3'], ['pin', 'why4']];
  return (
    <aside className="flex flex-col rounded-3xl border border-brand-100 bg-brand-50 p-5">
      <h2 className="mb-4 text-lg font-bold text-brand-900">{t('home.whyTitle')}</h2>
      <ul className="space-y-3.5">
        {items.map(([icon, key]) => (
          <li key={key} className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white"><Icon name={icon} className="h-4 w-4" /></span>
            {t(`home.${key}`)}
          </li>
        ))}
      </ul>
      <MiniSkyline />
    </aside>
  );
}

/** Illustration for the "post an ad" card: a phone showing a listing being published. */
function PhoneArt() {
  return (
    <svg viewBox="0 0 200 170" className="h-40 w-full" aria-hidden="true">
      <circle cx="100" cy="92" r="70" fill="#fff" opacity="0.08" />
      <circle cx="100" cy="92" r="48" fill="#fff" opacity="0.08" />
      <g transform="rotate(-8 100 90)">
        <rect x="62" y="22" width="76" height="136" rx="14" fill="#0b2e1c" />
        <rect x="67" y="30" width="66" height="120" rx="10" fill="#fff" />
        <rect x="73" y="38" width="54" height="38" rx="6" fill="#d8f3e2" />
        <path d="M80 70l12-14 9 9 7-6 13 11z" fill="#249b5e" />
        <circle cx="113" cy="49" r="5" fill="#fbc531" />
        <rect x="73" y="82" width="40" height="6" rx="3" fill="#cbd5e1" />
        <rect x="73" y="93" width="28" height="7" rx="3.5" fill="#0f6a3d" />
        <rect x="73" y="106" width="54" height="5" rx="2.5" fill="#e2e8f0" />
        <rect x="73" y="115" width="44" height="5" rx="2.5" fill="#e2e8f0" />
        <rect x="80" y="130" width="40" height="12" rx="6" fill="#fbc531" />
      </g>
      <g fill="#fbc531">
        <path d="M30 40l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />
        <path d="M168 120l2 5 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1z" />
      </g>
      <g stroke="#fbc531" strokeWidth="3" strokeLinecap="round"><path d="M160 40l12-8M164 56l14-2M156 26l4-12" /></g>
    </svg>
  );
}

function PromoCard() {
  const { t } = useI18n();
  return (
    <aside className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-brand-700 to-brand-900 p-5 text-white">
      <h2 className="text-2xl font-bold leading-tight text-white">{t('home.promoTitle')}<br /><span className="text-gold-400">{t('home.promoTitle2')}</span></h2>
      <div className="my-2 flex-1"><PhoneArt /></div>
      <Link to="/sell" className="btn-accent w-full rounded-full py-3"><Icon name="plus" className="h-5 w-5" />{t('home.promoCta')}</Link>
    </aside>
  );
}

function FeatureStrip() {
  const { t } = useI18n();
  const items = [['users', 'feat1'], ['rocket', 'feat2'], ['shield', 'feat3'], ['help', 'feat4']];
  return (
    <div className="grid items-stretch overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 lg:grid-cols-[auto_1fr]">
      <div className="flex items-center gap-2 bg-brand-800 px-6 py-4 text-sm font-bold text-white">
        <Icon name="heart" filled className="h-5 w-5" />{t('home.stripPill')}
      </div>
      <ul className="grid grid-cols-2 divide-slate-200 sm:grid-cols-4 sm:divide-x rtl:sm:divide-x-reverse">
        {items.map(([icon, key]) => (
          <li key={key} className="flex items-center justify-center gap-2 px-3 py-4 text-center text-xs font-semibold text-slate-700 sm:text-sm">
            <Icon name={icon} className="h-6 w-6 shrink-0 text-brand-700" />{t(`home.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const { t, number } = useI18n();
  const { categories, meta } = useApp();
  const cityName = useCityName();
  useDocumentTitle(t('brand.tagline'));
  const featured = useApi('/products?featured=1&limit=4');
  const { query: here } = useGeo();
  // With a known position the cards also show how far each listing is.
  const latest = useApi(`/products?limit=12&sort=newest${here ? `&lat=${here.lat}&lng=${here.lng}` : ''}`, undefined, [here?.lat, here?.lng]);
  const deals = useApi('/products?deals=1&limit=4');
  const stores = useApi('/stores');
  const cities = useApi('/stats/cities');

  const hasFeatured = featured.data?.items?.length > 0;
  // Sections the admin switched off (Admin → Menus & links → Home page sections).
  const show = { hero: true, categories: true, latest: true, promo: true, deals: true, cities: true, stores: true, features: true, ...useSettings().settings.menu?.home };

  return (
    <div className="container-page space-y-3.5 py-3 sm:space-y-10 sm:py-5">
      {show.hero && <HeroCarousel />}

      {show.categories && <section>
        <SectionTitle action={<PillLink to="/categories">{t('home.allCategories')}</PillLink>}>{t('home.browseCategories')}</SectionTitle>
        <CategoryTiles categories={categories} />
      </section>}

      {show.latest && <section>
        <SectionTitle action={<PillLink to="/products">{t('common.viewAll')}</PillLink>}>{t('home.latest')}</SectionTitle>
        {latest.loading ? <ProductGridSkeleton /> : latest.data?.items?.length ? <ProductGrid items={latest.data.items} /> : (
          <EmptyState icon="plus" title={t('home.noListingsYet')}>
            <Link to="/sell" className="btn-accent rounded-full"><Icon name="plus" className="h-4 w-4" />{t('home.promoCta')}</Link>
          </EmptyState>
        )}
      </section>}

      {/* Why · Featured (only when an admin has featured listings) · Post an ad */}
      {show.promo && <section className={`grid gap-4 ${hasFeatured ? 'lg:grid-cols-[250px_1fr_250px]' : 'sm:grid-cols-2'}`}>
        <div className="order-3 lg:order-none"><WhyCard /></div>
        {hasFeatured && (
          <div className="order-1 min-w-0 lg:order-none">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-bold"><span className="text-gold-500"><Icon name="star" filled className="h-6 w-6" /></span>{t('home.featured')}</h2>
              <PillLink to="/products?featured=1">{t('common.viewAll')}</PillLink>
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <ProductGridInner items={featured.data.items} />
            </div>
          </div>
        )}
        <div className="order-2 lg:order-none"><PromoCard /></div>
      </section>}

      {show.deals && deals.data?.items?.length > 0 && (
        <section>
          <SectionTitle action={<PillLink to="/products?deals=1">{t('common.viewAll')}</PillLink>}><span aria-hidden="true">🔥 </span>{t('nav.offers')}</SectionTitle>
          <ProductGrid items={deals.data.items} />
        </section>
      )}

      {show.cities && cities.data?.items?.length > 0 && (
        <section>
          <SectionTitle>{t('home.popularCities')}</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {cities.data.items.map((c) => (
              <Link key={c.city} to={`/products?city=${c.city}`}
                className="card flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:border-brand-300 hover:shadow-md">
                <Icon name="pin" className="h-4 w-4 text-brand-700" />{cityName(meta.cities, c.city)}
                <span className="badge bg-brand-50 text-brand-800 ltr-nums">{number(c.n)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {show.stores && stores.data?.items?.length > 0 && (
        <section>
          <SectionTitle action={<PillLink to="/stores">{t('common.viewAll')}</PillLink>}>{t('home.featuredStores')}</SectionTitle>
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

      {show.features && <FeatureStrip />}
    </div>
  );
}

/** Product cards without the outer grid wrapper (the featured row sets its own columns). */
function ProductGridInner({ items }) {
  return <ProductGrid items={items} bare />;
}
