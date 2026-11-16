import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Icon, Modal, PageHeader, Spinner, StatusBadge } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

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

export default function Dashboard() {
  const { t, price, number, date } = useI18n();
  const { user, notify } = useApp();
  const { data, loading, error, reload } = useApi('/products/mine');
  const [soldProduct, setSoldProduct] = useState(null);
  const [filter, setFilter] = useState('all');
  useDocumentTitle(t('dashboard.title'));

  const items = data?.items || [];
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
          {user.account_type === 'merchant' && <Link to="/dashboard/store" className="btn-outline"><Icon name="store" className="h-4 w-4" />{t('nav.myStore')}</Link>}
          <Link to="/sell" className="btn-accent"><Icon name="plus" className="h-4 w-4" />{t('nav.post')}</Link>
        </div>
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="card p-4">
            <p className="text-xs text-slate-500">{t(`dashboard.${k}`)}</p>
            <p className="mt-1 text-2xl font-bold ltr-nums">{number(v)}</p>
          </div>
        ))}
      </div>

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
                <Link to={`/products/${p.id}/edit`} className="btn-outline px-3 py-2 text-xs"><Icon name="edit" className="h-4 w-4" />{t('common.edit')}</Link>
                <button className="btn-ghost px-3 py-2 text-xs text-rose-600" onClick={() => remove(p)}><Icon name="trash" className="h-4 w-4" />{t('common.delete')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SoldModal product={soldProduct} onClose={() => setSoldProduct(null)} onDone={() => { setSoldProduct(null); reload(); }} />
    </div>
  );
}
