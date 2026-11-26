// Souk AI in the sell form: write the ad from the photos, and show what similar items sell for.
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { PriceHint } from '../pages/SoukAI.jsx';
import { ErrorBox } from './ui.jsx';

/** "✨ Write my ad": sends up to 4 photos + the seller's notes, fills the form with the result. */
export function AiWriter({ files, onFill }) {
  const { t, lang } = useI18n();
  const { meta } = useApp();
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  if (!meta.ai?.features?.describe) return null;
  const run = async () => {
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      files.slice(0, 4).forEach((f) => fd.append('images', f));
      fd.append('notes', notes);
      fd.append('lang', lang);
      const r = await api('/ai/describe', { method: 'POST', body: fd });
      setResult(r);
      onFill(r);
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
      <p className="font-bold text-emerald-900">✨ {t('ai.writerTitle')}</p>
      <p className="mb-3 text-xs text-slate-600">{t('ai.writerHint')}</p>
      <textarea className="input mb-2" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('ai.writerNotesPh')} />
      <button type="button" className="btn-primary" onClick={run} disabled={busy || (!files.length && notes.trim().length < 3)}>
        {busy ? t('ai.writing') : `✨ ${t('ai.writerRun')}`}
      </button>
      {!files.length && <span className="ms-2 text-xs text-slate-500">{t('ai.writerNeedPhoto')}</span>}
      <div className="mt-3 space-y-2">
        <ErrorBox error={error} />
        {result && (
          <>
            <p className="text-xs font-semibold text-emerald-800">✓ {t('ai.writerDone')}</p>
            {result.warnings?.length > 0 && <p className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">⚠️ {result.warnings.join(' · ')}</p>}
            {result.missingInfo?.length > 0 && (
              <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
                <p className="font-semibold">{t('ai.writerMissing')}</p>
                <ul className="ms-4 list-disc">{result.missingInfo.map((q) => <li key={q}>{q}</li>)}</ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Live "similar items sell for X–Y" under the price field (computed from listings, no AI cost). */
export function PriceSuggestion({ categoryId, title, condition, price, onLooksOld }) {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!categoryId) { setStats(null); return undefined; }
    const id = setTimeout(() => {
      api('/ai/price', { query: { categoryId, q: title?.trim().slice(0, 120), condition } }).then(setStats).catch(() => setStats(null));
    }, 600);
    return () => clearTimeout(id);
  }, [categoryId, title, condition]);
  // A price ~10× what similar items sell for was very likely typed in old ouguiya.
  const looksOld = onLooksOld && stats?.n >= 3 && price > stats.high * 5 && price / 10 <= stats.high * 2 && price / 10 >= stats.low / 3;
  return (
    <>
      {looksOld && (
        <div className="mb-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900" role="alert">
          <p className="font-semibold">⚠️ {t('ouguiya.looksOld')}</p>
          <button type="button" className="mt-1 font-bold underline" onClick={onLooksOld}>{t('ouguiya.fixOld')}</button>
        </div>
      )}
      <PriceHint stats={stats} compact />
    </>
  );
}
