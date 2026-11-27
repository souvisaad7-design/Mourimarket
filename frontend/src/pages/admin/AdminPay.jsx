// Admin → Souk Pay: totals, cash held by couriers, money owed to sellers, every movement (CSV export),
// recording cash handed in / payouts, settling disputes, commission, and the state of payment providers.
import { useState } from 'react';
import { ErrorBox, Field, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api, getToken } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

const STATUS_TONE = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-emerald-100 text-emerald-800', disputed: 'bg-rose-100 text-rose-800', cancelled: 'bg-slate-100 text-slate-500' };

function Card({ label, value, tone = '' }) {
  const { price } = useI18n();
  return (
    <div className={`card p-4 ${tone}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold"><span className="ltr-nums">{typeof value === 'number' ? price(value) : value}</span></p>
    </div>
  );
}

/** Record money the admin handled (cash handed in by a courier, a payout to a seller, a correction). */
function RecordForm({ preset, onDone }) {
  const { t } = useI18n();
  const { notify } = useApp();
  const [f, setF] = useState(preset);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const needsUser = (a) => ['buyer', 'courier', 'seller'].includes(a);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      await api('/admin/pay/transfers', { method: 'POST', body: {
        ...f, amount: Number(f.amount), fromUser: needsUser(f.from) ? Number(f.fromUser) : null, toUser: needsUser(f.to) ? Number(f.toUser) : null,
      } });
      notify(t('common.changesSaved')); onDone();
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const acc = (key) => (
    <select className="input" value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })}>
      {['courier', 'seller', 'platform', 'buyer', 'escrow'].map((a) => <option key={a} value={a}>{t(`pay.account.${a}`)}</option>)}
    </select>
  );
  return (
    <form onSubmit={submit} className="card grid gap-3 p-5 sm:grid-cols-2">
      <Field label={t('pay.admin.from')}>{acc('from')}</Field>
      {needsUser(f.from) && <Field label={t('pay.admin.userId')}><input className="input" dir="ltr" inputMode="numeric" required value={f.fromUser || ''} onChange={(e) => setF({ ...f, fromUser: e.target.value })} /></Field>}
      <Field label={t('pay.admin.to')}>{acc('to')}</Field>
      {needsUser(f.to) && <Field label={t('pay.admin.userId')}><input className="input" dir="ltr" inputMode="numeric" required value={f.toUser || ''} onChange={(e) => setF({ ...f, toUser: e.target.value })} /></Field>}
      <Field label={t('pay.admin.amount')}><input className="input" type="number" min="1" dir="ltr" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
      <Field label={t('pay.admin.kind')}>
        <select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
          {['remittance', 'payout', 'adjustment'].map((k) => <option key={k} value={k}>{t(`pay.kind.${k}`)}</option>)}
        </select>
      </Field>
      <Field label={t('pay.admin.method')}>
        <select className="input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
          {['cash', 'bankily', 'masrvi', 'sedad', 'other'].map((m) => <option key={m} value={m}>{t(`pay.method.${m}`)}</option>)}
        </select>
      </Field>
      <Field label={t('pay.admin.ref')} optional><input className="input" dir="ltr" maxLength={120} value={f.ref || ''} onChange={(e) => setF({ ...f, ref: e.target.value })} /></Field>
      <Field label={t('pay.admin.note')} optional={f.kind !== 'adjustment'}><input className="input" maxLength={300} value={f.note || ''} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
      <div className="sm:col-span-2"><ErrorBox error={error} /></div>
      <button className="btn-primary sm:col-span-2" disabled={busy}>{t('pay.admin.record')}</button>
    </form>
  );
}

function Settings() {
  const { t } = useI18n();
  const { notify } = useApp();
  const { data, reload } = useApi('/admin/settings');
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const pay = draft || data?.settings?.pay;
  if (!pay) return null;
  const save = async () => {
    setError(null);
    try { await api('/admin/settings', { method: 'PUT', body: { pay } }); notify(t('common.changesSaved')); setDraft(null); reload(); } catch (err) { setError(err); }
  };
  return (
    <section className="card space-y-3 p-5">
      <h2 className="text-lg font-bold">⚙️ {t('pay.admin.commission')}</h2>
      <p className="text-xs text-slate-500">{t('pay.admin.commissionHint')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('pay.admin.commissionPct')}><input className="input" type="number" min="0" max="30" step="0.5" dir="ltr" value={pay.commissionPct} onChange={(e) => setDraft({ ...pay, commissionPct: Number(e.target.value) })} /></Field>
        <Field label={t('pay.admin.deliveryPct')}><input className="input" type="number" min="0" max="50" step="0.5" dir="ltr" value={pay.deliveryCommissionPct} onChange={(e) => setDraft({ ...pay, deliveryCommissionPct: Number(e.target.value) })} /></Field>
      </div>
      <ErrorBox error={error} />
      <button type="button" className="btn-primary" disabled={!draft} onClick={save}>{t('common.save')}</button>
    </section>
  );
}

export function AdminPay() {
  const { t, price, date, tl } = useI18n();
  useDocumentTitle(t('pay.admin.title'));
  const summary = useApi('/admin/pay/summary');
  const [status, setStatus] = useState('');
  const list = useApi(`/admin/pay/transfers${status ? `?status=${status}` : ''}`, undefined, [status]);
  const [preset, setPreset] = useState(null);
  const [busy, setBusy] = useState(false);
  const reloadAll = () => { summary.reload(); list.reload(); };
  if (summary.loading && !summary.data) return <Spinner />;
  if (summary.error) return <ErrorBox error={summary.error} />;
  const { totals, couriers, sellers, providers } = summary.data;

  const resolve = async (id, action) => {
    const note = window.prompt(t('pay.admin.notePrompt')) ?? undefined;
    setBusy(true);
    try { await api(`/admin/pay/transfers/${id}`, { method: 'PATCH', body: { action, note: note || undefined } }); reloadAll(); } finally { setBusy(false); }
  };
  const exportCsv = async () => {
    const res = await fetch('/api/admin/pay/export.csv', { headers: { Authorization: `Bearer ${getToken()}` } });
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a'); a.href = url; a.download = 'souk-pay.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">💳 {t('pay.admin.title')}</h1>
        <button type="button" className="btn-outline text-sm" onClick={exportCsv}>⬇️ {t('pay.admin.export')}</button>
      </div>
      <p className="text-sm text-slate-500">{t('pay.admin.intro')}</p>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Card label={t('pay.admin.volume', { n: totals.orders })} value={totals.volume} />
        <Card label={t('pay.admin.couriersCash')} value={totals.couriers_cash} tone={totals.couriers_cash ? 'ring-2 ring-amber-300' : ''} />
        <Card label={t('pay.admin.sellersDue')} value={totals.sellers_due} />
        <Card label={t('pay.admin.escrowHeld')} value={totals.escrow_held} />
        <Card label={t('pay.admin.platformEntitled')} value={totals.platform_entitled} />
        <Card label={t('pay.admin.platformHeld')} value={totals.platform_held} />
        <Card label={t('pay.admin.platformDue')} value={totals.platform_due} />
        <Card label={t('pay.admin.disputed')} value={String(totals.disputed)} tone={totals.disputed ? 'ring-2 ring-rose-300' : ''} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-2 p-5">
          <h2 className="text-lg font-bold">🛵 {t('pay.admin.couriers')}</h2>
          {couriers.length ? (
            <ul className="divide-y divide-slate-100 text-sm">
              {couriers.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0"><b>{c.name}</b> <span className="text-xs text-slate-500" dir="ltr">#{c.id} {c.phone}</span></span>
                  <span className="flex items-center gap-2">
                    <b className={`ltr-nums ${c.cash > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{price(c.cash)}</b>
                    {c.cash > 0 && <button type="button" className="btn-outline px-2 py-1 text-xs" onClick={() => setPreset({ from: 'courier', fromUser: c.id, to: 'platform', amount: c.cash, kind: 'remittance', method: 'cash' })}>{t('pay.admin.receiveCash')}</button>}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">{t('pay.admin.noneCouriers')}</p>}
        </section>
        <section className="card space-y-2 p-5">
          <h2 className="text-lg font-bold">🏪 {t('pay.admin.sellers')}</h2>
          {sellers.length ? (
            <ul className="divide-y divide-slate-100 text-sm">
              {sellers.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0"><b>{s.name}</b> <span className="text-xs text-slate-500" dir="ltr">#{s.id} {s.phone}</span></span>
                  <span className="flex items-center gap-2">
                    <b className="ltr-nums text-amber-700">{price(s.due)}</b>
                    <button type="button" className="btn-outline px-2 py-1 text-xs" onClick={() => setPreset({ from: 'platform', to: 'seller', toUser: s.id, amount: s.due, kind: 'payout', method: 'bankily' })}>{t('pay.admin.paySeller')}</button>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">{t('pay.admin.noneSellers')}</p>}
          <p className="text-[11px] text-slate-500">{t('pay.admin.sellersHint')}</p>
        </section>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">✍️ {t('pay.admin.recordTitle')}</h2>
          {!preset && <button type="button" className="btn-outline text-sm" onClick={() => setPreset({ from: 'courier', to: 'platform', amount: '', kind: 'remittance', method: 'cash' })}>+ {t('pay.admin.record')}</button>}
        </div>
        {preset && <RecordForm key={JSON.stringify(preset)} preset={preset} onDone={() => { setPreset(null); reloadAll(); }} />}
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">📒 {t('pay.admin.ledger')}</h2>
          <select className="input w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('pay.admin.filter')}>
            <option value="">{t('pay.admin.all')}</option>
            {['disputed', 'pending', 'confirmed', 'cancelled'].map((s) => <option key={s} value={s}>{t(`pay.status.${s}`)}</option>)}
          </select>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr>
              {['#', 'date', 'kind', 'from', 'to', 'amount', 'state', ''].map((h) => <th key={h} className="px-3 py-2 text-start">{h ? t(`pay.admin.col.${h}`) : ''}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(list.data?.items || []).map((m) => (
                <tr key={m.id}>
                  <td className="px-3 py-2 text-xs text-slate-500">{m.id}{m.order_id ? <><br />#{m.order_id}</> : null}</td>
                  <td className="px-3 py-2 text-xs">{date(m.created_at)}</td>
                  <td className="px-3 py-2">{t(`pay.kind.${m.kind}`)}<br /><span className="text-xs text-slate-500">{t(`pay.method.${m.method}`)}{m.ref ? ` · ${m.ref}` : ''}</span></td>
                  <td className="px-3 py-2">{m.from_name || t(`pay.account.${m.from_account}`)}</td>
                  <td className="px-3 py-2">{m.to_name || t(`pay.account.${m.to_account}`)}</td>
                  <td className="px-3 py-2 font-bold"><span className="ltr-nums">{price(m.amount)}</span></td>
                  <td className="px-3 py-2"><span className={`badge ${STATUS_TONE[m.status]}`}>{t(`pay.status.${m.status}`)}</span>{m.note && <p className="mt-1 max-w-[12rem] text-xs text-slate-500">{m.note}</p>}</td>
                  <td className="px-3 py-2">{['pending', 'disputed'].includes(m.status) && (
                    <span className="flex flex-col gap-1">
                      <button type="button" disabled={busy} className="text-xs font-semibold text-emerald-700 hover:underline" onClick={() => resolve(m.id, 'confirm')}>{t('pay.admin.confirm')}</button>
                      <button type="button" disabled={busy} className="text-xs font-semibold text-rose-700 hover:underline" onClick={() => resolve(m.id, 'cancel')}>{t('pay.admin.cancel')}</button>
                    </span>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.data?.items?.length && <p className="p-4 text-sm text-slate-500">{t('pay.noHistory')}</p>}
        </div>
      </section>

      <Settings />

      <section className="card space-y-2 p-5">
        <h2 className="text-lg font-bold">🔌 {t('pay.admin.providers')}</h2>
        <ul className="space-y-1.5 text-sm">
          {providers.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-2">
              <span>{tl({ name_ar: p.label.ar, name_fr: p.label.fr, name_en: p.label.en })}</span>
              <span className={`badge ${p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                {p.active ? t('pay.admin.active') : p.kind === 'gateway' ? t('pay.admin.needsContract') : t('pay.admin.off')}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-slate-500">{t('pay.admin.providersHint')}</p>
      </section>
    </div>
  );
}
