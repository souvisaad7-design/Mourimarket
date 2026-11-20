import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { placeLabel, useGeo } from '../context/LocationContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { useApi } from '../lib/hooks.js';
import { CitySelect, Icon } from './ui.jsx';

/** Choose a city (and a moughataa) by hand: for people who prefer not to share their position. */
export function ManualPlace({ onDone, compact = false }) {
  const { t, lang } = useI18n();
  const { meta } = useApp();
  const { setManual, location } = useGeo();
  const areas = useApi('/geo/areas');
  const [city, setCity] = useState(location?.place?.city?.key || '');
  const [area, setArea] = useState(location?.place?.area?.key || '');
  const list = (areas.data?.areas || {})[city] || [];
  const save = (e) => {
    e.preventDefault();
    if (!city) return;
    setManual({ cityKey: city, area: list.find((a) => a.key === area) || null });
    onDone?.();
  };
  return (
    <form onSubmit={save} className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-[1fr_1fr_auto]'}`}>
      <CitySelect value={city} onChange={(v) => { setCity(v); setArea(''); }} cities={meta.cities.filter((c) => c.lat != null)} placeholder={t('geo.chooseCity')} aria-label={t('geo.chooseCity')} required />
      <select className="input" value={area} onChange={(e) => setArea(e.target.value)} disabled={!list.length} aria-label={t('geo.chooseArea')}>
        <option value="">{list.length ? t('geo.anyArea') : t('geo.noAreas')}</option>
        {list.map((a) => <option key={a.key} value={a.key}>{a[lang] || a.ar}</option>)}
      </select>
      <button className="btn-primary" disabled={!city}><Icon name="check" className="h-4 w-4" />{t('geo.useThisPlace')}</button>
    </form>
  );
}

/**
 * "📍 Locate me": asks the browser (which shows its own permission prompt), then shows
 * city / moughataa / neighbourhood. Falls back to choosing the place by hand.
 */
export default function LocationBar({ className = '' }) {
  const { t, lang } = useI18n();
  const { location, status, locate, forget } = useGeo();
  const [manual, setManual] = useState(false);
  const failed = ['denied', 'unavailable', 'unsupported', 'outside'].includes(status);

  return (
    <section className={`rounded-2xl border border-brand-100 bg-brand-50 p-3 sm:p-4 ${className}`} aria-label={t('geo.title')}>
      <div className="flex flex-wrap items-center gap-2">
        {location ? (
          <p className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-gold-300" aria-hidden="true"><Icon name="pin" className="h-4 w-4" /></span>
            <span className="min-w-0">
              <span className="block text-xs text-slate-500">{location.source === 'gps' ? t('geo.youAreIn') : t('geo.yourChoice')}</span>
              <span className="block truncate font-bold text-brand-900 dark-brand-text">{placeLabel(location.place, lang) || t('geo.located')}</span>
            </span>
          </p>
        ) : (
          <p className="min-w-0 flex-1 text-sm text-slate-600">{t('geo.prompt')}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-accent px-3 py-2 text-sm" onClick={() => { setManual(false); locate(); }} disabled={status === 'locating'} aria-busy={status === 'locating'}>
            <span aria-hidden="true">📍</span>{status === 'locating' ? t('geo.locating') : location ? t('geo.updateLocation') : t('geo.locateMe')}
          </button>
          <button type="button" className="btn-outline bg-surface px-3 py-2 text-sm" onClick={() => setManual(!manual)} aria-expanded={manual}>
            {t('geo.chooseManually')}
          </button>
          {location && <button type="button" className="btn-ghost px-2 py-2 text-xs" onClick={forget}>{t('geo.forget')}</button>}
        </div>
      </div>
      {failed && (
        <p role="alert" className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t(`geo.error.${status}`)} {status !== 'outside' && !manual && <button type="button" className="link" onClick={() => setManual(true)}>{t('geo.chooseManually')}</button>}
        </p>
      )}
      {(manual || (failed && status !== 'outside')) && (
        <div className="mt-3"><ManualPlace onDone={() => setManual(false)} /></div>
      )}
      <p className="mt-2 text-[11px] text-slate-500">🔒 {t('geo.privacy')}</p>
    </section>
  );
}
