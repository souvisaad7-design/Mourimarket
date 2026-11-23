// Admin: car inspection requests; enter the workshop's report and publish it on the listing.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CHECK_ITEMS } from '../../components/Inspection.jsx';
import { EmptyState, ErrorBox, Field, Modal, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

const STATUS_STYLE = { requested: 'bg-amber-100 text-amber-800', scheduled: 'bg-sky-100 text-sky-800', published: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-slate-200 text-slate-600' };

function ReportForm({ item, onClose, onDone }) {
  const { t } = useI18n();
  const { notify } = useApp();
  const [f, setF] = useState({ workshop: item.workshop || '', inspectedOn: item.inspected_on?.slice(0, 10) || new Date().toISOString().slice(0, 10), mileage: item.mileage ?? item.attrs?.mileage ?? '', overall: item.overall || '', summary: item.summary || '' });
  const [check, setCheck] = useState(item.checklist || {});
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const save = async (status) => {
    setBusy(true); setError(null);
    const fd = new FormData();
    Object.entries({ ...f, status, checklist: JSON.stringify(check) }).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (file) fd.append('report', file);
    try { await api(`/admin/inspections/${item.id}`, { method: 'PUT', body: fd }); notify(t('common.changesSaved')); onDone(); onClose(); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={`🔧 ${item.product_title}`} size="lg">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t('inspection.workshop')}><input className="input" value={f.workshop} onChange={(e) => setF({ ...f, workshop: e.target.value })} maxLength={120} /></Field>
          <Field label={t('inspection.date')}><input className="input" type="date" dir="ltr" value={f.inspectedOn} onChange={(e) => setF({ ...f, inspectedOn: e.target.value })} /></Field>
          <Field label={t('inspection.mileage')} optional><input className="input" type="number" dir="ltr" value={f.mileage} onChange={(e) => setF({ ...f, mileage: e.target.value })} /></Field>
        </div>
        <Field label={t('inspection.overallLabel')}>
          <select className="input" value={f.overall} onChange={(e) => setF({ ...f, overall: e.target.value })}>
            <option value="">{t('form.choose')}</option>
            {['excellent', 'good', 'fair', 'poor'].map((o) => <option key={o} value={o}>{t(`inspection.overall.${o}`)}</option>)}
          </select>
        </Field>
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="label">{t('inspection.checklist')}</legend>
          {CHECK_ITEMS.map((k) => (
            <label key={k} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
              {t(`inspection.items.${k}`)}
              <select className="rounded-md border-slate-300 bg-surface py-1 text-sm" value={check[k] || ''} onChange={(e) => setCheck({ ...check, [k]: e.target.value })}>
                <option value="">—</option>
                {['ok', 'attention', 'problem'].map((v) => <option key={v} value={v}>{t(`inspection.values.${v}`)}</option>)}
              </select>
            </label>
          ))}
        </fieldset>
        <Field label={t('inspection.summary')} optional><textarea className="input" rows={3} maxLength={2000} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></Field>
        <Field label={t('inspection.reportPhoto')} optional><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" /></Field>
        <ErrorBox error={error} />
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary flex-1" disabled={busy} onClick={() => save('published')}>✅ {t('inspection.publish')}</button>
          <button className="btn-outline" disabled={busy} onClick={() => save('scheduled')}>{t('inspection.schedule')}</button>
          <button className="btn-ghost text-rose-600" disabled={busy} onClick={() => save('cancelled')}>{t('inspection.cancel')}</button>
        </div>
      </div>
    </Modal>
  );
}

export function AdminInspections() {
  const { t, ago } = useI18n();
  const { data, loading, error, reload } = useApi('/admin/inspections');
  const [editing, setEditing] = useState(null);
  useDocumentTitle(t('inspection.adminTitle'));
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">🔧 {t('inspection.adminTitle')}</h1>
      <p className="mb-5 text-sm text-slate-500">{t('inspection.adminHint')}</p>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="check" title={t('inspection.none')} /> : (
        <ul className="space-y-2">
          {data.items.map((i) => (
            <li key={i.id} className="card flex flex-wrap items-center gap-3 p-3">
              {i.cover_url && <img src={i.cover_url} alt="" className="h-14 w-16 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <Link to={`/products/${i.product_id}`} className="font-semibold hover:underline">{i.product_title}</Link>
                <p className="text-xs text-slate-500">{i.seller_name} · <a href={`tel:${i.seller_phone}`} className="ltr-nums">{i.seller_phone}</a> · {ago(i.created_at)}</p>
                {i.admin_note && <p className="text-xs text-slate-600">📝 {i.admin_note}</p>}
              </div>
              <span className={`badge ${STATUS_STYLE[i.status]}`}>{t(`inspection.status.${i.status}`)}</span>
              <button className="btn-outline px-3 py-1.5 text-xs" onClick={() => setEditing(i)}>{i.status === 'published' ? t('common.edit') : t('inspection.enterReport')}</button>
            </li>
          ))}
        </ul>
      )}
      {editing && <ReportForm item={editing} onClose={() => setEditing(null)} onDone={reload} />}
    </div>
  );
}
