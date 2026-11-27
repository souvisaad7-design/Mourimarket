// Delivery service: checkout with cash on delivery, order tracking, delivery partners (couriers).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MapView from '../components/MapView.jsx';
import { Avatar, CitySelect, EmptyState, ErrorBox, Field, Icon, Modal, PhoneInput, Spinner, Stars, useCityName, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { EscrowPanel } from '../components/Escrow.jsx';

export const ORDER_STEPS = ['pending', 'accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered'];
const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-800', accepted: 'bg-sky-100 text-sky-800', preparing: 'bg-violet-100 text-violet-800',
  picked_up: 'bg-indigo-100 text-indigo-800', on_the_way: 'bg-gold-300/40 text-brand-900', delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-700',
};
export const VEHICLES = ['motorbike', 'car', 'tricycle', 'bicycle', 'foot'];

export function OrderStatus({ status, className = '' }) {
  const { t } = useI18n();
  return <span className={`badge ${STATUS_STYLE[status] || 'bg-slate-100 text-slate-700'} ${className}`}>{t(`delivery.status.${status}`)}</span>;
}

/** Moughataa names from /geo/areas (orders store the key). */
export function useAreaName() {
  const { lang } = useI18n();
  const { data } = useApi('/geo/areas');
  return useCallback((city, area) => {
    if (!area) return '';
    const a = (data?.areas?.[city] || []).find((x) => x.key === area);
    return a ? (a[lang] || a.ar) : area;
  }, [data, lang]);
}

/** "City · moughataa · neighbourhood" */
function usePlace() {
  const { meta } = useApp();
  const cityName = useCityName();
  const areaName = useAreaName();
  return (o) => [cityName(meta.cities, o.city), areaName(o.city, o.area), o.district].filter(Boolean).join(' · ');
}

// ---------- The button on a listing ----------

/** «🛵 Order with delivery» on a listing page (buyers only, while the service is on). */
export function OrderDeliveryButton({ product }) {
  const { t } = useI18n();
  const { user } = useApp();
  const { settings } = useSettings();
  if (!settings.delivery?.enabled || product.availability === 'sold' || user?.id === product.seller_id) return null;
  const to = `/checkout/${product.id}`;
  return (
    <div className="card border-gold-300 bg-gradient-to-br from-brand-800 to-brand-900 p-4 text-white">
      <p className="flex items-center gap-2 font-bold"><span aria-hidden="true" className="text-xl">🛵</span>{t('delivery.cta.title')}</p>
      <p className="mt-1 text-xs text-white/75">{t('delivery.cta.text')}</p>
      <Link to={user ? to : '/login'} state={user ? undefined : { from: to }} className="btn-accent mt-3 w-full">{t('delivery.cta.button')}</Link>
    </div>
  );
}

// ---------- Checkout ----------

export function Checkout() {
  const { productId } = useParams();
  const { t, lang, price } = useI18n();
  const { user, meta, notify } = useApp();
  const { settings } = useSettings();
  const navigate = useNavigate();
  useDocumentTitle(t('delivery.checkout.title'));
  const product = useApi(`/products/${productId}`);
  const areas = useApi('/geo/areas');
  const [f, setF] = useState({ city: user?.city || 'nouakchott', area: '', district: '', address: '', phone: (user?.phone || '').replace(/^\+222/, ''), note: '' });
  const [pin, setPin] = useState(null);
  const [payMethod, setPayMethod] = useState('cod');
  const [search] = useSearchParams();
  const [couponInput, setCouponInput] = useState(search.get('coupon') || '');
  const [coupon, setCoupon] = useState('');
  const [couponErr, setCouponErr] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteErr, setQuoteErr] = useState(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const fieldError = useFieldError(error);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target ? e.target.value : e }));
  const cities = meta.cities;
  const city = cities.find((c) => c.key === f.city);
  const areaList = areas.data?.areas?.[f.city] || [];

  // Live quote whenever the destination changes.
  useEffect(() => {
    if (!f.city || !product.data) return undefined;
    const timer = setTimeout(() => {
      api('/orders/quote', { method: 'POST', body: { productId: Number(productId), city: f.city, area: f.area, lat: pin?.lat, lng: pin?.lng, couponCode: coupon || undefined } })
        .then((q) => { setQuote(q); setQuoteErr(null); })
        .catch((err) => {
          // A coupon that stopped working (used up, expired) is dropped instead of blocking the order.
          if (coupon && String(err.code).startsWith('coupon_')) { setCoupon(''); setCouponErr(err); return; }
          setQuote(null); setQuoteErr(err);
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [f.city, f.area, pin, productId, product.data, coupon]);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    setCouponErr(null);
    if (!code) { setCoupon(''); return; }
    try {
      const q = await api('/orders/quote', { method: 'POST', body: { productId: Number(productId), city: f.city, area: f.area, lat: pin?.lat, lng: pin?.lng, couponCode: code } });
      setQuote(q); setCoupon(code);
    } catch (err) { setCoupon(''); setCouponErr(err); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = Math.round(pos.coords.latitude * 1e5) / 1e5;
      const lng = Math.round(pos.coords.longitude * 1e5) / 1e5;
      try {
        const place = await api('/geo/reverse', { method: 'POST', body: { lat, lng, lang } });
        if (!place.inMauritania) { setQuoteErr({ code: 'outside_mauritania' }); return; }
        setPin({ lat, lng });
        setF((s) => ({ ...s, city: place.city?.key || s.city, area: place.area?.key || '' }));
      } catch { setPin({ lat, lng }); } finally { setLocating(false); }
    }, () => setLocating(false), { enableHighAccuracy: true, timeout: 15000 });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { order } = await api('/orders', { method: 'POST', body: { ...f, productId: Number(productId), lat: pin?.lat, lng: pin?.lng, paymentMethod: payMethod, couponCode: coupon || undefined } });
      notify(t('delivery.checkout.placed'));
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  if (!settings.delivery?.enabled) return <div className="container-page py-10"><EmptyState icon="info" title={t('errors.delivery_disabled')} /></div>;
  if (product.loading) return <Spinner />;
  if (product.error) return <div className="container-page py-10"><ErrorBox error={product.error} /></div>;
  const p = product.data.product;
  const center = pin ? [pin.lat, pin.lng] : city?.lat != null ? [Number(city.lat), Number(city.lng)] : [18.0858, -15.9785];

  return (
    <div className="container-page max-w-5xl py-8">
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold"><span aria-hidden="true">🛵</span>{t('delivery.checkout.title')}</h1>
      <p className="mb-6 text-sm text-slate-500">{t('delivery.checkout.subtitle')}</p>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="card space-y-4 p-5">
            <h2 className="font-bold">{t('delivery.checkout.where')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('delivery.fields.city')} error={fieldError('city')}>
                <CitySelect value={f.city} onChange={(v) => { setF((s) => ({ ...s, city: v, area: '' })); setPin(null); }} cities={cities} placeholder={t('geo.chooseCity')} required />
              </Field>
              <Field label={t('delivery.fields.area')} error={fieldError('area')} optional={!areaList.length}>
                {areaList.length ? (
                  <select className="input" value={f.area} onChange={set('area')}>
                    <option value="">{t('delivery.fields.chooseArea')}</option>
                    {areaList.map((a) => <option key={a.key} value={a.key}>{a[lang] || a.ar}</option>)}
                  </select>
                ) : <input className="input" value={f.area} onChange={set('area')} maxLength={80} />}
              </Field>
              <Field label={t('delivery.fields.district')} optional><input className="input" value={f.district} onChange={set('district')} maxLength={80} placeholder={t('delivery.fields.districtPh')} /></Field>
              <Field label={t('delivery.fields.phone')} error={fieldError('phone')} hint={t('delivery.fields.phoneHint')}><PhoneInput value={f.phone} onChange={set('phone')} required /></Field>
            </div>
            <Field label={t('delivery.fields.address')} optional hint={t('delivery.fields.addressHint')}>
              <textarea className="input" rows={2} value={f.address} onChange={set('address')} maxLength={300} />
            </Field>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="label mb-0">{t('delivery.checkout.pinTitle')}</span>
                <div className="flex gap-2">
                  <button type="button" className="btn-accent px-3 py-1.5 text-xs" onClick={useMyLocation} disabled={locating}>📍 {locating ? t('geo.locating') : t('geo.useMyLocation')}</button>
                  {pin && <button type="button" className="btn-ghost px-2 py-1.5 text-xs" onClick={() => setPin(null)}>{t('geo.removePin')}</button>}
                </div>
              </div>
              <MapView center={center} zoom={pin ? 15 : 12} picker={pin} onPick={(lat, lng) => setPin({ lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5 })} className="h-64" label={t('delivery.checkout.pinTitle')} />
              <p className="mt-1.5 text-xs text-slate-500">{pin ? t('geo.pinSet') : t('delivery.checkout.pinHint')}</p>
            </div>
            <Field label={t('delivery.fields.note')} optional><textarea className="input" rows={2} value={f.note} onChange={set('note')} maxLength={500} placeholder={t('delivery.fields.notePh')} /></Field>
            <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-900">🔒 {t('delivery.checkout.privacy')}</p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="card overflow-hidden">
            <div className="flex gap-3 border-b border-slate-100 p-4">
              {p.images?.[0] && <img src={p.images[0].url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold">{p.title}</p>
                <p className="text-xs text-slate-500">{p.seller_name}</p>
              </div>
            </div>
            <dl className="space-y-2 p-4 text-sm">
              <div className="flex justify-between"><dt className="text-slate-600">{t('delivery.cost.item')}</dt><dd className="font-semibold ltr-nums">{price(p.price)}</dd></div>
              {quote?.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>🏷️ {t('pro.coupon.discount', { code: coupon.toUpperCase() })}</dt><dd className="font-semibold"><bdi dir="ltr">−{price(quote.discount)}</bdi></dd></div>}
              <div className="flex justify-between">
                <dt className="text-slate-600">{t('delivery.cost.delivery')}{quote && <span className="block text-[11px] text-slate-400">{t('delivery.cost.distance', { km: String(quote.distanceKm) })}{quote.interCity ? ` · ${t('delivery.cost.interCity')}` : ''}</span>}</dt>
                <dd className="font-semibold ltr-nums">{quote ? price(quote.deliveryFee) : '…'}</dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-base"><dt className="font-bold">{t('delivery.cost.total')}</dt><dd className="font-bold text-brand-800 ltr-nums">{quote ? price(quote.total) : '…'}</dd></div>
            </dl>
            <div className="mx-4 mb-3">
              <div className="flex gap-2">
                <input className="input min-w-0 flex-1 py-2 text-sm uppercase" dir="ltr" maxLength={30} value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t('pro.coupon.have')} aria-label={t('pro.coupon.have')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }} />
                <button type="button" className="btn-outline shrink-0 px-3 py-2 text-xs" onClick={applyCoupon}>{coupon ? '✓' : t('pro.coupon.apply')}</button>
              </div>
              {couponErr && <p className="mt-1 text-xs text-rose-700" role="alert">{couponErr.code === 'coupon_min_total' && couponErr.fields?.min ? t('errors.coupon_min_total', { min: price(couponErr.fields.min) }) : t(`errors.${couponErr.code}`)}</p>}
            </div>
            <fieldset className="mx-4 mb-4 space-y-2" aria-label={t('escrow.choose')}>
              {[['cod', '💵', t('delivery.cod.title'), t('delivery.cod.text')], ...(settings.delivery?.escrow ? [['escrow', '🔒', t('escrow.title'), t('escrow.checkoutText')]] : [])].map(([k, icon, title, text]) => (
                <label key={k} className={`flex cursor-pointer items-start gap-2 rounded-xl border-2 p-3 text-xs text-brand-900 ${payMethod === k ? 'border-gold-400 bg-gold-300/20' : 'border-slate-200'}`}>
                  <input type="radio" name="pay" className="mt-1" checked={payMethod === k} onChange={() => setPayMethod(k)} />
                  <span aria-hidden="true" className="text-lg">{icon}</span>
                  <span><strong className="block">{title}</strong>{text}</span>
                </label>
              ))}
            </fieldset>
          </section>
          {quote && !quote.deliverable && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t('errors.too_far')}</p>}
          <ErrorBox error={quoteErr} />
          <ErrorBox error={error} />
          <button className="btn-primary w-full py-3 text-base" disabled={busy || !quote?.deliverable}>
            <Icon name="check" className="h-5 w-5" />{busy ? t('common.loading') : t('delivery.checkout.confirm')}
          </button>
          <p className="text-center text-[11px] text-slate-500">{t('delivery.checkout.afterConfirm')}</p>
        </aside>
      </form>
    </div>
  );
}

// ---------- My orders (buyer / seller / courier) ----------

export function OrderRow({ o, admin = false }) {
  const { t, price, ago } = useI18n();
  const place = usePlace();
  return (
    <Link to={admin ? `/admin/orders?open=${o.id}` : `/orders/${o.id}`} className="card flex items-center gap-3 p-3 transition hover:shadow-md">
      {o.cover_url ? <img src={o.cover_url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl" aria-hidden="true">📦</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{o.product_title}</p>
        <p className="truncate text-xs text-slate-500"><span className="ltr-nums">#{o.id}</span> · {place(o)} · {ago(o.created_at)}</p>
        <OrderStatus status={o.status} className="mt-1" />
      </div>
      <span className="shrink-0 text-end text-sm font-bold text-brand-800 ltr-nums">{price(o.total)}</span>
    </Link>
  );
}

export function Orders() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const as = ['buyer', 'seller', 'courier'].includes(params.get('as')) ? params.get('as') : 'buyer';
  const { data, loading, error } = useApi(`/orders?as=${as}`);
  const me = useApi('/couriers/me');
  useDocumentTitle(t('delivery.orders.title'));
  const tabs = ['buyer', 'seller', ...(me.data?.courier?.status === 'approved' ? ['courier'] : [])];
  const items = data?.items || [];
  const open = items.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const past = items.filter((o) => ['delivered', 'cancelled'].includes(o.status));
  return (
    <div className="container-page max-w-3xl py-8">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold"><span aria-hidden="true">📦</span>{t('delivery.orders.title')}</h1>
      <div role="tablist" className="mb-5 flex gap-1 rounded-2xl bg-slate-100 p-1">
        {tabs.map((k) => (
          <button key={k} role="tab" aria-selected={as === k} onClick={() => setParams({ as: k })}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${as === k ? 'bg-surface text-brand-800 shadow' : 'text-slate-600'}`}>{t(`delivery.orders.as.${k}`)}</button>
        ))}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState icon="grid" title={t(`delivery.orders.empty.${as}`)}>
          {as === 'buyer' && <Link to="/products" className="btn-primary mt-3">{t('delivery.orders.browse')}</Link>}
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && <section><h2 className="mb-2 text-sm font-bold text-slate-500">{t('delivery.orders.open')}</h2><div className="space-y-2">{open.map((o) => <OrderRow key={o.id} o={o} />)}</div></section>}
          {past.length > 0 && <section><h2 className="mb-2 text-sm font-bold text-slate-500">{t('delivery.orders.history')}</h2><div className="space-y-2">{past.map((o) => <OrderRow key={o.id} o={o} />)}</div></section>}
        </div>
      )}
    </div>
  );
}

// ---------- One order ----------

function Stepper({ status }) {
  const { t } = useI18n();
  if (status === 'cancelled') return null;
  const at = ORDER_STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-6 gap-1" aria-label={t('delivery.order.progress')}>
      {ORDER_STEPS.map((s, i) => (
        <li key={s} className="flex flex-col items-center text-center" aria-current={i === at ? 'step' : undefined}>
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i < at ? 'bg-brand-700 text-white' : i === at ? 'bg-gold-400 text-brand-900 ring-4 ring-gold-300/40' : 'bg-slate-200 text-slate-500'}`}>
            {i < at ? <Icon name="check" className="h-4 w-4" /> : i + 1}
          </span>
          <span className={`mt-1 text-[10px] leading-tight sm:text-xs ${i <= at ? 'font-semibold text-brand-900 dark-brand-text' : 'text-slate-400'}`}>{t(`delivery.status.${s}`)}</span>
        </li>
      ))}
    </ol>
  );
}

const ACTION_STYLE = { cancelled: 'btn-outline border-rose-300 text-rose-700 hover:bg-rose-50', delivered: 'btn-primary', on_the_way: 'btn-accent' };

/** Buttons for the moves this person may make now (from the API's `next`). */
export function OrderActions({ order, onDone }) {
  const { t } = useI18n();
  const { notify } = useApp();
  const [cancel, setCancel] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);
  const move = async (status, reason) => {
    setBusy(status); setError(null);
    try {
      await api(`/orders/${order.id}/status`, { method: 'POST', body: { status, note: reason || undefined } });
      notify(t('delivery.order.updated'));
      setCancel(false); setNote('');
      onDone();
    } catch (err) { setError(err); } finally { setBusy(''); }
  };
  if (!order.next?.length) return null;
  const buyerOnly = order.my_roles.length === 1 && order.my_roles[0] === 'buyer';
  return (
    <div className="space-y-2">
      <ErrorBox error={error} />
      <div className="flex flex-wrap gap-2">
        {order.next.map((s) => (
          <button key={s} type="button" disabled={Boolean(busy)} onClick={() => (s === 'cancelled' ? setCancel(true) : move(s))}
            className={`${ACTION_STYLE[s] || 'btn-primary'} flex-1 sm:flex-none`}>
            {busy === s ? t('common.loading') : t(`delivery.action.${s}`)}
          </button>
        ))}
      </div>
      <Modal open={cancel} onClose={() => setCancel(false)} title={t('delivery.action.cancelled')}>
        <form onSubmit={(e) => { e.preventDefault(); move('cancelled', note); }} className="space-y-3">
          <Field label={t('delivery.order.cancelReason')} optional={buyerOnly}>
            <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} required={!buyerOnly} />
          </Field>
          <ErrorBox error={error} />
          <button className="btn w-full bg-rose-600 text-white hover:bg-rose-700" disabled={busy === 'cancelled'}>{t('delivery.order.confirmCancel')}</button>
        </form>
      </Modal>
    </div>
  );
}

function RateDelivery({ order, onDone }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setBusy(true);
    try { await api(`/orders/${order.id}/rate`, { method: 'POST', body: { rating, comment } }); onDone(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card space-y-3 border-gold-300 p-5">
      <h2 className="font-bold">{t('delivery.rate.title')}</h2>
      <Stars value={rating} onChange={setRating} size="h-7 w-7" />
      <textarea className="input" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder={t('delivery.rate.placeholder')} aria-label={t('delivery.rate.placeholder')} />
      <ErrorBox error={error} />
      <button className="btn-primary" disabled={!rating || busy}>{t('delivery.rate.submit')}</button>
    </form>
  );
}

/** Live map: the courier (when shared) and the delivery point. */
function TrackingMap({ order }) {
  const { t, ago } = useI18n();
  const dest = order.lat != null ? { lat: Number(order.lat), lng: Number(order.lng), title: t('delivery.track.destination') } : null;
  const courier = order.courier_location;
  const markers = useMemo(() => (courier ? [{ id: 'c', lat: Number(courier.lat), lng: Number(courier.lng), title: `🛵 ${order.courier_name || t('delivery.track.courier')}`, subtitle: ago(courier.at) }] : []), [courier?.lat, courier?.lng, courier?.at]); // eslint-disable-line react-hooks/exhaustive-deps
  const me = useMemo(() => dest, [dest?.lat, dest?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!['picked_up', 'on_the_way'].includes(order.status)) return null;
  const canSee = order.my_roles.some((r) => r === 'buyer' || r === 'admin');
  if (!canSee) return null;
  return (
    <section className="card space-y-3 p-5">
      <h2 className="flex items-center gap-2 font-bold"><span aria-hidden="true">🗺️</span>{t('delivery.track.title')}</h2>
      {courier ? (
        <>
          <MapView center={[Number(courier.lat), Number(courier.lng)]} zoom={14} markers={markers} me={me} className="h-72" label={t('delivery.track.title')} />
          <p className="text-xs text-slate-500">{t('delivery.track.updated', { ago: ago(courier.at) })} · {t('delivery.track.legend')}</p>
        </>
      ) : <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{t('delivery.track.notShared')}</p>}
    </section>
  );
}

export function OrderDetailView({ id, admin = false, extra }) {
  const { t, price, dateTime } = useI18n();
  const place = usePlace();
  const { data, loading, error, reload } = useApi(`/orders/${id}`);
  const o = data?.order;
  const live = o && !['delivered', 'cancelled'].includes(o.status);
  // Refresh while the order is moving (status changes, courier position).
  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(() => { if (!document.hidden) reload(); }, ['picked_up', 'on_the_way'].includes(o.status) ? 10000 : 30000);
    return () => clearInterval(timer);
  }, [live, o?.status, reload]);
  useDocumentTitle(o ? `${t('delivery.order.title')} #${o.id}` : t('delivery.order.title'));
  if (loading && !o) return <Spinner />;
  if (error && !o) return <ErrorBox error={error} />;
  const roles = o.my_roles;
  const isCourier = roles.includes('courier');
  return (
    <div className="space-y-5">
      <div className="card space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            {o.cover_url && <img src={o.cover_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{t('delivery.order.title')} <span className="ltr-nums">#{o.id}</span> · {dateTime(o.created_at)}</p>
              <h1 className="text-lg font-bold">{o.product_id ? <Link className="hover:underline" to={`/products/${o.product_id}`}>{o.product_title}</Link> : o.product_title}</h1>
              <div className="mt-1 flex flex-wrap gap-1">{roles.filter((r) => r !== 'admin' || admin).map((r) => <span key={r} className="badge bg-slate-100 text-slate-600">{t(`delivery.role.${r}`)}</span>)}</div>
            </div>
          </div>
          <OrderStatus status={o.status} className="text-sm" />
        </div>
        <Stepper status={o.status} />
        {o.status === 'cancelled' && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{t('delivery.order.cancelledBy', { who: t(`delivery.role.${o.cancelled_by || 'admin'}`) })}{o.cancel_reason ? ` — ${o.cancel_reason}` : ''}</p>
        )}
        {o.status === 'pending' && roles.includes('seller') && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t('delivery.order.sellerPending')}</p>}
        {['accepted', 'preparing'].includes(o.status) && !o.courier_id && <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800">{t('delivery.order.waitingCourier')}</p>}
        <OrderActions order={o} onDone={reload} />
        <EscrowPanel order={o} onDone={reload} />
        {extra?.(o, reload)}
      </div>

      <TrackingMap order={o} />
      {isCourier && ['picked_up', 'on_the_way'].includes(o.status) && <LiveShare compact />}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-bold">{t('delivery.order.costs')}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">{t('delivery.cost.item')}</dt><dd className="ltr-nums">{price(o.item_price)}</dd></div>
            {Number(o.discount) > 0 && <div className="flex justify-between text-emerald-700"><dt>🏷️ {t('pro.coupon.discount', { code: o.coupon_code || '' })}</dt><dd><bdi dir="ltr">−{price(o.discount)}</bdi></dd></div>}
            <div className="flex justify-between"><dt className="text-slate-600">{t('delivery.cost.delivery')} <span className="text-[11px] text-slate-400">({t('delivery.cost.distance', { km: String(Number(o.distance_km)) })})</span></dt><dd className="ltr-nums">{price(o.delivery_fee)}</dd></div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold"><dt>{t('delivery.cost.total')}</dt><dd className="text-brand-800 ltr-nums">{price(o.total)}</dd></div>
          </dl>
          <p className="mt-3 rounded-xl bg-gold-300/20 p-2.5 text-xs text-brand-900">{o.payment_method === 'escrow' ? `🔒 ${t('escrow.paidOnline')}` : `💵 ${t('delivery.cod.short')}`}</p>
          {!admin && <Link to={`/orders/${o.id}/invoice`} className="btn-outline mt-3 w-full text-xs">🧾 {t('pro.invoice.open')}</Link>}
        </section>

        <section className="card space-y-2 p-5 text-sm">
          <h2 className="mb-1 font-bold">{t('delivery.order.deliverTo')}</h2>
          <p className="flex items-start gap-2"><Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />{place(o)}</p>
          {o.address && <p className="text-slate-700">{o.address}</p>}
          {o.phone && <a href={`tel:${o.phone}`} className="flex items-center gap-2 font-semibold text-brand-800"><Icon name="phone" className="h-4 w-4" /><span className="ltr-nums">{o.phone}</span></a>}
          {o.note && <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">📝 {o.note}</p>}
          {o.lat != null && isCourier && (
            <a className="btn-outline mt-1 w-full text-xs" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${o.lat}&mlon=${o.lng}#map=17/${o.lat}/${o.lng}`}>🧭 {t('delivery.order.openMap')}</a>
          )}
          {!o.address && !o.phone && <p className="text-xs text-slate-500">🔒 {t('delivery.order.addressHidden')}</p>}
        </section>

        <section className="card space-y-3 p-5 text-sm">
          <h2 className="font-bold">{t('delivery.order.people')}</h2>
          <div className="flex items-center gap-3">
            <Avatar name={o.seller_name} size="h-9 w-9" />
            <div className="min-w-0 flex-1"><p className="text-xs text-slate-500">{t('delivery.role.seller')}</p><p className="font-semibold">{o.seller_name}</p></div>
            {o.seller_phone && <a href={`tel:${o.seller_phone}`} className="btn-ghost p-2" aria-label={t('delivery.order.call')}><Icon name="phone" className="h-4 w-4" /></a>}
          </div>
          {(roles.includes('seller') || roles.includes('courier') || roles.includes('admin')) && (
            <div className="flex items-center gap-3"><Avatar name={o.buyer_name} size="h-9 w-9" /><div><p className="text-xs text-slate-500">{t('delivery.role.buyer')}</p><p className="font-semibold">{o.buyer_name}</p></div></div>
          )}
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-300/40 text-lg" aria-hidden="true">🛵</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">{t('delivery.role.courier')}</p>
              {o.courier_id ? (
                <p className="font-semibold">{o.courier_name} <span className="text-xs font-normal text-slate-500">· {t(`delivery.vehicle.${o.courier_vehicle}`)}</span>
                  {o.courier_rating && <span className="ms-1 text-xs text-gold-600">★ {String(o.courier_rating)}</span>}</p>
              ) : <p className="text-slate-500">{t('delivery.order.noCourier')}</p>}
            </div>
            {o.courier_phone && <a href={`tel:${o.courier_phone}`} className="btn-ghost p-2" aria-label={t('delivery.order.call')}><Icon name="phone" className="h-4 w-4" /></a>}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold">{t('delivery.order.timeline')}</h2>
          <ol className="relative space-y-3 border-s-2 border-brand-100 ps-4">
            {o.events.map((e, i) => (
              <li key={i} className="relative">
                <span className="absolute -start-[1.4rem] top-1 h-3 w-3 rounded-full bg-brand-600 ring-2 ring-surface" />
                <p className="text-sm font-semibold">{t(`delivery.event.${e.status}`)}</p>
                <p className="text-xs text-slate-500">{dateTime(e.created_at)} · {t(`delivery.role.${e.actor_role}`)}</p>
                {e.note && <p className="mt-0.5 text-xs text-slate-600">{e.note}</p>}
              </li>
            ))}
          </ol>
        </section>
      </div>

      {o.can_rate && <RateDelivery order={o} onDone={reload} />}
      {o.rating && (
        <section className="card flex items-center gap-3 p-5">
          <span className="font-bold">{t('delivery.rate.yours')}</span><Stars value={o.rating.rating} />
          {o.rating.comment && <span className="text-sm text-slate-600">“{o.rating.comment}”</span>}
        </section>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  return (
    <div className="container-page max-w-4xl py-8">
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-700"><Icon name="chevron" className="h-4 w-4 ltr:rotate-180" />{t('delivery.orders.title')}</Link>
      <OrderDetailView id={id} />
    </div>
  );
}

// ---------- Delivery partners ----------

/**
 * Sends the courier's position while they carry a parcel — only after they switched sharing on
 * (explicit consent), only while this page is open, and the server keeps it only during a delivery.
 */
function useLiveLocation(enabled) {
  const [state, setState] = useState('off');
  const last = useRef(0);
  useEffect(() => {
    if (!enabled || !navigator.geolocation) { setState(enabled ? 'unsupported' : 'off'); return undefined; }
    setState('waiting');
    const id = navigator.geolocation.watchPosition((pos) => {
      if (Date.now() - last.current < 15000) return;
      last.current = Date.now();
      api('/couriers/me/location', { method: 'POST', body: { lat: pos.coords.latitude, lng: pos.coords.longitude } })
        .then((r) => setState(r.stored ? 'live' : 'idle')).catch(() => setState('error'));
    }, () => setState('denied'), { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);
  return state;
}

/** The consent switch for live tracking, plus its live status. */
function LiveShare({ compact = false }) {
  const { t } = useI18n();
  const { data, reload } = useApi('/couriers/me');
  const c = data?.courier;
  const state = useLiveLocation(Boolean(c?.share_location));
  const toggle = async (v) => { await api('/couriers/me', { method: 'PATCH', body: { shareLocation: v } }); reload(); };
  if (!c || c.status !== 'approved') return null;
  return (
    <section className={`card space-y-2 ${compact ? 'p-4' : 'p-5'}`}>
      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span>
          <span className="block font-semibold">📡 {t('delivery.courier.shareTitle')}</span>
          <span className="text-xs text-slate-500">{t('delivery.courier.shareHint')}</span>
        </span>
        <input type="checkbox" className="mt-1 h-5 w-5 accent-[rgb(var(--brand-700))]" checked={c.share_location} onChange={(e) => toggle(e.target.checked)} />
      </label>
      {c.share_location && <p className={`rounded-lg px-3 py-1.5 text-xs ${state === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>{t(`delivery.courier.live.${state}`)}</p>}
    </section>
  );
}

function CourierApply({ previous, onDone }) {
  const { t, lang } = useI18n();
  const { user, meta } = useApp();
  const [f, setF] = useState({ phone: (previous?.phone || user?.phone || '').replace(/^\+222/, ''), city: previous?.city || user?.city || '', vehicle: previous?.vehicle || 'motorbike', note: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = useFieldError(error);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await api('/couriers/apply', { method: 'POST', body: f }); onDone(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h2 className="text-lg font-bold">{t('delivery.join.formTitle')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('delivery.fields.phone')} error={fieldError('phone')}><PhoneInput value={f.phone} onChange={(v) => setF({ ...f, phone: v })} required /></Field>
        <Field label={t('delivery.join.city')} error={fieldError('city')}><CitySelect value={f.city} onChange={(v) => setF({ ...f, city: v })} cities={meta.cities} placeholder={t('geo.chooseCity')} required /></Field>
      </div>
      <fieldset>
        <legend className="label">{t('delivery.join.vehicle')}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {VEHICLES.map((v) => (
            <label key={v} className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-sm ${f.vehicle === v ? 'border-brand-600 bg-brand-50 font-semibold text-brand-900' : 'border-slate-200'}`}>
              <input type="radio" name="vehicle" value={v} checked={f.vehicle === v} onChange={() => setF({ ...f, vehicle: v })} className="sr-only" />
              <span aria-hidden="true" className="text-2xl">{{ motorbike: '🛵', car: '🚗', tricycle: '🛺', bicycle: '🚲', foot: '🚶' }[v]}</span>{t(`delivery.vehicle.${v}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={t('delivery.join.note')} optional><textarea className="input" rows={3} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} maxLength={500} placeholder={t('delivery.join.notePh')} /></Field>
      <p className="text-xs text-slate-500" lang={lang}>🔒 {t('delivery.join.privacy')}</p>
      <ErrorBox error={error} />
      <button className="btn-primary w-full sm:w-auto" disabled={busy}>{busy ? t('common.loading') : t('delivery.join.submit')}</button>
    </form>
  );
}

function CourierDashboard({ courier, reload }) {
  const { t, price, number, ago } = useI18n();
  const { notify } = useApp();
  const navigate = useNavigate();
  const available = useApi('/couriers/available');
  const mine = useApi('/orders?as=courier');
  const [error, setError] = useState(null);
  const s = courier.stats;
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) { available.reload(); mine.reload(); } }, 30000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const setAvailable = async (v) => { await api('/couriers/me', { method: 'PATCH', body: { isAvailable: v } }); reload(); };
  const claim = async (id) => {
    setError(null);
    try {
      await api(`/orders/${id}/claim`, { method: 'POST' });
      notify(t('delivery.courier.claimed'));
      navigate(`/orders/${id}`);
    } catch (err) { setError(err); available.reload(); }
  };
  const active = (mine.data?.items || []).filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const done = (mine.data?.items || []).filter((o) => ['delivered', 'cancelled'].includes(o.status));
  const tiles = [['🚚', t('delivery.courier.active'), number(s.active)], ['✅', t('delivery.courier.delivered'), number(s.delivered)], ['💵', t('delivery.courier.earned'), price(s.earned)], ['⭐', t('delivery.courier.rating'), s.rating ? `${String(s.rating)} (${number(s.ratings)})` : '—']];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([icon, label, v]) => <div key={label} className="card p-4"><p className="text-xs text-slate-500"><span aria-hidden="true">{icon}</span> {label}</p><p className="mt-1 text-xl font-bold ltr-nums">{v}</p></div>)}
      </div>
      <Link to="/wallet" className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 hover:bg-amber-100">
        <span>💳 {t('pay.courierLink')}</span><span aria-hidden="true" className="inline-block rtl:rotate-180">→</span>
      </Link>
      <div className="grid gap-3 md:grid-cols-2">
        <section className="card p-5">
          <label className="flex cursor-pointer items-start justify-between gap-4">
            <span><span className="block font-semibold">🟢 {t('delivery.courier.availableTitle')}</span><span className="text-xs text-slate-500">{t('delivery.courier.availableHint')}</span></span>
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[rgb(var(--brand-700))]" checked={courier.is_available} onChange={(e) => setAvailable(e.target.checked)} />
          </label>
        </section>
        <LiveShare />
      </div>

      <section>
        <h2 className="mb-2 font-bold">{t('delivery.courier.myDeliveries')}</h2>
        {mine.loading ? <Spinner /> : active.length ? <div className="space-y-2">{active.map((o) => <OrderRow key={o.id} o={o} />)}</div> : <p className="card p-4 text-sm text-slate-500">{t('delivery.courier.noActive')}</p>}
      </section>

      <section>
        <h2 className="mb-2 flex items-center justify-between font-bold">{t('delivery.courier.availableOrders')}
          <button className="btn-ghost px-2 py-1 text-xs" onClick={available.reload}>{t('delivery.courier.refresh')}</button></h2>
        <ErrorBox error={error} />
        {available.loading ? <Spinner /> : !(available.data?.items || []).length ? <p className="card p-4 text-sm text-slate-500">{t('delivery.courier.noneAvailable')}</p> : (
          <ul className="space-y-2">
            {available.data.items.map((o) => (
              <li key={o.id} className="card flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{o.product_title}</p>
                  <AvailablePlace o={o} />
                  <p className="text-xs text-slate-500">{t('delivery.cost.distance', { km: String(Number(o.distance_km)) })} · {ago(o.created_at)}</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-slate-500">{t('delivery.courier.yourFee')}</p>
                  <p className="font-bold text-brand-800 ltr-nums">{price(o.delivery_fee)}</p>
                </div>
                <button className="btn-primary w-full sm:w-auto" onClick={() => claim(o.id)}>{t('delivery.courier.take')}</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && <section><h2 className="mb-2 font-bold">{t('delivery.orders.history')}</h2><div className="space-y-2">{done.map((o) => <OrderRow key={o.id} o={o} />)}</div></section>}
    </div>
  );
}

function AvailablePlace({ o }) {
  const { t } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const areaName = useAreaName();
  return (
    <p className="text-xs text-slate-600">
      {t('delivery.courier.from')} <strong>{cityName(meta.cities, o.pickup_city || o.city)}</strong> ({o.seller_name}) → {t('delivery.courier.to')} <strong>{[cityName(meta.cities, o.city), areaName(o.city, o.area), o.district].filter(Boolean).join(' · ')}</strong>
    </p>
  );
}

/** /courier (and /delivery/join): join the delivery partners, then work as one. */
export function Courier() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi('/couriers/me');
  const [reapply, setReapply] = useState(false);
  useDocumentTitle(t('delivery.join.title'));
  const c = data?.courier;
  const steps = ['apply', 'review', 'deliver', 'earn'];
  return (
    <div className="container-page max-w-4xl py-8">
      <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-gold-300">{t('delivery.join.kicker')}</p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl"><span aria-hidden="true">🛵 </span>{c?.status === 'approved' ? t('delivery.courier.title') : t('delivery.join.title')}</h1>
        <p className="mt-2 max-w-xl text-sm text-white/80">{c?.status === 'approved' ? t('delivery.courier.subtitle') : t('delivery.join.subtitle')}</p>
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : c?.status === 'approved' ? <CourierDashboard courier={c} reload={reload} /> : (
        <div className="space-y-5">
          {!c && (
            <ol className="grid gap-3 sm:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s} className="card p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 font-bold text-brand-900">{i + 1}</span>
                  <p className="mt-2 font-semibold">{t(`delivery.join.steps.${s}`)}</p><p className="text-xs text-slate-500">{t(`delivery.join.steps.${s}Text`)}</p></li>
              ))}
            </ol>
          )}
          {c?.status === 'pending' && <div className="card border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-900">⏳ {t('delivery.join.pendingTitle')}</p><p className="mt-1 text-sm text-amber-800">{t('delivery.join.pendingText')}</p></div>}
          {c?.status === 'suspended' && <div className="card border-rose-200 bg-rose-50 p-5"><p className="font-bold text-rose-800">{t('delivery.join.suspendedTitle')}</p>{c.admin_note && <p className="mt-1 text-sm text-rose-700">{c.admin_note}</p>}</div>}
          {c?.status === 'rejected' && (
            <div className="card border-rose-200 bg-rose-50 p-5">
              <p className="font-bold text-rose-800">{t('delivery.join.rejectedTitle')}</p>
              {c.admin_note && <p className="mt-1 text-sm text-rose-700">{c.admin_note}</p>}
              {!reapply && <button className="btn-outline mt-3 bg-surface" onClick={() => setReapply(true)}>{t('delivery.join.reapply')}</button>}
            </div>
          )}
          {(!c || (c.status === 'rejected' && reapply)) && <CourierApply previous={c} onDone={() => { setReapply(false); reload(); }} />}
        </div>
      )}
    </div>
  );
}

export function RedirectToCourier() { return <Navigate to="/courier" replace />; }
