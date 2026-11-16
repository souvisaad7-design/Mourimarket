import { Link, useParams } from 'react-router-dom';
import { ProductGrid } from '../components/ProductCard.jsx';
import { Avatar, EmptyState, ErrorBox, Icon, Spinner, Stars, VerifiedBadge, useCityName } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export function ReviewList({ reviews }) {
  const { t, date } = useI18n();
  if (!reviews.length) return <p className="text-sm text-slate-500">{t('seller.noReviews')}</p>;
  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="text-sm font-semibold">{r.reviewer_name}</span></div>
            <span className="text-xs text-slate-400">{date(r.created_at)}</span>
          </div>
          {r.comment && <p className="mt-2 text-sm text-slate-700">{r.comment}</p>}
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><span className="badge bg-emerald-100 text-emerald-800">{t('review.verified')}</span>{r.product_title}</p>
        </li>
      ))}
    </ul>
  );
}

export default function SellerProfile() {
  const { id } = useParams();
  const { t, date } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const { data, loading, error } = useApi(`/users/${id}`);
  useDocumentTitle(data?.user?.name);

  if (loading) return <Spinner />;
  if (error) return <div className="container-page py-10"><ErrorBox error={error} /></div>;
  const { user: u, products, reviews } = data;

  return (
    <div className="container-page py-8">
      <div className="card mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar name={u.name} url={u.avatar_url} size="h-20 w-20 text-2xl" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{u.name}</h1>
            {u.is_verified && <VerifiedBadge label />}
            {u.account_type === 'merchant' && <span className="badge bg-gold-400 text-ink">{t('seller.merchant')}</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {u.reviews_count > 0 ? <span className="flex items-center gap-1"><Stars value={u.rating} /> {u.rating} ({t('product.reviews', { n: u.reviews_count })})</span> : <span>{t('product.noRating')}</span>}
            {u.city && <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{cityName(meta.cities, u.city)}</span>}
            <span>{t('common.since', { d: date(u.created_at) })}</span>
            <span>{t('seller.sold', { n: u.sold_count })}</span>
          </div>
          {u.bio && <p className="mt-2 max-w-2xl text-sm text-slate-700">{u.bio}</p>}
        </div>
        {u.store && <Link to={`/stores/${u.store.slug}`} className="btn-outline"><Icon name="store" className="h-4 w-4" />{t('product.visitStore')}</Link>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section>
          <h2 className="mb-4 text-xl font-bold">{t('seller.listings')}</h2>
          {products.length ? <ProductGrid items={products} /> : <EmptyState title={t('common.empty')} />}
        </section>
        <section>
          <h2 className="mb-4 text-xl font-bold">{t('seller.reviews')}</h2>
          <ReviewList reviews={reviews} />
        </section>
      </div>
    </div>
  );
}
