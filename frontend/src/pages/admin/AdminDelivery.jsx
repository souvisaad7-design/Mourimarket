// Admin: follow every delivery order, assign couriers, review delivery partners.
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Avatar, EmptyState, ErrorBox, Field, Icon, Modal, Pagination, Spinner, useCityName } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';
import { OrderDetailView, OrderStatus, useAreaName } from '../Delivery.jsx';

function Title({ icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold"><span aria-hidden="true">{icon}</span>{title}</h1>
      {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

const FILTERS = ['open', 'pending', 'accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled', 'all'];

/** Choose (or remove) the courier of an order that has not been picked up yet. */
function AssignCourier({ order, onDone }) {
  const { t } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const { notify } = useApp();
  const couriers = useApi('/admin/couriers?status=approved');
  const [pick, setPick] = useState(order.courier_id || '');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  if (['picked_up', 'on_the_way', 'delivered', 'cancelled'].includes(order.status)) return null;
  const list = (couriers.data?.items || []).filter((c) => ![order.buyer_id, order.seller_id].includes(c.user_id));
  const sameCity = (c) => c.city === (order.pickup_city || order.city);
  list.sort((a, b) => Number(sameCity(b)) - Number(sameCity(a)) || Number(b.is_available) - Number(a.is_available));
  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api(`/admin/orders/${order.id}/assign`, { method: 'PATCH', body: { courierId: pick ? Number(pick) : null } });
      notify(t('common.changesSaved'));
      onDone();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="space-y-2 rounded-2xl border border-gold-300 bg-gold-300/10 p-4">
      <p className="text-sm font-bold">🛵 {t('delivery.admin.assign')}</p>
      <div className="flex flex-wrap gap-2">
        <select className="input min-w-0 flex-1" value={pick} onChange={(e) => setPick(e.target.value)} aria-label={t('delivery.admin.assign')}>
          <option value="">{t('delivery.admin.noCourier')}</option>
          {list.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {cityName(meta.cities, c.city)} · {t(`delivery.vehicle.${c.vehicle}`)}{c.is_available ? '' : ` · ${t('delivery.admin.busy')}`}{c.rating ? ` · ★${c.rating}` : ''}
            </option>
          ))}
        </select>
        <button className="btn-primary" disabled={busy || String(pick) === String(order.courier_id || '')}>{t('common.saveChanges')}</button>
      </div>
      {!list.length && !couriers.loading && <p className="text-xs text-slate-500">{t('delivery.admin.noCouriers')}</p>}
      <ErrorBox error={error} />
    </form>
  );
}

export function AdminOrders() {
  const { t, price, ago, number } = useI18n();
  const { meta } = useApp();
  const cityName = useCityName();
  const areaName = useAreaName();
  const [params, setParams] = useSearchParams();
  const status = FILTERS.includes(params.get('status')) ? params.get('status') : 'open';
  const page = Number(params.get('page')) || 1;
  const openId = params.get('open');
  const [q, setQ] = useState(params.get('q') || '');
  const query = new URLSearchParams({ page, ...(status !== 'all' ? { status } : {}), ...(params.get('q') ? { q: params.get('q') } : {}) });
  const { data, loading, error, reload } = useApi(`/admin/orders?${query}`);
  useDocumentTitle(t('delivery.admin.orders'));
  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };
  const counts = data?.counts || {};
  const countOf = (f) => (f === 'all' ? Object.values(counts).reduce((a, b) => a + b, 0)
    : f === 'open' ? ['pending', 'accepted', 'preparing', 'picked_up', 'on_the_way'].reduce((a, k) => a + (counts[k] || 0), 0) : counts[f] || 0);

  return (
    <div>
      <Title icon="📦" title={t('delivery.admin.orders')} subtitle={t('delivery.admin.ordersHint')} />
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => update({ status: f, page: '' })}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${status === f ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {f === 'open' ? t('delivery.admin.open') : f === 'all' ? t('delivery.admin.all') : t(`delivery.status.${f}`)} <span className="ltr-nums opacity-75">{number(countOf(f))}</span>
          </button>
        ))}
      </div>
      <form className="mb-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); update({ q: q.trim(), page: '' }); }}>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('delivery.admin.search')} aria-label={t('delivery.admin.search')} />
        <button className="btn-primary"><Icon name="search" className="h-4 w-4" /></button>
      </form>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="grid" title={t('delivery.admin.noOrders')} /> : (
        <>
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>{['#', 'product', 'people', 'place', 'total', 'status', 'date'].map((h) => <th key={h} className="px-3 py-2 text-start font-semibold">{h === '#' ? '#' : t(`delivery.admin.col.${h}`)}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((o) => (
                  <tr key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => update({ open: String(o.id) })}>
                    <td className="px-3 py-2.5 font-mono text-xs">{o.id}</td>
                    <td className="max-w-[14rem] truncate px-3 py-2.5 font-semibold">{o.product_title}</td>
                    <td className="px-3 py-2.5 text-xs">
                      <span className="block">🛒 {o.buyer_name}</span><span className="block">🏪 {o.seller_name}</span>
                      <span className={`block ${o.courier_name ? '' : 'text-amber-700'}`}>🛵 {o.courier_name || t('delivery.admin.noCourier')}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{cityName(meta.cities, o.city)}{o.area ? ` · ${areaName(o.city, o.area)}` : ''}<span className="block text-slate-400">{String(Number(o.distance_km))} km</span></td>
                    <td className="px-3 py-2.5 ltr-nums"><span className="font-semibold">{price(o.total)}</span><span className="block text-xs text-slate-400">🛵 {price(o.delivery_fee)}</span></td>
                    <td className="px-3 py-2.5"><OrderStatus status={o.status} /></td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{ago(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-2 md:hidden">
            {data.items.map((o) => (
              <li key={o.id}>
                <button className="card w-full p-3 text-start" onClick={() => update({ open: String(o.id) })}>
                  <div className="flex items-start justify-between gap-2"><p className="font-semibold">#{o.id} · {o.product_title}</p><OrderStatus status={o.status} /></div>
                  <p className="mt-1 text-xs text-slate-500">🛒 {o.buyer_name} · 🏪 {o.seller_name} · 🛵 {o.courier_name || t('delivery.admin.noCourier')}</p>
                  <p className="mt-1 text-sm font-bold text-brand-800 ltr-nums">{price(o.total)}</p>
                </button>
              </li>
            ))}
          </ul>
          <Pagination page={page} total={Number(data.total)} limit={data.limit} onPage={(p) => update({ page: String(p) })} />
        </>
      )}
      <Modal open={Boolean(openId)} onClose={() => { update({ open: '' }); reload(); }} title={`${t('delivery.order.title')} #${openId || ''}`} size="lg">
        {openId && <OrderDetailView key={openId} id={openId} admin extra={(o, done) => <AssignCourier order={o} onDone={() => { done(); reload(); }} />} />}
      </Modal>
    </div>
  );
}

export function AdminCouriers() {
  const { t, dateTime, number } = useI18n();
  const { meta, notify } = useApp();
  const cityName = useCityName();
  const [status, setStatus] = useState('pending');
  const { data, loading, error, reload } = useApi(`/admin/couriers?status=${status}`);
  const [act, setAct] = useState(null); // { courier, status }
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [actErr, setActErr] = useState(null);
  useDocumentTitle(t('delivery.admin.couriers'));
  const decide = async (courier, next, reason) => {
    setBusy(true); setActErr(null);
    try {
      await api(`/admin/couriers/${courier.id}`, { method: 'PATCH', body: { status: next, note: reason || undefined } });
      notify(t('common.changesSaved'));
      setAct(null); setNote('');
      reload();
    } catch (err) { setActErr(err); } finally { setBusy(false); }
  };
  const counts = data?.counts || {};
  return (
    <div>
      <Title icon="🛵" title={t('delivery.admin.couriers')} subtitle={t('delivery.admin.couriersHint')} />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {['pending', 'approved', 'suspended', 'rejected', 'all'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${status === s ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {t(`delivery.courierStatus.${s}`)} {s !== 'all' && <span className="ltr-nums opacity-75">{number(counts[s] || 0)}</span>}
          </button>
        ))}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="users" title={t('delivery.admin.noCouriersHere')} /> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {data.items.map((c) => (
            <li key={c.id} className="card space-y-3 p-4">
              <div className="flex items-start gap-3">
                <Avatar name={c.name} url={c.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{c.name} <span className="badge ms-1 bg-slate-100 text-slate-600">{t(`delivery.courierStatus.${c.status}`)}</span></p>
                  <p className="text-xs text-slate-500">{cityName(meta.cities, c.city)} · {t(`delivery.vehicle.${c.vehicle}`)} · {dateTime(c.created_at)}</p>
                  <a href={`tel:${c.phone}`} className="text-sm font-semibold text-brand-800 ltr-nums">{c.phone}</a>
                </div>
              </div>
              {c.note && <p className="rounded-lg bg-slate-50 p-2 text-sm text-slate-700">{c.note}</p>}
              {c.admin_note && <p className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{c.admin_note}</p>}
              <p className="text-xs text-slate-500">✅ {number(c.delivered)} · 🚚 {number(c.active)} · ⭐ {c.rating ? String(c.rating) : '—'} · {c.is_available ? `🟢 ${t('delivery.admin.availableNow')}` : `⚪ ${t('delivery.admin.busy')}`}</p>
              <div className="flex flex-wrap gap-2">
                {c.status !== 'approved' && <button className="btn-primary flex-1" disabled={busy} onClick={() => decide(c, 'approved')}><Icon name="check" className="h-4 w-4" />{c.status === 'suspended' ? t('delivery.admin.reactivate') : t('delivery.admin.approve')}</button>}
                {c.status === 'pending' && <button className="btn-outline flex-1 text-rose-700" onClick={() => setAct({ courier: c, status: 'rejected' })}>{t('delivery.admin.reject')}</button>}
                {c.status === 'approved' && <button className="btn-outline flex-1 text-rose-700" onClick={() => setAct({ courier: c, status: 'suspended' })}>{t('delivery.admin.suspend')}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={Boolean(act)} onClose={() => setAct(null)} title={act ? t(`delivery.admin.${act.status === 'rejected' ? 'reject' : 'suspend'}`) : ''}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); decide(act.courier, act.status, note); }}>
          <Field label={t('delivery.admin.reason')}><textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} required maxLength={500} /></Field>
          <ErrorBox error={actErr} />
          <button className="btn w-full bg-rose-600 text-white hover:bg-rose-700" disabled={busy}>{t('common.confirm')}</button>
        </form>
      </Modal>
    </div>
  );
}
