import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductGrid } from '../components/ProductCard.jsx';
import { EmptyState, ErrorBox, Icon, PageHeader, Pagination, Spinner, Stars, VerifiedBadge, useCityName } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { ProBadge } from '../components/StorePlans.jsx';

function StoreLogo({ store, size = 'h-16 w-16' }) {
  return store.logo_url ? <img src={store.logo_url} alt="" className={`${size} shrink-0 rounded-2xl object-cover`} /> : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-800`}><Icon name="store" className="h-1/2 w-1/2" /></span>
  );
}

export function Stores() {
  const { t, number } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const { data, loading, error } = useApi(`/stores?q=${encodeURIComponent(search)}`);
  useDocumentTitle(t('store.title'));
  return (
    <div className="container-page py-8">
      <PageHeader title={t('store.title')}>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(q); }} className="flex gap-2">
          <input className="input w-56" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} aria-label={t('common.search')} />
          <button className="btn-primary px-3" aria-label={t('common.search')}><Icon name="search" className="h-4 w-4" /></button>
        </form>
      </PageHeader>
      <p className="-mt-4 mb-6 text-slate-500">{t('store.subtitle')}</p>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="store" title={t('store.empty')} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((s) => (
            <Link key={s.id} to={`/stores/${s.slug}`} className="card flex gap-4 p-5 transition hover:shadow-md">
              <StoreLogo store={s} />
              <div className="min-w-0">
                <h2 className="flex items-center gap-1 truncate font-bold">{s.name}{s.verified && <VerifiedBadge small />}{s.pro && <ProBadge />}</h2>
                {s.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{s.description}</p>}
                <p className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{t('store.products', { n: number(s.product_count) })}</span>
                  {s.city && <span className="flex items-center gap-1"><Icon name="pin" className="h-3.5 w-3.5" />{cityName(meta.cities, s.city)}</span>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function StoreDetail() {
  const { slug } = useParams();
  const { t, date } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const [page, setPage] = useState(1);
  const store = useApi(`/stores/${slug}`);
  const products = useApi(`/products?store=${encodeURIComponent(slug)}&availability=all&limit=24&page=${page}`);
  useDocumentTitle(store.data?.store?.name);

  if (store.loading) return <Spinner />;
  if (store.error) return <div className="container-page py-10"><ErrorBox error={store.error} /></div>;
  const s = store.data.store;
  const wa = (s.whatsapp || '').replace(/[^\d]/g, '');

  return (
    <div>
      <div className="h-32 bg-gradient-to-br from-brand-800 to-brand-600 sm:h-44" />
      <div className="container-page">
        <div className="card -mt-16 flex flex-col gap-5 p-6 sm:flex-row">
          <StoreLogo store={s} size="h-24 w-24" />
          <div className="flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">{s.name}{s.verified && <VerifiedBadge label />}{s.pro && <ProBadge />}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {s.reviews_count > 0 && <span className="flex items-center gap-1"><Stars value={s.rating} />({s.reviews_count})</span>}
              {s.city && <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{cityName(meta.cities, s.city)}</span>}
              <span>{t('common.since', { d: date(s.created_at) })}</span>
              <Link to={`/users/${s.owner_id}`} className="link">{t('store.owner')}: {s.owner_name}</Link>
            </div>
            {s.description && <p className="mt-3 max-w-3xl whitespace-pre-line text-slate-700">{s.description}</p>}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:w-48">
            <h2 className="text-sm font-bold">{t('store.contact')}</h2>
            {s.phone && <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`} className="btn-outline justify-start text-xs"><Icon name="phone" className="h-4 w-4" /><span className="ltr-nums">{s.phone}</span></a>}
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn justify-start bg-[#25D366] text-xs text-white">{t('product.whatsapp')}</a>}
            {s.email && <a href={`mailto:${s.email}`} className="btn-outline justify-start truncate text-xs" dir="ltr">{s.email}</a>}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">{t('store.listings')}</h2>
          {products.loading ? <Spinner /> : products.data?.items?.length ? (
            <>
              <ProductGrid items={products.data.items} />
              <Pagination page={page} total={products.data.total} limit={products.data.limit} onPage={setPage} />
            </>
          ) : <EmptyState title={t('common.empty')} />}
        </section>
      </div>
    </div>
  );
}
