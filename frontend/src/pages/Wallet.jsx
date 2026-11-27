// /wallet – Souk Pay for people: what I am owed as a seller, the cash I carry as a courier,
// confirming the money a courier handed me, and the history of every movement that involves me.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Spinner } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

function Stat({ label, value, tone = 'slate', hint }) {
  const { price } = useI18n();
  const tones = { slate: 'bg-slate-50 text-slate-800', green: 'bg-emerald-50 text-emerald-800', amber: 'bg-amber-50 text-amber-800', rose: 'bg-rose-50 text-rose-800' };
  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold"><span className="ltr-nums">{price(value)}</span></p>
      {hint && <p className="mt-1 text-[11px] leading-relaxed opacity-80">{hint}</p>}
    </div>
  );
}

const HANDOVER_TONE = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-emerald-100 text-emerald-800', disputed: 'bg-rose-100 text-rose-800' };

/** A seller's sale: confirm (or dispute) the money the courier says they handed over. */
function SaleRow({ s, onDone }) {
  const { t, price, date } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const h = s.handover;
  const act = async (action) => {
    let body = {};
    if (action === 'dispute') {
      const reason = window.prompt(t('pay.disputePrompt'));
      if (!reason) return;
      body = { reason };
    }
    setBusy(true); setError(null);
    try { await api(`/pay/transfers/${h.id}/${action}`, { method: 'POST', body }); onDone(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const state = s.method === 'escrow' ? (s.payout ? 'paid' : 'escrow') : h ? h.status : 'with_courier';
  return (
    <li className="card space-y-2 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/orders/${s.order_id}`} className="font-semibold hover:text-brand-700">{s.product_title}</Link>
          <p className="text-xs text-slate-500">#{s.order_id} · {date(s.created_at)}{s.courier_name ? ` · 🛵 ${s.courier_name}` : ''}</p>
        </div>
        <div className="text-end">
          <p className="font-bold text-brand-700"><span className="ltr-nums">{price(s.seller_amount)}</span></p>
          {s.platform_amount > 0 && <p className="text-[11px] text-slate-500">{t('pay.afterCommission', { amount: price(s.platform_amount) })}</p>}
        </div>
      </div>
      <p><span className={`badge ${HANDOVER_TONE[state] || 'bg-slate-100 text-slate-700'}`}>{t(`pay.saleState.${state}`)}</span></p>
      {h?.status === 'pending' && (
        <div className="space-y-2 rounded-xl bg-amber-50 p-3">
          <p className="text-xs text-amber-900">{t('pay.confirmQuestion', { amount: price(h.amount), name: s.courier_name || '—' })}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1 text-xs" disabled={busy} onClick={() => act('confirm')}>✓ {t('pay.received')}</button>
            <button type="button" className="btn-outline flex-1 text-xs text-rose-700" disabled={busy} onClick={() => act('dispute')}>{t('pay.notReceived')}</button>
          </div>
        </div>
      )}
      <ErrorBox error={error} />
    </li>
  );
}

/** A courier's delivery: declare that the seller's share was handed over. */
function DeliveryRow({ d, onDone }) {
  const { t, price, date } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const h = d.handover;
  const handover = async () => {
    if (!window.confirm(t('pay.handoverConfirm', { amount: price(d.seller_amount), name: d.seller_name || '—' }))) return;
    setBusy(true); setError(null);
    try { await api(`/pay/orders/${d.order_id}/handover`, { method: 'POST', body: { method: 'cash' } }); onDone(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const cancel = async () => {
    setBusy(true); setError(null);
    try { await api(`/pay/transfers/${h.id}/cancel`, { method: 'POST', body: {} }); onDone(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <li className="card space-y-2 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/orders/${d.order_id}`} className="font-semibold hover:text-brand-700">{d.product_title}</Link>
          <p className="text-xs text-slate-500">#{d.order_id} · {date(d.created_at)} · {t('pay.sellerIs', { name: d.seller_name || '—' })}</p>
        </div>
        <div className="text-end text-xs">
          <p>{t('pay.collected')}: <b className="ltr-nums">{price(d.total)}</b></p>
          <p className="text-emerald-700">{t('pay.yourFee')}: <b className="ltr-nums">{price(d.courier_amount)}</b></p>
        </div>
      </div>
      {d.method === 'cod' && (h && h.status !== 'disputed'
        ? (
          <p className="flex flex-wrap items-center gap-2">
            <span className={`badge ${HANDOVER_TONE[h.status]}`}>{t(`pay.handoverState.${h.status}`, { amount: price(h.amount) })}</span>
            {h.status === 'pending' && <button type="button" className="text-xs text-slate-500 underline" disabled={busy} onClick={cancel}>{t('pay.undo')}</button>}
          </p>
        ) : (
          <>
            {h?.status === 'disputed' && <p className="text-xs font-semibold text-rose-700">{t('pay.handoverState.disputed')}</p>}
            {!h && <button type="button" className="btn-primary w-full text-xs" disabled={busy} onClick={handover}>🤝 {t('pay.handover', { amount: price(d.seller_amount) })}</button>}
          </>
        ))}
      {d.platform_amount > 0 && d.method === 'cod' && <p className="text-[11px] text-slate-500">{t('pay.platformShare', { amount: price(d.platform_amount) })}</p>}
      <ErrorBox error={error} />
    </li>
  );
}

export default function Wallet() {
  const { t, price, date } = useI18n();
  const { user } = useApp();
  useDocumentTitle(t('pay.title'));
  const { data, loading, error, reload } = useApi(user ? '/pay/me' : null, undefined, [user?.id]);
  const [tab, setTab] = useState(null);
  if (!user) return <div className="container-page py-10"><EmptyState icon="user" title={t('errors.unauthorized')}><Link to="/login" className="btn-primary">{t('nav.login')}</Link></EmptyState></div>;
  if (loading && !data) return <Spinner />;
  if (error) return <div className="container-page py-10"><ErrorBox error={error} /></div>;
  const { position, sales, deliveries, transfers } = data;
  const isCourier = deliveries.length > 0 || position.courier.cash !== 0;
  const current = tab || (sales.length || !isCourier ? 'sales' : 'deliveries');
  const tabs = [['sales', t('pay.tabSales')], ...(isCourier ? [['deliveries', t('pay.tabDeliveries')]] : []), ['history', t('pay.tabHistory')]];
  const toConfirm = sales.filter((s) => s.handover?.status === 'pending').length;

  return (
    <div className="container-page max-w-4xl space-y-5 py-6">
      <header className="rounded-3xl bg-gradient-to-l from-brand-600 to-brand-900 p-6 text-white">
        <h1 className="text-2xl font-bold">💳 {t('pay.title')}</h1>
        <p className="mt-1 text-sm text-white/85">{t('pay.subtitle')}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {isCourier && <Stat label={t('pay.courierCash')} value={Math.max(0, position.courier.cash)} tone={position.courier.cash > 0 ? 'rose' : 'green'} hint={t('pay.courierCashHint')} />}
        {isCourier && !sales.length && <Stat label={t('pay.courierEarned')} value={position.courier.earned} tone="green" />}
        {(sales.length > 0 || !isCourier) && <Stat label={t('pay.sellerDue')} value={Math.max(0, position.seller.due)} tone={position.seller.due > 0 ? 'amber' : 'green'} hint={t('pay.sellerDueHint')} />}
        {(sales.length > 0 || !isCourier) && <Stat label={t('pay.sellerReceived')} value={position.seller.received} tone="green" />}
        {!isCourier && <Stat label={t('pay.sellerTotal')} value={position.seller.entitled} />}
      </div>
      {toConfirm > 0 && <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">🔔 {t('pay.toConfirm', { n: toConfirm })}</p>}

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={current === k} onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${current === k ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>
        ))}
      </div>

      {current === 'sales' && (sales.length
        ? <ul className="space-y-3">{sales.map((s) => <SaleRow key={s.order_id} s={s} onDone={reload} />)}</ul>
        : <EmptyState icon="grid" title={t('pay.noSales')}><p className="text-sm text-slate-500">{t('pay.noSalesHint')}</p></EmptyState>)}
      {current === 'deliveries' && (deliveries.length
        ? <ul className="space-y-3">{deliveries.map((d) => <DeliveryRow key={d.order_id} d={d} onDone={reload} />)}</ul>
        : <EmptyState icon="grid" title={t('pay.noDeliveries')} />)}
      {current === 'history' && (transfers.length ? (
        <ul className="card divide-y divide-slate-100 p-0 text-sm">
          {transfers.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{t(`pay.kind.${m.kind}`)}{m.product_title ? ` · ${m.product_title}` : ''}</p>
                <p className="text-xs text-slate-500">{date(m.created_at)} · {m.mine === 'out' ? `→ ${m.to_name || t(`pay.account.${m.to_account}`)}` : `← ${m.from_name || t(`pay.account.${m.from_account}`)}`}{m.status !== 'confirmed' ? ` · ${t(`pay.status.${m.status}`)}` : ''}</p>
              </div>
              <p className={`shrink-0 font-bold ${m.mine === 'out' ? 'text-rose-700' : 'text-emerald-700'}`}><bdi dir="ltr">{m.mine === 'out' ? '−' : '+'}{price(m.amount)}</bdi></p>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="grid" title={t('pay.noHistory')} />)}

      <section className="rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
        <p className="font-semibold">ℹ️ {t('pay.howTitle')}</p>
        <ul className="ms-5 mt-1 list-disc space-y-0.5">{t('pay.how').split('|').map((x) => <li key={x}>{x}</li>)}</ul>
      </section>
    </div>
  );
}
