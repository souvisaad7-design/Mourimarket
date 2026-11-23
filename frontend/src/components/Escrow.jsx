// Secure payment (escrow) panel inside an order: pay the platform, upload the receipt, confirm receipt or dispute.
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { compressImage } from '../lib/image.js';
import { ErrorBox, Field, Modal } from './ui.jsx';

const STYLE = {
  awaiting_payment: 'bg-amber-100 text-amber-800', submitted: 'bg-sky-100 text-sky-800', held: 'bg-emerald-100 text-emerald-800',
  release_due: 'bg-emerald-100 text-emerald-800', released: 'bg-brand-100 text-brand-900', disputed: 'bg-rose-100 text-rose-700',
  refund_due: 'bg-amber-100 text-amber-800', refunded: 'bg-slate-200 text-slate-700',
};

export function EscrowBadge({ status }) {
  const { t } = useI18n();
  if (!status) return null;
  return <span className={`badge ${STYLE[status]}`}>🔒 {t(`escrow.status.${status}`)}</span>;
}

export function EscrowPanel({ order, onDone }) {
  const { t, price } = useI18n();
  const { notify } = useApp();
  const pay = useSettings().settings.payment || {};
  const [channel, setChannel] = useState(['bankily', 'masrvi', 'sedad'].find((c) => pay[c]) || 'bankily');
  const [ref, setRef] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [dispute, setDispute] = useState(false);
  const [reason, setReason] = useState('');
  if (order.payment_method !== 'escrow') return null;
  const s = order.payment_status;
  const buyer = order.my_roles.includes('buyer');
  const run = async (fn, ok) => { setBusy(true); setError(null); try { await fn(); notify(ok); onDone(); } catch (err) { setError(err); } finally { setBusy(false); } };

  const sendReceipt = (e) => {
    e.preventDefault();
    run(async () => {
      const fd = new FormData();
      fd.append('channel', channel); fd.append('ref', ref);
      fd.append('receipt', (await compressImage(file, { maxWidth: 1600, quality: 0.85 }).catch(() => null))?.file || file);
      await api(`/orders/${order.id}/payment`, { method: 'POST', body: fd });
    }, t('escrow.receiptSent'));
  };

  return (
    <section className="card space-y-3 border-emerald-200 p-5" aria-label={t('escrow.title')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">🔒 {t('escrow.title')}</h2>
        <EscrowBadge status={s} />
      </div>
      <p className="text-sm text-slate-600">{t(`escrow.explain.${buyer ? 'buyer' : 'other'}.${s}`, { amount: price(order.total) })}</p>

      {buyer && ['awaiting_payment', 'submitted'].includes(s) && order.status !== 'cancelled' && (
        <form onSubmit={sendReceipt} className="space-y-3 rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-semibold">{t('escrow.payTo', { amount: price(order.total) })}</p>
          <ul className="space-y-1 text-sm">
            {['bankily', 'masrvi', 'sedad'].filter((c) => pay[c]).map((c) => (
              <li key={c}><label className="flex cursor-pointer items-center gap-2"><input type="radio" name="ch" checked={channel === c} onChange={() => setChannel(c)} /> <strong>{t(`upgrades.methods.${c}`)}</strong>: <span className="ltr-nums" dir="ltr">{pay[c]}</span></label></li>
            ))}
            {pay.accountName && <li className="text-xs text-slate-500">{t('escrow.accountName')}: {pay.accountName}</li>}
          </ul>
          <Field label={t('escrow.ref')} optional><input className="input" dir="ltr" maxLength={80} value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
          <Field label={t('escrow.receipt')}><input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" /></Field>
          <button className="btn-primary w-full" disabled={busy || !file}>{s === 'submitted' ? t('escrow.resend') : t('escrow.send')}</button>
        </form>
      )}

      {buyer && order.status === 'delivered' && s === 'held' && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary flex-1" disabled={busy} onClick={() => run(() => api(`/orders/${order.id}/confirm-receipt`, { method: 'POST' }), t('escrow.thanks'))}>✓ {t('escrow.confirm')}</button>
          <button className="btn-outline text-rose-700" disabled={busy} onClick={() => setDispute(true)}>{t('escrow.problem')}</button>
        </div>
      )}
      {buyer && s === 'held' && order.status !== 'delivered' && <button className="text-xs text-rose-700 underline" onClick={() => setDispute(true)}>{t('escrow.problem')}</button>}
      <ErrorBox error={error} />

      <Modal open={dispute} onClose={() => setDispute(false)} title={t('escrow.problem')}>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => api(`/orders/${order.id}/dispute`, { method: 'POST', body: { reason } }), t('escrow.disputeSent')).then(() => setDispute(false)); }}>
          <p className="text-sm text-slate-600">{t('escrow.disputeText')}</p>
          <textarea className="input" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} required aria-label={t('escrow.problem')} />
          <button className="btn w-full bg-rose-600 text-white" disabled={busy || reason.trim().length < 5}>{t('escrow.openDispute')}</button>
        </form>
      </Modal>
    </section>
  );
}
