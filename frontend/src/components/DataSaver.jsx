import { useI18n } from '../i18n/index.jsx';
import { setLite, useLite } from '../lib/dataSaver.js';

/** Header / menu switch for data-saver mode. */
export function DataSaverToggle({ withLabel = false }) {
  const { t } = useI18n();
  const on = useLite();
  return (
    <button type="button" onClick={() => setLite(!on)} aria-pressed={on} title={t('lite.title')}
      className={withLabel
        ? `flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${on ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-700'}`
        : `btn-ghost relative p-2 text-lg leading-none ${on ? 'text-emerald-300' : 'text-white/80'}`}>
      <span aria-hidden="true">📉</span>
      {withLabel ? <span>{on ? t('lite.on') : t('lite.off')}</span> : <span className="sr-only">{t('lite.title')}</span>}
      {!withLabel && on && <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />}
    </button>
  );
}
