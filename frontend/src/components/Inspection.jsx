// Car inspection: the report on a listing, and the seller's "ask for an inspection" button.
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { ErrorBox, Field, Modal } from './ui.jsx';

export const CHECK_ITEMS = ['engine', 'gearbox', 'brakes', 'suspension', 'steering', 'body', 'electrical', 'ac', 'tires', 'interior'];
const OVERALL = { excellent: 'bg-emerald-100 text-emerald-800', good: 'bg-brand-100 text-brand-900', fair: 'bg-amber-100 text-amber-800', poor: 'bg-rose-100 text-rose-700' };
const MARK = { ok: ['✓', 'text-emerald-700'], attention: ['!', 'text-amber-700'], problem: ['✕', 'text-rose-700'] };

/** The published report, on the listing page. */
export function InspectionReport({ inspection }) {
  const { t, date, number } = useI18n();
  if (!inspection) return null;
  const items = CHECK_ITEMS.filter((k) => inspection.checklist?.[k]);
  return (
    <section className="card space-y-3 border-emerald-200 p-5" aria-label={t('inspection.title')}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">✅ {t('inspection.title')}</h2>
          <p className="text-xs text-slate-500">{inspection.workshop} · {date(inspection.inspected_on)}{inspection.mileage != null && ` · ${number(inspection.mileage)} km`}</p>
        </div>
        <span className={`badge text-sm ${OVERALL[inspection.overall]}`}>{t(`inspection.overall.${inspection.overall}`)}</span>
      </div>
      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
          {items.map((k) => {
            const [sym, cls] = MARK[inspection.checklist[k]];
            return <li key={k} className="flex items-center gap-2"><span className={`w-4 text-center font-bold ${cls}`} aria-hidden="true">{sym}</span>{t(`inspection.items.${k}`)}<span className="sr-only">: {t(`inspection.values.${inspection.checklist[k]}`)}</span></li>;
          })}
        </ul>
      )}
      {inspection.summary && <p className="whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{inspection.summary}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span><span className="text-emerald-700">✓</span> {t('inspection.values.ok')} · <span className="text-amber-700">!</span> {t('inspection.values.attention')} · <span className="text-rose-700">✕</span> {t('inspection.values.problem')}</span>
        {inspection.report_url && <a href={inspection.report_url} target="_blank" rel="noreferrer" className="link">{t('inspection.original')}</a>}
      </div>
      <p className="text-[11px] text-slate-400">{t('inspection.disclaimer')}</p>
    </section>
  );
}

/** Seller: ask for an inspection of a car listing. */
export function InspectionButton({ product }) {
  const { t } = useI18n();
  const { notify } = useApp();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  if (product.category_slug !== 'vehicles' || product.status !== 'approved') return null;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await api(`/products/${product.id}/inspection`, { method: 'POST', body: { note } }); notify(t('inspection.requested')); setOpen(false); } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <>
      <button type="button" className="btn-outline border-emerald-300 px-3 py-2 text-xs text-emerald-800" onClick={() => setOpen(true)}>🔧 {t('inspection.ask')}</button>
      <Modal open={open} onClose={() => setOpen(false)} title={`🔧 ${t('inspection.ask')}`}>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-slate-600">{t('inspection.askText')}</p>
          <Field label={t('inspection.availability')} optional><textarea className="input" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('inspection.availabilityPh')} /></Field>
          <ErrorBox error={error} />
          <button className="btn-primary w-full" disabled={busy}>{t('inspection.send')}</button>
        </form>
      </Modal>
    </>
  );
}
