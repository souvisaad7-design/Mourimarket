import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { compressImage } from '../lib/image.js';
import { SITE_PAYMENT } from '../siteConfig.js';
import { ErrorBox, Field, Icon, Modal, useFieldError } from './ui.jsx';

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-700',
};

export const isFeaturable = (p) => p.status === 'approved' && p.availability === 'available';

/** Request form: account verification, or featuring one listing, paid by mobile money + receipt photo. */
export function UpgradeModal({ request, products = [], onClose, onDone }) {
  const { t, price } = useI18n();
  const { meta, notify } = useApp();
  const cfg = meta.upgrades || { verifyPrice: 0, featurePlans: [], paymentMethods: [] };
  const kind = request?.kind;
  const featurable = products.filter(isFeaturable);
  const [productId, setProductId] = useState('');
  const [days, setDays] = useState(0);
  const [method, setMethod] = useState('bankily');
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const fieldError = useFieldError(error);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!request) return;
    setProductId(String(request.product?.id || featurable[0]?.id || ''));
    setDays(cfg.featurePlans[0]?.days || 0);
    setMethod('bankily'); setRef(''); setNote(''); setReceipt(null); setPreview(''); setError(null);
  }, [request]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (!request) return null;
  const amount = kind === 'verify' ? cfg.verifyPrice : (cfg.featurePlans.find((p) => p.days === days)?.price || 0);

  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      // Receipts must stay readable: larger and sharper than listing photos.
      const out = await compressImage(f, { maxWidth: 1600, quality: 0.85 });
      setReceipt(out.file);
      setPreview(URL.createObjectURL(out.file));
      setError(null);
    } catch {
      setError({ code: 'invalid_image_type' });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!receipt) { setError({ code: 'validation_error', fields: { receipt: 'required' } }); return; }
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('kind', kind);
      if (kind === 'feature') { fd.append('productId', productId); fd.append('days', String(days)); }
      fd.append('paymentMethod', method);
      if (ref.trim()) fd.append('paymentRef', ref.trim());
      if (note.trim()) fd.append('note', note.trim());
      fd.append('receipt', receipt);
      await api('/upgrade-requests', { method: 'POST', body: fd });
      notify(t('upgrades.sent'));
      onDone?.();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const number = SITE_PAYMENT[method];
  return (
    <Modal open onClose={onClose} title={kind === 'verify' ? t('upgrades.verifyTitle') : t('upgrades.featureTitle')} size="lg">
      <form onSubmit={submit} className="space-y-5">
        <ErrorBox error={error && !error.fields ? error : null} />

        {kind === 'feature' && (
          <>
            {featurable.length ? (
              <Field label={t('upgrades.chooseListing')} error={fieldError('productId')}>
                <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)} required>
                  {featurable.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </Field>
            ) : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t('upgrades.noFeaturable')}</p>}
            <fieldset>
              <legend className="label">{t('upgrades.plan')}</legend>
              <div className="grid grid-cols-3 gap-2">
                {cfg.featurePlans.map((p) => (
                  <label key={p.days} className={`cursor-pointer rounded-xl border-2 p-3 text-center transition ${days === p.days ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="plan" className="sr-only" checked={days === p.days} onChange={() => setDays(p.days)} />
                    <span className="block font-bold">{t('upgrades.planDays', { days: p.days })}</span>
                    <span className="block text-sm text-brand-800 ltr-nums">{price(p.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <div className="rounded-2xl bg-brand-50 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-semibold text-brand-900">{t('upgrades.price')}</span>
            <span className="text-2xl font-bold text-brand-800 ltr-nums">{price(amount)}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">{t('upgrades.howToPay')}</p>
          <ol className="mt-1 list-decimal space-y-1 ps-5 text-sm text-slate-600">
            <li>{t('upgrades.payStep1', { amount: price(amount) })}</li>
            <li>{t('upgrades.payStep2')}</li>
            <li>{t('upgrades.payStep3')}</li>
          </ol>
        </div>

        <fieldset>
          <legend className="label">{t('upgrades.method')}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cfg.paymentMethods.map((m) => (
              <label key={m} className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-center text-sm font-semibold transition ${method === m ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                <input type="radio" name="method" className="sr-only" checked={method === m} onChange={() => setMethod(m)} />
                {t(`upgrades.methods.${m}`)}
              </label>
            ))}
          </div>
          {method !== 'other' && (
            <p className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
              {number ? (
                <>
                  <span className="font-bold ltr-nums" dir="ltr">{number}</span>
                  <button type="button" className="link text-xs" onClick={() => navigator.clipboard?.writeText(number.replace(/\s/g, '')).then(() => notify(t('common.copied')), () => {})}>{t('common.copy')}</button>
                  <span className="text-slate-500">{t('upgrades.accountName', { name: SITE_PAYMENT.accountName })}</span>
                </>
              ) : <span className="text-slate-500">{t('upgrades.askAdmin')}</span>}
            </p>
          )}
        </fieldset>

        <Field label={t('upgrades.receipt')} error={fieldError('receipt')} hint={t('upgrades.receiptHint')}>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pick} tabIndex={-1} />
          {preview ? (
            <div className="flex items-center gap-3">
              <img src={preview} alt="" className="h-24 w-24 rounded-xl object-cover ring-1 ring-slate-200" />
              <button type="button" className="btn-outline" onClick={() => fileRef.current?.click()}><Icon name="image" className="h-4 w-4" />{t('upgrades.receiptChange')}</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 p-5 text-slate-500 transition hover:border-brand-500 hover:text-brand-700">
              <Icon name="image" className="h-7 w-7" />
              <span className="text-sm font-semibold">{t('upgrades.receiptPick')}</span>
            </button>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('upgrades.ref')} hint={t('upgrades.refHint')} optional>
            <input className="input" value={ref} maxLength={80} onChange={(e) => setRef(e.target.value)} dir="ltr" />
          </Field>
          <Field label={t('upgrades.note')} optional>
            <input className="input" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>

        <button className="btn-primary w-full" disabled={busy || (kind === 'feature' && !featurable.length)}>
          {busy ? t('common.loading') : t('upgrades.submit')}
        </button>
      </form>
    </Modal>
  );
}

/** Seller dashboard panel: request verification / featuring, and follow your requests. */
export function UpgradePanel({ user, requests, onRequest, hasFeaturable }) {
  const { t, price, date } = useI18n();
  const pendingVerify = requests.some((r) => r.kind === 'verify' && r.status === 'pending');
  return (
    <section className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-labelledby="upgrades-title">
      <h2 id="upgrades-title" className="flex items-center gap-2 text-lg font-bold"><Icon name="star" filled className="h-5 w-5 text-gold-500" />{t('upgrades.title')}</h2>
      <p className="mt-1 text-sm text-slate-600">{t('upgrades.subtitle')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="card flex items-start gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700"><Icon name="shield" /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{t('upgrades.verifyTitle')}</p>
            <p className="text-xs text-slate-500">{t('upgrades.verifyText')}</p>
            <div className="mt-3">
              {user.is_verified ? <span className="badge bg-emerald-100 text-emerald-800">{t('upgrades.verified')}</span>
                : pendingVerify ? <span className="badge bg-amber-100 text-amber-800"><Icon name="clock" className="me-1 h-3 w-3" />{t('upgrades.pendingVerify')}</span>
                  : <button className="btn-primary px-3 py-2 text-xs" onClick={() => onRequest({ kind: 'verify' })}>{t('upgrades.verifyCta')}</button>}
            </div>
          </div>
        </div>
        <div className="card flex items-start gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-gold-600"><Icon name="star" filled /></span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{t('upgrades.featureTitle')}</p>
            <p className="text-xs text-slate-500">{t('upgrades.featureText')}</p>
            <div className="mt-3">
              <button className="btn-accent px-3 py-2 text-xs" disabled={!hasFeaturable} onClick={() => onRequest({ kind: 'feature' })}>{t('upgrades.featureCta')}</button>
            </div>
          </div>
        </div>
      </div>
      {requests.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-bold text-slate-700">{t('upgrades.myRequests')}</h3>
          <ul className="card divide-y divide-slate-100">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                <span className={`badge ${STATUS_TONE[r.status]}`}>{t(`upgrades.status.${r.status}`)}</span>
                <span className="font-semibold">{t(`upgrades.kind.${r.kind}`)}</span>
                {r.product_title && <span className="min-w-0 truncate text-slate-600">«{r.product_title}» · {t('upgrades.planDays', { days: r.days })}</span>}
                <span className="ms-auto text-xs text-slate-500"><span className="ltr-nums">{price(r.amount)}</span> · {date(r.created_at)}</span>
                {r.status === 'rejected' && r.admin_note && <p className="w-full text-xs text-rose-600">{t('upgrades.reason', { reason: r.admin_note })}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
