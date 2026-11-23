import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Gallery from '../components/Gallery.jsx';
import { FavoriteButton, ProductGrid, discountPercent } from '../components/ProductCard.jsx';
import { Avatar, ErrorBox, Field, Icon, Modal, Spinner, Stars, VerifiedBadge, useCityName } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import MapView from '../components/MapView.jsx';
import { useGeo } from '../context/LocationContext.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { OrderDeliveryButton } from './Delivery.jsx';

function ReportModal({ productId, open, onClose }) {
  const { t } = useI18n();
  const { meta, notify } = useApp();
  const [reason, setReason] = useState('scam');
  const [details, setDetails] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/reports', { method: 'POST', body: { productId, reason, details } });
      notify(t('report.thanks'));
      onClose();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title={t('report.title')}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox error={error} />
        <fieldset className="space-y-2">
          <legend className="label">{t('report.reason')}</legend>
          {meta.reportReasons.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-brand-700" />
              {t(`report.reasons.${r}`)}
            </label>
          ))}
        </fieldset>
        <Field label={t('report.details')} optional>
          <textarea className="input" rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />
        </Field>
        <button className="btn-danger w-full" disabled={busy}>{t('report.submit')}</button>
      </form>
    </Modal>
  );
}

function ReviewForm({ productId, onDone }) {
  const { t } = useI18n();
  const { notify } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/reviews', { method: 'POST', body: { productId, rating, comment } });
      notify(t('product.reviewThanks'));
      onDone();
    } catch (err) { setError(err); }
  };
  return (
    <form onSubmit={submit} className="card space-y-3 border-gold-400 p-4">
      <h3 className="font-bold">{t('product.rateSeller')}</h3>
      <ErrorBox error={error} />
      <Stars value={rating} onChange={setRating} size="h-7 w-7" />
      <textarea className="input" rows={2} placeholder={t('review.comment')} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
      <button className="btn-accent">{t('review.submit')}</button>
    </form>
  );
}

function ContactBox({ product }) {
  const { t } = useI18n();
  const { user, notify, refreshCounts } = useApp();
  const navigate = useNavigate();
  const [body, setBody] = useState(t('product.defaultMessage'));
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const isOwner = user && user.id === product.seller_id;
  const phone = (product.seller_phone || '').replace(/[^\d+]/g, '');

  if (isOwner) {
    return (
      <div className="card space-y-3 p-4">
        <p className="text-sm font-semibold text-slate-600">{t('product.yourListing')}</p>
        <div className="flex gap-2">
          <Link to={`/products/${product.id}/edit`} className="btn-outline flex-1"><Icon name="edit" className="h-4 w-4" />{t('common.edit')}</Link>
          <Link to="/dashboard" className="btn-primary flex-1">{t('nav.dashboard')}</Link>
        </div>
      </div>
    );
  }

  const send = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/products/${product.id}` } });
    setBusy(true);
    setError(null);
    try {
      const { conversationId } = await api('/conversations', { method: 'POST', body: { productId: product.id, body } });
      notify(t('product.messageSent'));
      refreshCounts();
      navigate(`/messages/${conversationId}`);
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <div id="contact-box" className="card space-y-3 p-4">
      <form onSubmit={send} className="space-y-3">
        <ErrorBox error={error} />
        {user && (
          <textarea className="input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('product.messagePlaceholder')} maxLength={2000} aria-label={t('product.messagePlaceholder')} />
        )}
        <button className="btn-primary w-full" disabled={busy || product.availability === 'sold'}>
          <Icon name="chat" className="h-4 w-4" />{user ? t('product.contactSeller') : t('product.loginToContact')}
        </button>
      </form>
      {phone && (
        showPhone ? (
          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${phone}`} className="btn-outline"><Icon name="phone" className="h-4 w-4" /><span className="ltr-nums">{product.seller_phone}</span></a>
            <a href={`https://wa.me/${phone.replace('+', '')}`} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-white hover:brightness-95">{t('product.whatsapp')}</a>
          </div>
        ) : (
          <button className="btn-outline w-full" onClick={() => setShowPhone(true)}><Icon name="phone" className="h-4 w-4" />{t('product.showPhone')}</button>
        )
      )}
    </div>
  );
}

function ShareBar({ product }) {
  const { t, price } = useI18n();
  const { notify } = useApp();
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = t('product.shareText', { title: product.title, price: price(product.price) });
  const nativeShare = async () => {
    try { await navigator.share({ title: product.title, text, url }); } catch { /* cancelled */ }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); notify(t('product.linkCopied')); } catch { /* ignore */ }
  };
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-slate-600">{t('product.share')}:</span>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`} target="_blank" rel="noreferrer"
        className="btn bg-[#25D366] px-3 py-1.5 text-xs text-white hover:brightness-95">{t('product.whatsapp')}</a>
      {canShare && <button type="button" onClick={nativeShare} className="btn-outline px-3 py-1.5 text-xs"><Icon name="share" className="h-4 w-4" />{t('product.share')}</button>}
      <button type="button" onClick={copy} className="btn-outline px-3 py-1.5 text-xs"><Icon name="link" className="h-4 w-4" />{t('product.copyLink')}</button>
    </div>
  );
}

/** Phones: price + contact actions pinned to the bottom of the screen. */
function MobileActionBar({ product }) {
  const { t, price } = useI18n();
  const { user } = useApp();
  const { settings } = useSettings();
  const navigate = useNavigate();
  if (user?.id === product.seller_id || product.availability === 'sold') return null;
  const delivery = settings.delivery?.enabled;
  const phone = (product.seller_phone || '').replace(/[^\d+]/g, '');
  const message = () => {
    if (!user) return navigate('/login', { state: { from: `/products/${product.id}` } });
    const box = document.getElementById('contact-box');
    box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => box?.querySelector('textarea')?.focus(), 400);
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2">
        <p className="me-auto min-w-0 truncate text-lg font-bold text-brand-800"><span className="ltr-nums">{price(product.price)}</span></p>
        {phone && <a href={`tel:${phone}`} className="btn-outline px-3" aria-label={t('product.call')}><Icon name="phone" className="h-5 w-5" /></a>}
        {delivery && <Link to={user ? `/checkout/${product.id}` : '/login'} state={user ? undefined : { from: `/checkout/${product.id}` }} className="btn-accent px-3" aria-label={t('delivery.cta.button')}><span aria-hidden="true">🛵</span><span className="hidden min-[400px]:inline">{t('delivery.cta.short')}</span></Link>}
        <button type="button" onClick={message} className="btn-primary"><Icon name="chat" className="h-4 w-4" />{delivery ? <span className="hidden min-[400px]:inline">{t('product.contactSeller')}</span> : t('product.contactSeller')}</button>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { t, tl, price, date, number, ago } = useI18n();
  const { user, meta } = useApp();
  const cityName = useCityName();
  const [reportOpen, setReportOpen] = useState(false);
  const { query: here } = useGeo();
  const { data, loading, error, reload } = useApi(`/products/${id}${here ? `?lat=${here.lat}&lng=${here.lng}` : ''}`, undefined, [id, here?.lat, here?.lng]);
  const product = data?.product;
  const similar = useApi(product ? `/products?category=${product.category_slug}&limit=5` : null, undefined, [product?.id]);
  useDocumentTitle(product?.title);

  if (loading) return <Spinner />;
  if (error) return <div className="container-page py-10"><ErrorBox error={error} /></div>;

  const category = { name_ar: product.category_name_ar, name_fr: product.category_name_fr, name_en: product.category_name_en };
  const similarItems = (similar.data?.items || []).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="container-page py-6 pb-28 lg:pb-6">
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="breadcrumb">
        <Link to="/" className="hover:text-brand-700">{t('nav.home')}</Link>
        <Icon name="chevron" className="h-4 w-4 rtl:rotate-180" />
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-brand-700">{tl(category)}</Link>
      </nav>

      {product.status === 'pending' && <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t('product.pendingNotice')}</div>}
      {product.status === 'rejected' && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{t('product.rejectedNotice', { reason: product.rejection_reason || '—' })}</div>}
      {product.availability === 'sold' && <div className="mb-4 rounded-xl bg-ink px-4 py-3 text-sm text-white">{t('product.soldNotice')}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Gallery images={product.images} title={product.title}
            badge={product.is_featured && <span className="badge gap-1 bg-gold-400 text-ink shadow"><Icon name="star" filled className="h-3 w-3" />{t('common.featured')}</span>} />
          <div className="card p-4"><ShareBar product={product} /></div>
          <div className="card p-5">
            <h2 className="mb-3 text-lg font-bold">{t('product.description')}</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">{product.description}</p>
          </div>
          <div className="card p-5">
            <h2 className="mb-3 text-lg font-bold">{t('product.details')}</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
              <div><dt className="text-slate-500">{t('product.category')}</dt><dd className="font-medium">{tl(category)}</dd></div>
              <div><dt className="text-slate-500">{t('products.condition')}</dt><dd className="font-medium">{t(`common.${product.condition}`)}</dd></div>
              <div><dt className="text-slate-500">{t('product.location')}</dt><dd className="font-medium">{cityName(meta.cities, product.city)}</dd></div>
              <div><dt className="text-slate-500">{t('product.postedOn')}</dt><dd className="font-medium">{date(product.created_at)}</dd></div>
            </dl>
          </div>
          <ListingLocation product={product} here={here} />
          {product.review && (
            <div className="card p-5">
              <div className="flex items-center gap-2"><Stars value={product.review.rating} /><span className="badge bg-emerald-100 text-emerald-800">{t('review.verified')}</span></div>
              {product.review.comment && <p className="mt-2 text-slate-700">{product.review.comment}</p>}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold leading-snug">{product.title}</h1>
              <FavoriteButton product={product} className="shrink-0 ring-1 ring-slate-200" />
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-3xl font-bold text-brand-700"><span className="ltr-nums">{price(product.price)}</span></p>
              {discountPercent(product) > 0 && (
                <>
                  <p className="text-base text-slate-400 line-through"><span className="ltr-nums">{price(product.old_price)}</span></p>
                  <span className="badge bg-brand-600 text-white"><bdi dir="ltr">{`-${discountPercent(product)}%`}</bdi></span>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{cityName(meta.cities, product.city)}</span>
              <span className="flex items-center gap-1"><Icon name="clock" className="h-4 w-4" />{ago(product.created_at)}</span>
              <span className="flex items-center gap-1"><Icon name="eye" className="h-4 w-4" />{t('common.views', { n: number(product.views) })}</span>
            </div>
          </div>

          {product.can_review && <ReviewForm productId={product.id} onDone={reload} />}
          <OrderDeliveryButton product={product} />
          <ContactBox product={product} />

          <div className="card p-4">
            <Link to={`/users/${product.seller_id}`} className="flex items-center gap-3">
              <Avatar name={product.seller_name} url={product.seller_avatar} />
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate font-semibold">{product.seller_name}{product.seller_verified && <VerifiedBadge />}</p>
                {product.seller_phone_verified && <p className="text-[11px] font-semibold text-emerald-700">📱 {t('phone.badge')}</p>}
                {product.seller_verified && <p className="text-xs font-semibold text-sky-600">{t('common.verified')}</p>}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  {product.seller_reviews_count > 0 ? (
                    <><Stars value={product.seller_rating} size="h-3.5 w-3.5" /><span>{t('product.reviews', { n: product.seller_reviews_count })}</span></>
                  ) : t('product.noRating')}
                </div>
                <p className="text-xs text-slate-500">{t('common.since', { d: date(product.seller_since) })}</p>
              </div>
            </Link>
            <div className="mt-3 flex gap-2">
              <Link to={`/users/${product.seller_id}`} className="btn-outline flex-1 text-xs">{t('product.viewProfile')}</Link>
              {product.store_slug && <Link to={`/stores/${product.store_slug}`} className="btn-outline flex-1 text-xs"><Icon name="store" className="h-4 w-4" />{t('product.visitStore')}</Link>}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            <p className="flex gap-2"><Icon name="shield" className="h-4 w-4 shrink-0" />{t('product.safety')}</p>
            <p className="mt-2 text-amber-800/80">{t('product.paymentNote')}</p>
          </div>

          {user?.id !== product.seller_id && (
            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600" onClick={() => (user ? setReportOpen(true) : null)} disabled={!user} title={!user ? t('errors.unauthorized') : undefined}>
              <Icon name="flag" className="h-4 w-4" />{t('product.report')}
            </button>
          )}
        </aside>
      </div>

      {similarItems.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">{t('product.similar')}</h2>
          <ProductGrid items={similarItems} />
        </section>
      )}

      <ReportModal productId={product.id} open={reportOpen} onClose={() => setReportOpen(false)} />
      <MobileActionBar product={product} />
    </div>
  );
}

/**
 * Where the item is: area / neighbourhood / city, the distance from the visitor, and a map.
 * Unless the seller chose to show the exact place, the map only shows a ~1 km zone.
 */
function ListingLocation({ product, here }) {
  const { t, number } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  if (product.map_lat == null) return null;
  const exact = product.loc_precision === 'exact';
  const place = [product.district, product.area, cityName(meta.cities, product.city)].filter(Boolean).join('، ');
  return (
    <section className="card space-y-3 p-5" aria-labelledby="loc-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="loc-title" className="flex items-center gap-2 text-lg font-bold"><Icon name="pin" className="h-5 w-5 text-brand-700" />{t('geo.itemLocation')}</h2>
          <p className="mt-1 text-sm text-slate-700">{place}</p>
        </div>
        {product.distance_km != null ? (
          <span className="badge bg-gold-400 px-3 py-1.5 text-sm text-ink">≈ {t('geo.kmFromYou', { km: String(product.distance_km) })}</span>
        ) : !here && <span className="text-xs text-slate-500">{t('geo.locateForDistance')}</span>}
      </div>
      <MapView className="h-64" center={[product.map_lat, product.map_lng]} zoom={13}
        markers={exact ? [{ id: product.id, lat: product.map_lat, lng: product.map_lng, title: product.title }] : []}
        area={exact ? null : { lat: product.map_lat, lng: product.map_lng, radius: product.loc_precision === 'city' ? 4000 : 1000 }}
        me={here ? { ...here, title: t('geo.you') } : null} label={t('geo.itemLocation')} />
      <p className="text-xs text-slate-500">🔒 {exact ? t('geo.exactShown') : product.loc_precision === 'city' ? t('geo.cityOnly') : t('geo.approxShown')}</p>
    </section>
  );
}
