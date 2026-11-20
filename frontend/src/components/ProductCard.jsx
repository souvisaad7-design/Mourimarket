import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { Icon, VerifiedBadge, useCityName } from './ui.jsx';

export function FavoriteButton({ product, className = '', onChange }) {
  const { user, notify } = useApp();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [fav, setFav] = useState(Boolean(product.is_favorite));
  const [busy, setBusy] = useState(false);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login', { state: { from: `/products/${product.id}` } });
    setBusy(true);
    try {
      await api(`/favorites/${product.id}`, { method: fav ? 'DELETE' : 'POST' });
      setFav(!fav);
      onChange?.(!fav);
    } catch {
      notify(t('common.error'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={fav}
      aria-label={fav ? t('product.removeFavorite') : t('product.addFavorite')}
      title={fav ? t('product.removeFavorite') : t('product.addFavorite')}
      className={`rounded-full bg-surface/90 p-2 shadow-sm backdrop-blur transition hover:scale-105 ${fav ? 'text-rose-600' : 'text-slate-600'} ${className}`}
    >
      <Icon name="heart" filled={fav} className="h-5 w-5" />
    </button>
  );
}

export function discountPercent(product) {
  const oldP = Number(product.old_price);
  const p = Number(product.price);
  if (!oldP || oldP <= p) return 0;
  return Math.round(((oldP - p) / oldP) * 100);
}

export default function ProductCard({ product, onFavoriteChange }) {
  const { t, price, ago, number } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const sold = product.availability === 'sold';
  const off = discountPercent(product);

  return (
    <Link to={`/products/${product.id}`}
      className={`card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg ${product.is_featured && !sold ? 'ring-2 ring-gold-400/70' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.cover_url ? (
          <img src={product.cover_url} alt={product.title} loading="lazy" className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${sold ? 'opacity-60 grayscale' : ''}`} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400"><Icon name="image" className="h-10 w-10" /></div>
        )}
        <FavoriteButton product={product} className="absolute end-2 top-2" onChange={onFavoriteChange} />
        <div className="absolute start-2 top-2 flex flex-wrap gap-1">
          {off > 0 && !sold && <span className="badge bg-brand-600 px-2 text-white shadow-sm"><bdi dir="ltr">{`-${off}%`}</bdi></span>}
          {product.is_featured && !sold && <span className="badge gap-1 bg-gold-400 text-ink shadow-sm"><Icon name="star" filled className="h-3 w-3" />{t('common.featured')}</span>}
          {sold && <span className="badge bg-ink text-white">{t('common.sold')}</span>}
          {product.condition === 'new' && !sold && !off && <span className="badge bg-surface/90 text-slate-800">{t('common.new')}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5 text-center">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-900">{product.title}</h3>
        <p className="mt-1 text-lg font-bold text-brand-700"><span className="ltr-nums">{price(product.price)}</span></p>
        {off > 0 && <p className="-mt-1 text-xs text-slate-400 line-through"><span className="ltr-nums">{price(product.old_price)}</span></p>}
        <div className="mt-1 flex items-center justify-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate"><Icon name="pin" className="h-3.5 w-3.5 shrink-0" />{cityName(meta.cities, product.city)}</span>
          {product.distance_km != null && <span className="shrink-0 font-semibold text-brand-700" title={t('geo.distanceHint')}>≈ {t('geo.km', { km: String(product.distance_km) })}</span>}
          <span className="shrink-0">{ago(product.created_at)}</span>
        </div>
        {(product.store_name || product.seller_verified) && (
          <span className="flex items-center justify-center gap-1 truncate text-xs text-slate-500">
            {product.store_name && <Icon name="store" className="h-3.5 w-3.5" />}
            {product.store_name || product.seller_name}
            {product.seller_verified && <VerifiedBadge small />}
          </span>
        )}
        <span className="mt-auto pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-4 py-1.5 text-xs font-semibold text-white transition group-hover:bg-brand-700">
            {t('product.viewDetails')}<Icon name="arrow" className="h-3.5 w-3.5 ltr:rotate-180" />
          </span>
        </span>
      </div>
    </Link>
  );
}

/** Placeholder cards shown while listings load (avoids layout jumps). */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-[4/3] animate-pulse bg-slate-100" />
          <div className="space-y-2 p-3.5">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductGrid({ items, onFavoriteChange, bare = false }) {
  const cards = items.map((p) => <ProductCard key={p.id} product={p} onFavoriteChange={onFavoriteChange ? (v) => onFavoriteChange(p, v) : undefined} />);
  if (bare) return cards;
  return <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">{cards}</div>;
}
