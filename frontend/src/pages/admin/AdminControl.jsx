// Admin → Control center: every on/off switch of the site on one page, saved at once,
// each with a link to its detailed settings. A feature that is off is hidden and refused by the API.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBox, Spinner } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { api } from '../../lib/api.js';
import { useApi, useDocumentTitle } from '../../lib/hooks.js';

// [key, path in settings, emoji, link to its detailed page]
const GROUPS = [
  ['site', [
    ['maintenance', 'maintenance.enabled', '🛠️', '/admin/appearance', true],
    ['registration', 'features.registration', '📝', '/admin/settings'],
    ['autoApprove', 'features.autoApprove', '✅', '/admin/settings'],
    ['phoneVerification', 'features.phoneVerification', '📱', '/admin/settings'],
    ['paidUpgrades', 'features.paidUpgrades', '💳', '/admin/payments'],
  ]],
  ['selling', [
    ['offers', 'modules.offers', '💰'],
    ['barter', 'modules.barter', '🔄'],
    ['auctions', 'auctions.enabled', '🔨', '/admin/market'],
    ['wanted', 'modules.wanted', '🙋', '/admin/market?tab=wanted'],
    ['voice', 'modules.voice', '🎙️'],
    ['video', 'modules.video', '🎬'],
    ['bump', 'modules.bump', '⬆️'],
    ['inspections', 'modules.inspections', '🔍', '/admin/inspections'],
    ['statusImage', 'modules.statusImage', '📲'],
    ['places', 'modules.places', '📍', '/admin/places'],
  ]],
  ['merchants', [
    ['pro', 'modules.pro', '⚡', '/admin/market?tab=coupons'],
    ['invoices', 'modules.invoices', '🧾'],
  ]],
  ['delivery', [
    ['delivery', 'delivery.enabled', '🛵', '/admin/delivery'],
    ['escrow', 'delivery.escrow', '🔒', '/admin/escrow'],
  ]],
  ['community', [
    ['social', 'community.enabled', '💬', '/admin/community'],
    ['live', 'community.liveEnabled', '🔴', '/admin/community'],
  ]],
  ['sections', [
    ['livestock', 'modules.livestock', '🐪', '/admin/places'],
    ['eid', 'season.eid.enabled', '🐑', '/admin/settings'],
    ['ai', 'ai.enabled', '🤖', '/admin/ai'],
  ]],
  ['interface', [
    ['hassaniya', 'modules.hassaniya', '🗣️', '/admin/texts'],
    ['dataSaver', 'modules.dataSaver', '📶'],
  ]],
];

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
/** A copy of `section` with the nested `rest` path set to `v`. */
function setIn(section, rest, v) {
  if (rest.length === 1) return { ...section, [rest[0]]: v };
  return { ...section, [rest[0]]: setIn(section?.[rest[0]] || {}, rest.slice(1), v) };
}

export function AdminControl() {
  const { t } = useI18n();
  const { notify } = useApp();
  const { reload: reloadSite } = useSettings();
  useDocumentTitle(t('control.title'));
  const { data, loading, error, setData } = useApi('/admin/settings');
  const [busy, setBusy] = useState(null);
  const [saveError, setSaveError] = useState(null);
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  const s = data.settings;

  const toggle = async (key, path, v) => {
    const [section, ...rest] = path.split('.');
    const next = setIn(s[section], rest, v);
    setBusy(key); setSaveError(null);
    try {
      const r = await api('/admin/settings', { method: 'PUT', body: { [section]: next } });
      setData((d) => ({ ...d, settings: r.settings || { ...d.settings, [section]: next } }));
      reloadSite();
      notify(v ? t('control.turnedOn', { name: t(`control.f.${key}.name`) }) : t('control.turnedOff', { name: t(`control.f.${key}.name`) }));
    } catch (err) { setSaveError(err); } finally { setBusy(null); }
  };

  const all = GROUPS.flatMap(([, items]) => items);
  const offCount = all.filter(([, path, , , inverted]) => (inverted ? get(s, path) === true : get(s, path) === false)).length;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎛️ {t('control.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('control.intro')}</p>
        <p className="mt-2 text-sm font-semibold">{t('control.summary', { on: all.length - offCount, total: all.length })}</p>
      </div>
      <ErrorBox error={saveError} />
      {GROUPS.map(([group, items]) => (
        <section key={group} className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t(`control.groups.${group}`)}</h2>
          <ul className="grid gap-2 md:grid-cols-2">
            {items.map(([key, path, emoji, link, inverted]) => {
              const on = inverted ? get(s, path) === true : get(s, path) !== false;
              return (
                <li key={key} className={`card flex items-start gap-3 p-4 ${inverted && on ? 'ring-2 ring-amber-300' : ''}`}>
                  <span className="text-2xl" aria-hidden="true">{emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{t(`control.f.${key}.name`)}</p>
                    <p className="text-xs leading-relaxed text-slate-500">{t(`control.f.${key}.hint`)}</p>
                    {link && <Link to={link} className="mt-1 inline-block text-xs font-semibold text-brand-700 hover:underline">{t('control.details')} <span aria-hidden="true" className="inline-block rtl:rotate-180">→</span></Link>}
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-pointer items-center" title={on ? 'on' : 'off'}>
                    <input type="checkbox" className="peer sr-only" checked={on} disabled={busy === key}
                      onChange={(e) => toggle(key, path, e.target.checked)} aria-label={t(`control.f.${key}.name`)} />
                    <span className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-disabled:opacity-50" />
                    <span className="absolute start-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">ℹ️ {t('control.note')}</p>
    </div>
  );
}
