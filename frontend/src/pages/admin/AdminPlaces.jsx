// Admin → Safe meeting places: public spots per city suggested in the chat for hand-overs.
import { useState } from 'react';
import { CitySelect, EmptyState, ErrorBox, Field, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

const KINDS = ['mall', 'police', 'station', 'market', 'bank', 'other'];
const EMPTY = { city: '', name_ar: '', name_fr: '', address: '', kind: 'mall', lat: '', lng: '', is_active: true, sort_order: 0 };

const MARKET_EMPTY = { city: '', name_ar: '', name_fr: '', days: [], notes: '', is_active: true };

/** Weekly livestock markets: town, market days, notes. */
function MarketsSection() {
  const { t, lang } = useI18n();
  const { meta, notify } = useApp();
  const { data, reload } = useApi('/admin/livestock-markets');
  const [f, setF] = useState(MARKET_EMPTY);
  const [error, setError] = useState(null);
  const dayName = (d) => new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : lang, { weekday: 'long' }).format(new Date(Date.UTC(2023, 0, 1 + d, 12)));
  const cityName = (k) => meta.cities?.find((c) => c.key === k)?.[lang] || k;
  const save = async (e) => {
    e.preventDefault(); setError(null);
    try { await api('/admin/livestock-markets', { method: 'POST', body: f }); notify(t('common.changesSaved')); setF(MARKET_EMPTY); reload(); } catch (err) { setError(err); }
  };
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">🐪 {t('admin.livestockMarkets')}</h2>
      <p className="text-sm text-slate-500">{t('markets.hint')}</p>
      <form onSubmit={save} className="card grid gap-3 p-5 sm:grid-cols-2">
        <Field label={t('form.city')}><CitySelect value={f.city} onChange={(v) => setF({ ...f, city: v })} cities={meta.cities} placeholder={t('form.choose')} required /></Field>
        <Field label={t('places.nameAr')}><input className="input" required minLength={2} maxLength={120} value={f.name_ar} onChange={(e) => setF({ ...f, name_ar: e.target.value })} /></Field>
        <Field label={t('markets.days')}>
          <div className="flex flex-wrap gap-1.5">
            {[6, 0, 1, 2, 3, 4, 5].map((d) => (
              <label key={d} className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${f.days.includes(d) ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <input type="checkbox" className="sr-only" checked={f.days.includes(d)} onChange={(e) => setF({ ...f, days: e.target.checked ? [...f.days, d] : f.days.filter((x) => x !== d) })} />{dayName(d)}
              </label>
            ))}
          </div>
        </Field>
        <Field label={t('markets.notes')} optional><input className="input" maxLength={200} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        <ErrorBox error={error} />
        <div className="sm:col-span-2"><button className="btn-primary" disabled={!f.days.length}>+ {t('markets.add')}</button></div>
      </form>
      {!data?.items?.length ? <p className="text-sm text-slate-500">{t('markets.empty')}</p> : (
        <ul className="space-y-2">
          {data.items.map((m) => (
            <li key={m.id} className="card flex flex-wrap items-center gap-3 p-3 text-sm">
              <span className="badge bg-slate-100 text-slate-700">{cityName(m.city)}</span>
              <span className="min-w-0 flex-1"><span className="font-semibold">{m.name_ar}</span> <span className="text-xs text-slate-500">· {m.days.map(dayName).join('، ')}</span></span>
              <button type="button" className="btn-ghost px-2 py-1 text-xs text-rose-600" onClick={async () => { if (window.confirm(t('places.deleteConfirm', { name: m.name_ar }))) { await api(`/admin/livestock-markets/${m.id}`, { method: 'DELETE' }); reload(); } }}>{t('common.delete')}</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminPlaces() {
  const { t, lang } = useI18n();
  const { meta, notify } = useApp();
  useDocumentTitle(t('places.adminTitle'));
  const { data, loading, error, reload } = useApi('/admin/meeting-places');
  const [f, setF] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const cityName = (k) => meta.cities?.find((c) => c.key === k)?.[lang] || k;
  const save = async (e) => {
    e.preventDefault(); setSaveError(null);
    const body = { ...f, lat: f.lat === '' ? null : Number(f.lat), lng: f.lng === '' ? null : Number(f.lng), sort_order: Number(f.sort_order) || 0 };
    try {
      await api(editing ? `/admin/meeting-places/${editing}` : '/admin/meeting-places', { method: editing ? 'PUT' : 'POST', body });
      notify(t('common.changesSaved')); setF(EMPTY); setEditing(null); reload();
    } catch (err) { setSaveError(err); }
  };
  const remove = async (p) => { if (window.confirm(t('places.deleteConfirm', { name: p.name_ar }))) { await api(`/admin/meeting-places/${p.id}`, { method: 'DELETE' }); reload(); } };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">📍 {t('places.adminTitle')}</h1>
        <p className="text-sm text-slate-500">{t('places.adminHint')}</p>
      </div>
      <form onSubmit={save} className="card grid gap-3 p-5 sm:grid-cols-2">
        <Field label={t('form.city')}><CitySelect value={f.city} onChange={(v) => setF({ ...f, city: v })} cities={meta.cities} placeholder={t('form.choose')} required /></Field>
        <Field label={t('places.kind')}>
          <select className="input" value={f.kind} onChange={set('kind')}>{KINDS.map((k) => <option key={k} value={k}>{t(`places.kinds.${k}`)}</option>)}</select>
        </Field>
        <Field label={t('places.nameAr')}><input className="input" required minLength={2} maxLength={120} value={f.name_ar} onChange={set('name_ar')} /></Field>
        <Field label={t('places.nameFr')} optional><input className="input" dir="ltr" maxLength={120} value={f.name_fr} onChange={set('name_fr')} /></Field>
        <Field label={t('places.address')} optional><input className="input" maxLength={200} value={f.address} onChange={set('address')} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('places.lat')} optional><input className="input" dir="ltr" inputMode="decimal" value={f.lat} onChange={set('lat')} placeholder="18.0858" /></Field>
          <Field label={t('places.lng')} optional><input className="input" dir="ltr" inputMode="decimal" value={f.lng} onChange={set('lng')} placeholder="-15.9785" /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> {t('places.active')}</label>
        <ErrorBox error={saveError} />
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary">{editing ? t('common.save') : `+ ${t('places.add')}`}</button>
          {editing && <button type="button" className="btn-outline" onClick={() => { setEditing(null); setF(EMPTY); }}>{t('common.cancel')}</button>}
        </div>
      </form>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="pin" title={t('places.empty')} /> : (
        <ul className="space-y-2">
          {data.items.map((p) => (
            <li key={p.id} className={`card flex flex-wrap items-center gap-3 p-3 text-sm ${p.is_active ? '' : 'opacity-60'}`}>
              <span className="badge bg-slate-100 text-slate-700">{cityName(p.city)}</span>
              <span className="min-w-0 flex-1"><span className="font-semibold">{p.name_ar}</span> <span className="text-xs text-slate-500">· {t(`places.kinds.${p.kind}`)}{p.address ? ` · ${p.address}` : ''}</span></span>
              <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => { setEditing(p.id); setF({ ...p, lat: p.lat ?? '', lng: p.lng ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('common.edit')}</button>
              <button type="button" className="btn-ghost px-2 py-1 text-xs text-rose-600" onClick={() => remove(p)}>{t('common.delete')}</button>
            </li>
          ))}
        </ul>
      )}
      <MarketsSection />
    </div>
  );
}
