// Admin → Marketplace tools: every auction (cancel, give more time), every store coupon (pause, delete),
// every store employee (remove), and every "wanted" ad (hide, restore).
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Countdown } from '../../components/Auction.jsx';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

function Pills({ value, options, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([k, label]) => (
        <button key={k} type="button" onClick={() => onChange(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value === k ? 'bg-ink text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>
      ))}
    </div>
  );
}

function useAction(reload) {
  const { notify } = useApp();
  const { t } = useI18n();
  const [error, setError] = useState(null);
  const run = async (fn) => {
    setError(null);
    try { await fn(); notify(t('common.changesSaved')); reload(); } catch (err) { setError(err); }
  };
  return { run, error };
}

function Auctions() {
  const { t, price, date } = useI18n();
  const [status, setStatus] = useState('active');
  const { data, loading, error, reload } = useApi(`/admin/market/auctions?status=${status}`, undefined, [status]);
  const { run, error: actError } = useAction(reload);
  const cancel = (a) => {
    const reason = window.prompt(t('market.cancelReason'));
    if (reason === null) return;
    run(() => api(`/auctions/${a.id}/cancel`, { method: 'POST', body: { reason: reason || undefined } }));
  };
  const extend = (a) => {
    const h = Number(window.prompt(t('market.extendPrompt'), '24'));
    if (!h) return;
    run(() => api(`/admin/market/auctions/${a.id}/extend`, { method: 'POST', body: { hours: h } }));
  };
  return (
    <section className="space-y-3">
      <Pills value={status} onChange={setStatus} options={['active', 'ended', 'cancelled'].map((k) => [k, t(`market.auctionStatus.${k}`)])} />
      <ErrorBox error={error || actError} />
      {loading && !data ? <Spinner /> : data?.items?.length ? (
        <ul className="space-y-2">
          {data.items.map((a) => (
            <li key={a.id} className="card flex flex-wrap items-center gap-3 p-4 text-sm">
              <div className="min-w-0 flex-1">
                <Link to={`/products/${a.product_id}`} className="font-semibold hover:underline">{a.title}</Link>
                <p className="text-xs text-slate-500">
                  {t('market.seller')}: {a.seller_name} · {t('auction.bidsCount', { n: a.bid_count })}
                  {a.reserve_price ? ` · ${t('auction.yourReserve', { amount: price(a.reserve_price) })}` : ''}
                  {a.leader_name && status === 'active' ? ` · ${t('market.leader')}: ${a.leader_name}` : ''}
                  {a.winner_name ? ` · ${t('market.winner')}: ${a.winner_name}` : ''}
                  {a.cancel_reason ? ` · ${a.cancel_reason}` : ''}
                </p>
              </div>
              <div className="text-end">
                <p className="font-bold text-orange-700"><span className="ltr-nums">{price(a.current_bid || a.start_price)}</span></p>
                <p className="text-xs text-slate-500">{status === 'active' ? <>⏳ <Countdown endsAt={a.ends_at} /></> : date(a.ended_at || a.created_at)}</p>
              </div>
              {status === 'active' && (
                <div className="flex gap-2">
                  <button type="button" className="btn-outline px-3 py-1.5 text-xs" onClick={() => extend(a)}>⏱ {t('market.extend')}</button>
                  <button type="button" className="btn-outline px-3 py-1.5 text-xs text-rose-700" onClick={() => cancel(a)}>{t('auction.cancel')}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="grid" title={t('auction.none')} />}
    </section>
  );
}

function Coupons() {
  const { t, price, date } = useI18n();
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useApi(`/admin/market/coupons?q=${encodeURIComponent(q)}`, undefined, [q]);
  const { run, error: actError } = useAction(reload);
  return (
    <section className="space-y-3">
      <input className="input max-w-sm" placeholder={t('market.searchCoupons')} value={q} onChange={(e) => setQ(e.target.value)} />
      <ErrorBox error={error || actError} />
      {loading && !data ? <Spinner /> : data?.items?.length ? (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr>
              {['code', 'store', 'discount', 'uses', 'state', ''].map((h) => <th key={h} className="px-3 py-2 text-start">{h ? t(`market.col.${h}`) : ''}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((c) => (
                <tr key={c.id} className={c.is_active ? '' : 'opacity-60'}>
                  <td className="px-3 py-2 font-mono font-bold" dir="ltr">{c.code}</td>
                  <td className="px-3 py-2">{c.store_name || c.seller_name}</td>
                  <td className="px-3 py-2">{c.kind === 'percent' ? <bdi dir="ltr">{c.value}%</bdi> : <span className="ltr-nums">{price(c.value)}</span>}{c.expires_at ? <span className="block text-xs text-slate-500">{t('pro.coupon.until', { d: date(c.expires_at) })}</span> : null}</td>
                  <td className="px-3 py-2">{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                  <td className="px-3 py-2">{c.is_active ? t('pro.coupon.active') : t('market.paused')}</td>
                  <td className="px-3 py-2">
                    <span className="flex gap-3 text-xs font-semibold">
                      <button type="button" className="text-brand-700 hover:underline" onClick={() => run(() => api(`/admin/market/coupons/${c.id}`, { method: 'PATCH', body: { isActive: !c.is_active } }))}>{c.is_active ? t('market.pause') : t('market.resume')}</button>
                      <button type="button" className="text-rose-600 hover:underline" onClick={() => window.confirm(t('pro.coupon.deleteConfirm', { code: c.code })) && run(() => api(`/admin/market/coupons/${c.id}`, { method: 'DELETE' }))}>{t('common.delete')}</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon="star" title={t('pro.coupon.none')} />}
    </section>
  );
}

function Staff() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi('/admin/market/staff');
  const { run, error: actError } = useAction(reload);
  return (
    <section className="space-y-3">
      <ErrorBox error={error || actError} />
      {loading && !data ? <Spinner /> : data?.items?.length ? (
        <ul className="card divide-y divide-slate-100 p-0 text-sm">
          {data.items.map((m) => (
            <li key={m.user_id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.name} <span className="text-xs font-normal text-slate-500"><bdi dir="ltr">{m.phone || ''}</bdi></span></p>
                <p className="text-xs text-slate-500"><Link to={`/stores/${m.slug}`} className="hover:underline">{m.store_name}</Link> · {t('market.owner')}: {m.owner_name}</p>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{t(`staff.roles.${m.role}`)}</span>
              <button type="button" className="text-xs font-semibold text-rose-600 hover:underline" onClick={() => window.confirm(t('staff.removeConfirm', { name: m.name })) && run(() => api(`/admin/market/staff/${m.user_id}`, { method: 'DELETE' }))}>{t('staff.remove')}</button>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="users" title={t('staff.empty')} />}
    </section>
  );
}

function Wanted() {
  const { t, price, ago } = useI18n();
  const [status, setStatus] = useState('active');
  const [q, setQ] = useState('');
  const { data, loading, error, reload } = useApi(`/admin/market/wanted?status=${status}&q=${encodeURIComponent(q)}`, undefined, [status, q]);
  const { run, error: actError } = useAction(reload);
  const hide = (w) => {
    const reason = window.prompt(t('market.hideReason'));
    if (reason === null) return;
    run(() => api(`/admin/market/wanted/${w.id}`, { method: 'PATCH', body: { status: 'hidden', reason: reason || undefined } }));
  };
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Pills value={status} onChange={setStatus} options={['active', 'closed', 'hidden'].map((k) => [k, t(`market.wantedStatus.${k}`)])} />
        <input className="input ms-auto max-w-xs" placeholder={t('common.search')} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ErrorBox error={error || actError} />
      {loading && !data ? <Spinner /> : data?.items?.length ? (
        <ul className="space-y-2">
          {data.items.map((w) => (
            <li key={w.id} className="card flex flex-wrap items-start gap-3 p-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{w.title}</p>
                {w.description && <p className="line-clamp-2 text-xs text-slate-600">{w.description}</p>}
                <p className="text-xs text-slate-500">{w.user_name} · {ago(w.created_at)} · {t('market.replies', { n: w.replies })}{w.budget ? ` · ${price(w.budget)}` : ''}</p>
              </div>
              {status !== 'hidden'
                ? <button type="button" className="btn-outline px-3 py-1.5 text-xs text-rose-700" onClick={() => hide(w)}>{t('market.hide')}</button>
                : <button type="button" className="btn-outline px-3 py-1.5 text-xs" onClick={() => run(() => api(`/admin/market/wanted/${w.id}`, { method: 'PATCH', body: { status: 'active' } }))}>{t('market.restore')}</button>}
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="grid" title={t('common.empty')} />}
    </section>
  );
}

const TABS = ['auctions', 'coupons', 'staff', 'wanted'];

export function AdminMarket() {
  const { t } = useI18n();
  useDocumentTitle(t('market.title'));
  const [params, setParams] = useSearchParams();
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'auctions';
  return (
    <div className="max-w-5xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">🏪 {t('market.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('market.intro')}</p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {TABS.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setParams({ tab: k }, { replace: true })}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === k ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{t(`market.tabs.${k}`)}</button>
        ))}
      </div>
      {tab === 'auctions' && <Auctions />}
      {tab === 'coupons' && <Coupons />}
      {tab === 'staff' && <Staff />}
      {tab === 'wanted' && <Wanted />}
    </div>
  );
}
