import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { Icon, useCityName } from './ui.jsx';

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
      className={`rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition hover:scale-105 ${fav ? 'text-rose-600' : 'text-slate-600'} ${className}`}
    >
      <Icon name="heart" filled={fav} className="h-5 w-5" />
    </button>
  );
}

export default function ProductCard({ product, onFavoriteChange }) {
  const { t, tl, price, ago } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const sold = product.availability === 'sold';
  const category = { name_ar: product.category_name_ar, name_fr: product.category_name_fr, name_en: product.category_name_en };

  return (
    <Link to={`/products/${product.id}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.cover_url ? (
          <img src={product.cover_url} alt={product.title} loading="lazy" className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${sold ? 'opacity-60 grayscale' : ''}`} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400"><Icon name="image" className="h-10 w-10" /></div>
        )}
        <FavoriteButton product={product} className="absolute end-2 top-2" onChange={onFavoriteChange} />
        <div className="absolute start-2 top-2 flex gap-1">
          {sold && <span className="badge bg-slate-900 text-white">{t('common.sold')}</span>}
          {product.condition === 'new' && !sold && <span className="badge bg-gold-400 text-slate-900">{t('common.new')}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <span className="text-xs font-medium text-brand-700">{tl(category)}</span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{product.title}</h3>
        <p className="mt-auto pt-1 text-lg font-bold text-slate-900"><span className="ltr-nums">{price(product.price)}</span></p>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate"><Icon name="pin" className="h-3.5 w-3.5 shrink-0" />{cityName(meta.cities, product.city)}</span>
          <span className="shrink-0">{ago(product.created_at)}</span>
        </div>
        {product.store_name && (
          <span className="flex items-center gap-1 truncate text-xs text-slate-500"><Icon name="store" className="h-3.5 w-3.5" />{product.store_name}</span>
        )}
      </div>
    </Link>
  );
}

export function ProductGrid({ items, onFavoriteChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.id} product={p} onFavoriteChange={onFavoriteChange ? (v) => onFavoriteChange(p, v) : undefined} />)}
    </div>
  );
}
