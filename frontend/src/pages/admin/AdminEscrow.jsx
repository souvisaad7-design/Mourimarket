// Admin: secure payments — confirm receipts, pay sellers after delivery, refund buyers, settle disputes.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EscrowBadge } from '../../components/Escrow.jsx';
import { EmptyState, ErrorBox, Field, Modal, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api, getToken } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

function Receipt({ id }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let url = null;
    fetch(`/api/admin/escrow/${id}/receipt`, { headers: { Authorization: `Bearer ${getToken()}` } }).then((r) => (r.ok ? r.blob() : null))
      .then((b) => { if (b) { url = URL.createObjectURL(b); setSrc(url); } }).catch(() => {});
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [id]);
  return src ? <a href={src} target="_blank" rel="noreferrer"><img src={src} alt="" className="max-h-80 w-full rounded-xl object-contain ring-1 ring-slate-200" /></a> : <Spinner />;
}

const ACTIONS = { submitted: ['confirm', 'reject'], held: ['refund'], release_due: ['release'], disputed: ['release', 'refund'], refund_due: ['refund'] };

function Decide({ o, onClose, onDone }) {
  const { t, price } = useI18n();
  const { notify } = useApp();
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const act = async (action) => {
    setBusy(true); setError(null);
    try { await api(`/admin/escrow/${o.id}`, { method: 'PATCH', body: { action, ref: ref || undefined, note: note || undefined } }); notify(t('common.changesSaved')); onDone(); onClose(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={`#${o.id} · ${o.product_title}`} size="lg">
      <div className="space-y-3 text-sm">
        <p>🛒 {o.buyer_name} <span className="ltr-nums">{o.buyer_phone}</span> → 🏪 {o.seller_name} <span className="ltr-nums">{o.seller_phone}</span></p>
        <p>{t('escrow.total')}: <strong className="ltr-nums">{price(o.total)}</strong> ({t('escrow.toSeller')}: <span className="ltr-nums">{price(o.item_price)}</span> · {t('escrow.toCourier')}: <span className="ltr-nums">{price(o.delivery_fee)}</span>)</p>
        {o.pay_channel && <p>{t(`upgrades.methods.${o.pay_channel}`)} · {t('escrow.ref')}: <span className="ltr-nums">{o.pay_ref || '—'}</span></p>}
        {o.dispute_reason && <p className="rounded-lg bg-rose-50 p-2 text-rose-700">⚠️ {o.dispute_reason}</p>}
        {o.pay_receipt_file_id && <Receipt id={o.id} />}
        {(ACTIONS[o.payment_status] || []).some((a) => a === 'release' || a === 'refund') && <Field label={t('escrow.transferRef')}><input className="input" dir="ltr" value={ref} onChange={(e) => setRef(e.target.value)} maxLength={120} /></Field>}
        {(ACTIONS[o.payment_status] || []).includes('reject') && <Field label={t('escrow.rejectReason')} optional><input className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} /></Field>}
        <ErrorBox error={error} />
        <div className="flex flex-wrap gap-2">
          {(ACTIONS[o.payment_status] || []).map((a) => (
            <button key={a} className={a === 'confirm' || a === 'release' ? 'btn-primary flex-1' : 'btn-outline flex-1'} disabled={busy} onClick={() => act(a)}>{t(`escrow.action.${a}`)}</button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function AdminEscrow() {
  const { t, price, ago } = useI18n();
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useApi(`/admin/escrow${status ? `?status=${status}` : ''}`, undefined, [status]);
  const [open, setOpen] = useState(null);
  useDocumentTitle(t('escrow.adminTitle'));
  const counts = data?.counts || {};
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">🔒 {t('escrow.adminTitle')}</h1>
      <p className="mb-4 text-sm text-slate-500">{t('escrow.adminHint')}</p>
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {['', 'submitted', 'release_due', 'disputed', 'refund_due', 'held', 'released', 'refunded', 'awaiting_payment'].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${status === s ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {s ? t(`escrow.status.${s}`) : t('delivery.admin.all')} {s && <span className="opacity-75 ltr-nums">{counts[s] || 0}</span>}
          </button>
        ))}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="shield" title={t('escrow.none')} /> : (
        <ul className="space-y-2">
          {data.items.map((o) => (
            <li key={o.id} className="card flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <Link to={`/admin/orders?open=${o.id}`} className="font-semibold hover:underline">#{o.id} · {o.product_title}</Link>
                <p className="text-xs text-slate-500">{o.buyer_name} → {o.seller_name} · {ago(o.payment_updated_at || o.created_at)}</p>
              </div>
              <span className="font-bold ltr-nums">{price(o.total)}</span>
              <EscrowBadge status={o.payment_status} />
              <button className="btn-outline px-3 py-1.5 text-xs" onClick={() => setOpen(o)}>{ACTIONS[o.payment_status] ? t('escrow.review') : t('escrow.details')}</button>
            </li>
          ))}
        </ul>
      )}
      {open && <Decide o={open} onClose={() => setOpen(null)} onDone={reload} />}
    </div>
  );
}
