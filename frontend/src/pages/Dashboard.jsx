import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Icon, Modal, PageHeader, Spinner, StatusBadge } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import BecomeSeller from '../components/BecomeSeller.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import MerchantStatus from '../components/MerchantStatus.jsx';
import { UpgradeModal, UpgradePanel, isFeaturable } from '../components/Upgrades.jsx';
import { InspectionButton } from '../components/Inspection.jsx';
import { useModule } from '../lib/modules.js';

function SoldModal({ product, onClose, onDone }) {
  const { t } = useI18n();
  const buyers = useApi(product ? `/products/${product.id}/buyers` : null, undefined, [product?.id]);
  const [soldToId, setSoldToId] = useState('');
  const [error, setError] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api(`/products/${product.id}/availability`, { method: 'PATCH', body: { availability: 'sold', soldToId: soldToId || null } });
      onDone();
    } catch (err) { setError(err); }
  };
  return (
    <Modal open={Boolean(product)} onClose={onClose} title={t('dashboard.soldTo')}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBox error={error} />
        <p className="text-sm text-slate-600">{t('dashboard.soldToHelp')}</p>
        <select className="input" value={soldToId} onChange={(e) => setSoldToId(e.target.value)}>
          <option value="">{t('dashboard.soldToNone')}</option>
          {(buyers.data?.items || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button className="btn-primary w-full">{t('common.confirm')}</button>
      </form>
    </Modal>
  );
}

function SellerDashboard() {
  const { t, price, number, date } = useI18n();
  const { user, notify, meta } = useApp();
  const { data, loading, error, reload } = useApi('/products/mine');
  const paid = Boolean(meta.upgrades); // paid verification/featuring (off: the site is free)
  const upgrades = useApi(paid ? '/upgrade-requests' : null);
  const [upgrade, setUpgrade] = useState(null);
  const myStore = useApi(paid && user.account_type === 'merchant' ? '/stores/me' : null);
  const credits = myStore.data?.store?.plan_until && new Date(myStore.data.store.plan_until) > new Date() ? myStore.data.store.feature_credits : 0;
  const featureWithCredit = async (p) => {
    try { await api(`/products/${p.id}/feature-credit`, { method: 'POST' }); notify(t('plans.featuredDone')); reload(); myStore.reload(); } catch { notify(t('common.error')); }
  };
  const [bumpWait, setBumpWait] = useState(null); // { product, next }
  const bumpOn = useModule('bump');
  const bump = async (p) => {
    try {
      await api(`/products/${p.id}/bump`, { method: 'POST' });
      notify(t('bump.done'));
      reload();
    } catch (err) {
      if (err.code === 'bump_too_soon') setBumpWait({ product: p, next: err.fields?.next });
      else notify(t('common.error'));
    }
  };

  const [soldProduct, setSoldProduct] = useState(null);
  const [filter, setFilter] = useState('all');
  useDocumentTitle(t('dashboard.title'));

  const items = data?.items || [];
  const requests = upgrades.data?.items || [];
  const pendingFeature = new Set(requests.filter((r) => r.kind === 'feature' && r.status === 'pending').map((r) => r.product_id));
  const stats = {
    totalListings: items.length,
    live: items.filter((p) => p.status === 'approved' && p.availability === 'available').length,
    pending: items.filter((p) => p.status === 'pending').length,
    soldCount: items.filter((p) => p.availability === 'sold').length,
    totalViews: items.reduce((s, p) => s + p.views, 0),
  };
  const shown = filter === 'all' ? items : filter === 'sold' ? items.filter((p) => p.availability === 'sold') : items.filter((p) => p.status === filter);

  const relist = async (p) => {
    await api(`/products/${p.id}/availability`, { method: 'PATCH', body: { availability: 'available' } });
    reload();
  };
  const remove = async (p) => {
    if (!window.confirm(t('dashboard.confirmDelete'))) return;
    await api(`/products/${p.id}`, { method: 'DELETE' });
    notify(t('common.saved'));
    reload();
  };

  return (
    <div className="container-page py-8">
      <PageHeader title={t('dashboard.welcome', { name: user.name })}>
        <div className="flex gap-2">
          <Link to="/dashboard/stats" className="btn-outline">📊 {t('stats.title')}</Link>
          <Link to="/dashboard/import" className="btn-outline">📥 {t('bulk.short')}</Link>
          <Link to="/profile" className="btn-outline"><Icon name="user" className="h-4 w-4" />{t('card.title')}</Link>
          {user.account_type === 'merchant' && <Link to="/dashboard/store" className="btn-outline"><Icon name="store" className="h-4 w-4" />{t('nav.myStore')}</Link>}
          <Link to="/sell" className="btn-accent"><Icon name="plus" className="h-4 w-4" />{t('nav.post')}</Link>
        </div>
      </PageHeader>

      <MerchantStatus user={user} className="mb-6" />

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="card p-4">
            <p className="text-xs text-slate-500">{t(`dashboard.${k}`)}</p>
            <p className="mt-1 text-2xl font-bold ltr-nums">{number(v)}</p>
          </div>
        ))}
      </div>

      {paid && <UpgradePanel user={user} requests={requests} hasFeaturable={items.some(isFeaturable)} onRequest={setUpgrade} />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{t('dashboard.myListings')}</h2>
        <div className="flex gap-1 rounded-xl bg-surface p-1 ring-1 ring-slate-200">
          {['all', 'approved', 'pending', 'rejected', 'sold'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {f === 'all' ? t('common.all') : f === 'sold' ? t('common.sold') : t(`dashboard.status.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <ErrorBox error={error} />
      {loading ? <Spinner /> : !items.length ? (
        <EmptyState icon="plus" title={t('dashboard.noListings')}>
          <Link to="/sell" className="btn-accent">{t('dashboard.postFirst')}</Link>
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map((p) => (
            <li key={p.id} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <Link to={`/products/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <img src={p.cover_url} alt="" className="h-20 w-24 shrink-0 rounded-xl bg-slate-100 object-cover" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={p.status} />
                    {p.availability === 'sold' && <span className="badge bg-ink text-white">{t('common.sold')}</span>}
                    {p.is_featured && <span className="badge bg-gold-400 text-ink"><Icon name="star" filled className="me-1 h-3 w-3" />{t('upgrades.featuredUntil', { date: date(p.featured_until) })}</span>}
                    {pendingFeature.has(p.id) && <span className="badge bg-amber-100 text-amber-800"><Icon name="clock" className="me-1 h-3 w-3" />{t('upgrades.pendingFeature')}</span>}
                  </div>
                  <p className="mt-1 truncate font-semibold">{p.title}</p>
                  <p className="text-sm font-bold text-brand-800 ltr-nums">{price(p.price)}</p>
                  <p className="text-xs text-slate-500">
                    {date(p.created_at)} · {t('common.views', { n: number(p.views) })} · {t('dashboard.favoritesCount', { n: p.favorites_count })} · {t('dashboard.chats', { n: p.conversations_count })}
                  </p>
                  {p.status === 'rejected' && p.rejection_reason && <p className="mt-1 text-xs text-rose-600">{p.rejection_reason}</p>}
                </div>
              </Link>
              <div className="flex shrink-0 flex-wrap gap-2">
                {p.status === 'approved' && (p.availability === 'available' ? (
                  <button className="btn-outline px-3 py-2 text-xs" onClick={() => setSoldProduct(p)}><Icon name="check" className="h-4 w-4" />{t('dashboard.markSold')}</button>
                ) : (
                  <button className="btn-outline px-3 py-2 text-xs" onClick={() => relist(p)}>{t('dashboard.markAvailable')}</button>
                ))}
                {credits > 0 && isFeaturable(p) && (
                  <button className="btn-accent px-3 py-2 text-xs" onClick={() => featureWithCredit(p)}>⭐ {t('plans.useCredit', { n: credits })}</button>
                )}
                {paid && isFeaturable(p) && !pendingFeature.has(p.id) && (
                  <button className="btn-outline border-gold-400 px-3 py-2 text-xs text-gold-600" onClick={() => setUpgrade({ kind: 'feature', product: p })}>
                    <Icon name="star" filled className="h-4 w-4" />{t('upgrades.featureThis')}
                  </button>
                )}
                {bumpOn && isFeaturable(p) && (
                  <button className="btn-outline border-brand-300 px-3 py-2 text-xs text-brand-800" onClick={() => bump(p)} title={t('bump.hint', { n: meta.freeBumpDays || 7 })}>⬆ {t('bump.cta')}</button>
                )}
                <InspectionButton product={p} />
                <Link to={`/products/${p.id}/edit`} className="btn-outline px-3 py-2 text-xs"><Icon name="edit" className="h-4 w-4" />{t('common.edit')}</Link>
                <button className="btn-ghost px-3 py-2 text-xs text-rose-600" onClick={() => remove(p)}><Icon name="trash" className="h-4 w-4" />{t('common.delete')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(bumpWait)} onClose={() => setBumpWait(null)} title={`⬆ ${t('bump.cta')}`}>
        {bumpWait && (
          <div className="space-y-3">
            <p className="text-sm">{t('bump.tooSoon', { date: date(bumpWait.next) })}</p>
            {paid && meta.upgrades?.bumpPrice != null && (
              <button className="btn-accent w-full" onClick={() => { setUpgrade({ kind: 'bump', product: bumpWait.product }); setBumpWait(null); }}>{t('bump.buyNow', { price: price(meta.upgrades.bumpPrice) })}</button>
            )}
          </div>
        )}
      </Modal>
      {paid && <UpgradeModal request={upgrade} products={items} onClose={() => setUpgrade(null)} onDone={() => { setUpgrade(null); upgrades.reload(); }} />}
      <SoldModal product={soldProduct} onClose={() => setSoldProduct(null)} onDone={() => { setSoldProduct(null); reload(); }} />
    </div>
  );
}

/** Buyers: member card, shortcuts, and the option to become a seller. */
function BuyerDashboard() {
  const { t } = useI18n();
  const { user, counts } = useApp();
  useDocumentTitle(t('nav.myAccount'));
  const links = [
    ['/favorites', 'heart', t('nav.favorites'), user.favorites_count],
    ['/messages', 'chat', t('nav.messages'), counts.messages],
    ['/notifications', 'bell', t('nav.notifications'), counts.notifications],
    ['/profile', 'user', t('nav.profile'), null],
  ];
  return (
    <div className="container-page max-w-4xl space-y-6 py-8">
      <PageHeader title={t('dashboard.welcome', { name: user.name })} />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <ProfileCard user={user} />
        <div className="grid grid-cols-2 gap-3 self-start">
          {links.map(([to, icon, label, n]) => (
            <Link key={to} to={to} className="card flex flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon name={icon} />
                {n > 0 && <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">{n}</span>}
              </span>
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>
      <BecomeSeller />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useApp();
  return user.account_type === 'buyer' ? <BuyerDashboard /> : <SellerDashboard />;
}
