// Category details: form fields, the details table on a listing, search filters and card chips.
import { useI18n } from '../i18n/index.jsx';
import { attributesFor, BRAND_NAMES } from '../lib/attributes.js';
import { Field } from './ui.jsx';

export function useAttrText() {
  const { t, number } = useI18n();
  const label = (key) => t(`attrs.${key}`);
  const option = (key, v) => {
    if (key === 'brand') return v === 'other' ? t('attrs.opts.other') : BRAND_NAMES[v] || v;
    const s = t(`attrs.opts.${key}.${v}`);
    return s.startsWith('attrs.') ? v : s;
  };
  const value = (def, v) => {
    if (v === undefined || v === null || v === '') return '';
    if (def.type === 'select') return `${option(def.key, v)}${def.unit ? ` ${def.unit}` : ''}`;
    if (def.type === 'int') return def.key === 'year' ? String(v) : `${number(v)}${def.unit ? ` ${def.unit}` : ''}`;
    return String(v);
  };
  return { label, option, value };
}

/** Listing form: the fields of the chosen category. */
export function AttributeFields({ categorySlug, value, onChange, fieldError }) {
  const { t } = useI18n();
  const { label, option } = useAttrText();
  const defs = attributesFor(categorySlug);
  if (!defs.length) return null;
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <fieldset className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <legend className="px-1 text-sm font-bold text-brand-900 dark-brand-text">{t('attrs.details')}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {defs.map((d) => (
          <Field key={d.key} label={`${label(d.key)}${d.unit ? ` (${d.unit})` : ''}`} optional error={fieldError?.(`attrs.${d.key}`)}>
            {d.type === 'select' ? (
              <select className="input" value={value[d.key] ?? ''} onChange={(e) => set(d.key, e.target.value)}>
                <option value="">{t('form.choose')}</option>
                {d.options.map((o) => <option key={o} value={o}>{option(d.key, o)}{d.unit ? ` ${d.unit}` : ''}</option>)}
              </select>
            ) : d.type === 'int' ? (
              <input className="input" type="number" inputMode="numeric" dir="ltr" min={d.min} max={d.max} value={value[d.key] ?? ''} onChange={(e) => set(d.key, e.target.value)} />
            ) : (
              <input className="input" maxLength={d.max} value={value[d.key] ?? ''} onChange={(e) => set(d.key, e.target.value)} />
            )}
          </Field>
        ))}
      </div>
    </fieldset>
  );
}

/** Listing page: the details as a small table. */
export function AttributeTable({ categorySlug, attrs }) {
  const { label, value } = useAttrText();
  const rows = attributesFor(categorySlug).filter((d) => attrs?.[d.key] !== undefined && attrs[d.key] !== '');
  if (!rows.length) return null;
  return rows.map((d) => (
    <div key={d.key}><dt className="text-slate-500">{label(d.key)}</dt><dd className="font-medium">{value(d, attrs[d.key])}</dd></div>
  ));
}

/** "2017 · 180,000 km · Automatic" under a card title. */
export function useAttrSummary() {
  const { value } = useAttrText();
  return (p) => {
    const defs = attributesFor(p.category_slug);
    const pick = { vehicles: ['year', 'mileage', 'gearbox'], 'real-estate': ['deal', 'rooms', 'surface'], 'phones-electronics': ['storage'], computers: ['ram'] }[p.category_slug] || [];
    return pick.map((k) => defs.find((d) => d.key === k)).filter((d) => d && p.attrs?.[d.key] !== undefined).map((d) => value(d, p.attrs[d.key]) + (d.key === 'rooms' ? ` 🛏` : '')).join(' · ');
  };
}

/** Search page: filters of the chosen category, kept in the URL as a.brand, a.year.min … */
export function AttributeFilters({ categorySlug, values, onChange }) {
  const { t } = useI18n();
  const { label, option } = useAttrText();
  const defs = attributesFor(categorySlug).filter((d) => d.filter);
  if (!defs.length) return null;
  const set = (k, v) => onChange({ [k]: v });
  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      {defs.map((d) => (
        <div key={d.key}>
          <span className="label">{label(d.key)}{d.unit && d.type === 'int' ? ` (${d.unit})` : ''}</span>
          {d.filter === 'eq' ? (
            <select className="input" value={values[`a.${d.key}`] || ''} onChange={(e) => set(`a.${d.key}`, e.target.value)} aria-label={label(d.key)}>
              <option value="">{t('attrs.any')}</option>
              {d.options.map((o) => <option key={o} value={o}>{option(d.key, o)}{d.unit ? ` ${d.unit}` : ''}</option>)}
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {d.filter !== 'max' && <input className="input" type="number" inputMode="numeric" dir="ltr" placeholder={t('attrs.min')} aria-label={`${label(d.key)} – ${t('attrs.min')}`} value={values[`a.${d.key}.min`] || ''} onChange={(e) => set(`a.${d.key}.min`, e.target.value)} />}
              {d.filter !== 'min' && <input className="input" type="number" inputMode="numeric" dir="ltr" placeholder={d.filter === 'max' ? t('attrs.upTo') : t('attrs.max')} aria-label={`${label(d.key)} – ${t('attrs.max')}`} value={values[`a.${d.key}.max`] || ''} onChange={(e) => set(`a.${d.key}.max`, e.target.value)} />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
