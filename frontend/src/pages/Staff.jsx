// /staff – for a store employee: the store, my role, and the store's listings and/or orders I handle.
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Spinner, StatusBadge } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { thumb } from '../lib/dataSaver.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { OrderRow } from './Delivery.jsx';

const CAN = { listings: ['listings', 'manager'], orders: ['orders', 'manager'] };

export default function StaffHome() {
  const { t, price } = useI18n();
  const { refreshUser } = useApp();
  useDocumentTitle(t('staff.title'));
  const me = useApi('/staff/me');
  const staff = me.data?.staff;
  const listings = useApi(staff && CAN.listings.includes(staff.role) ? '/products/mine?store=1' : null, undefined, [staff?.role]);
  const orders = useApi(staff && CAN.orders.includes(staff.role) ? '/orders?as=store' : null, undefined, [staff?.role]);
  if (me.loading) return <Spinner />;
  if (me.error) return <div className="container-page py-10"><ErrorBox error={me.error} /></div>;
  if (!staff) return <div className="container-page py-10"><EmptyState icon="store" title={t('staff.none')}><p className="text-sm text-slate-500">{t('staff.noneHint')}</p></EmptyState></div>;
  const leave = async () => {
    if (!window.confirm(t('staff.leaveConfirm', { store: staff.name }))) return;
    await api('/staff/me', { method: 'DELETE' });
    await refreshUser?.();
    me.reload();
  };
  return (
    <div className="container-page max-w-5xl space-y-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-l from-brand-600 to-brand-900 p-6 text-white">
        <div>
          <p className="text-sm text-white/80">{t('staff.youWorkFor')}</p>
          <h1 className="text-2xl font-bold">🏪 {staff.name}</h1>
          <p className="mt-1 text-sm"><span className="rounded-full bg-white/20 px-3 py-0.5">{t(`staff.roles.${staff.role}`)}</span></p>
        </div>
        <Link to={`/stores/${staff.slug}`} className="btn bg-white text-brand-800">{t('pro.look.view')}</Link>
      </header>
      <p className="text-xs text-slate-500">{t(`staff.roleHint.${staff.role}`)}</p>

      {CAN.listings.includes(staff.role) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">📋 {t('staff.listings')}</h2>
            <Link to="/sell?forStore=1" className="btn-primary text-sm">+ {t('staff.addListing')}</Link>
          </div>
          {listings.loading ? <Spinner /> : listings.data?.items?.length ? (
            <ul className="card divide-y divide-slate-100 p-0">
              {listings.data.items.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-3">
                  {p.cover_url ? <img src={thumb(p.cover_url, 240)} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />}
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${p.id}`} className="line-clamp-1 font-semibold hover:text-brand-700">{p.title}</Link>
                    <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><span className="ltr-nums">{price(p.price)}</span><StatusBadge status={p.status} />{p.availability === 'sold' && <span>{t('common.sold')}</span>}</p>
                  </div>
                  <Link to={`/products/${p.id}/edit`} className="btn-outline px-3 py-1.5 text-xs">{t('common.edit')}</Link>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon="grid" title={t('common.empty')} />}
        </section>
      )}

      {CAN.orders.includes(staff.role) && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">📦 {t('staff.orders')}</h2>
          {orders.loading ? <Spinner /> : orders.data?.items?.length
            ? <div className="space-y-2">{orders.data.items.map((o) => <OrderRow key={o.id} o={o} />)}</div>
            : <EmptyState icon="grid" title={t('staff.noOrders')} />}
        </section>
      )}

      <button type="button" className="text-xs text-rose-600 hover:underline" onClick={leave}>{t('staff.leave')}</button>
    </div>
  );
}
