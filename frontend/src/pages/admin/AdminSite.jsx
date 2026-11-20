// Admin pages for the site itself: settings, texts, the admin's account,
// reviews, uploaded files and a map of every page.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorBox, Field, Icon, LogoMark, Modal, Pagination, Spinner, Stars, useFieldError } from '../../components/ui.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useI18n } from '../../i18n/index.jsx';
import { LANGS, messages } from '../../i18n/messages.js';
import { api } from '../../lib/api.js';
import { pickLang } from '../../lib/localized.js';
import { useApi } from '../../lib/hooks.js';
import { useImageUpload } from './AdminContent.jsx';

function PageTitle({ icon, title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Icon name={icon} className="h-6 w-6 text-brand-700" />{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, hint, children, onSave, busy, error }) {
  const { t } = useI18n();
  return (
    <form className="card space-y-4 p-5" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
      <ErrorBox error={error} />
      {children}
      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button className="btn-primary w-full sm:w-auto" disabled={busy}><Icon name="check" className="h-4 w-4" />{busy ? t('common.loading') : t('common.saveChanges')}</button>
      </div>
    </form>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
      <span>
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span aria-hidden="true" className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 after:absolute after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition after:content-[''] ltr:after:left-0.5 rtl:after:right-0.5 ltr:peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
    </label>
  );
}

/** Save one or more settings sections and push the result to the whole app. */
function useSaveSettings() {
  const { t } = useI18n();
  const { notify } = useApp();
  const { setSettings } = useSettings();
  const [busy, setBusy] = useState('');
  const [errors, setErrors] = useState({});
  const save = async (key, body) => {
    setBusy(key);
    setErrors((e) => ({ ...e, [key]: null }));
    try {
      const { settings } = await api('/admin/settings', { method: 'PUT', body });
      setSettings(settings);
      notify(t('common.changesSaved'));
      return settings;
    } catch (err) {
      setErrors((e) => ({ ...e, [key]: err }));
      return null;
    } finally { setBusy(''); }
  };
  return { save, busy, errors };
}

// ---------- Settings pages (all saved in site_settings) ----------

/** Load /admin/settings into an editable copy. */
function useSettingsDraft() {
  const { data, loading, error } = useApi('/admin/settings');
  const [s, setS] = useState(null);
  useEffect(() => { if (data?.settings) setS(structuredClone(data.settings)); }, [data]);
  const set = (section, key) => (e) => setS((prev) => ({ ...prev, [section]: { ...prev[section], [key]: e.target.value } }));
  const put = (section, patch) => setS((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  return { s, setS, set, put, loading, error, updated: data?.updated };
}

const fieldErr = (err) => (err?.fields ? Object.entries(err.fields).map(([f, m]) => `${f}: ${m}`).join(' · ') : null);

/** General: sign-ups and automatic publishing. */
export function AdminSettings() {
  const { t } = useI18n();
  const { s, put, loading, error, updated } = useSettingsDraft();
  const { save, busy, errors } = useSaveSettings();
  if (loading || !s) return error ? <ErrorBox error={error} /> : <Spinner />;
  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle icon="globe" title={t('admin.siteSettings')} subtitle={t('admin.generalHint')} />
      <Section title={t('admin.set.features')} onSave={() => save('features', { features: s.features })} busy={busy === 'features'} error={errors.features}>
        <Toggle checked={s.features.registration} onChange={(v) => put('features', { registration: v })} label={t('admin.set.registration')} hint={t('admin.set.registrationHint')} />
        <Toggle checked={s.features.autoApprove} onChange={(v) => put('features', { autoApprove: v })} label={t('admin.set.autoApprove')} hint={t('admin.set.autoApproveHint')} />
      </Section>
      {updated?.length > 0 && <p className="text-xs text-slate-400">{t('admin.set.lastChange', { name: updated[0].updated_by_name || '—' })}</p>}
    </div>
  );
}

/** Identity & appearance: name, logo, colours, maintenance mode. */
export function AdminAppearance() {
  const { t } = useI18n();
  const { s, set, put, loading, error } = useSettingsDraft();
  const { save, busy, errors } = useSaveSettings();
  const fileRef = useRef(null);
  const { upload, busy: uploading } = useImageUpload();
  if (loading || !s) return error ? <ErrorBox error={error} /> : <Spinner />;
  const a = s.appearance;
  const pickLogo = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const url = await upload(f, 512);
    if (url) put('appearance', { logoUrl: url });
  };
  const colour = (key, fallback, label) => (
    <Field label={label} hint={t('admin.colorHint')}>
      <div className="flex items-center gap-2">
        <input type="color" className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-surface p-1" value={a[key] || fallback} onChange={(e) => put('appearance', { [key]: e.target.value })} aria-label={label} />
        <input className="input w-32 font-mono" dir="ltr" maxLength={7} placeholder={fallback} value={a[key]} onChange={set('appearance', key)} />
        {a[key] && <button type="button" className="btn-ghost px-2 text-xs" onClick={() => put('appearance', { [key]: '' })}>{t('admin.resetColor')}</button>}
      </div>
    </Field>
  );
  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle icon="star" title={t('admin.appearance')} subtitle={t('admin.appearanceHint')} />
      <Section title={t('admin.identity')} onSave={() => save('appearance', { appearance: s.appearance })} busy={busy === 'appearance'} error={errors.appearance}>
        <Field label={t('admin.siteName')} hint={t('admin.siteNameHint')} optional>
          <input className="input" maxLength={40} placeholder={t('brand.name')} value={a.siteName} onChange={set('appearance', 'siteName')} />
        </Field>
        <Field label={t('admin.logo')} hint={t('admin.logoHint')} optional>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pickLogo} tabIndex={-1} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 p-1.5">
              {a.logoUrl ? <img src={a.logoUrl} alt="" className="h-full w-full object-contain" /> : <LogoMark className="h-full w-full" />}
            </span>
            <button type="button" className="btn-outline" disabled={uploading} onClick={() => fileRef.current?.click()}><Icon name="image" className="h-4 w-4" />{uploading ? t('common.loading') : a.logoUrl ? t('admin.changeImage') : t('admin.uploadImage')}</button>
            {a.logoUrl && <button type="button" className="btn-ghost text-rose-600" onClick={() => put('appearance', { logoUrl: '' })}>{t('admin.useDefaultLogo')}</button>}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {colour('primaryColor', '#305a4e', t('admin.primaryColor'))}
          {colour('secondaryColor', '#d0af6c', t('admin.secondaryColor'))}
        </div>
        <div className="rounded-2xl border border-slate-200 p-4" aria-label={t('admin.preview')}>
          <p className="mb-3 text-xs font-semibold text-slate-500">{t('admin.preview')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ background: a.primaryColor || '#305a4e' }}>{t('nav.products')}</span>
            <span className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink" style={{ background: a.secondaryColor || '#d0af6c' }}>{t('nav.post')}</span>
            <span className="font-bold" style={{ color: a.primaryColor || '#305a4e' }}>{a.siteName || t('brand.name')}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{t('admin.colorsApplyHint')}</p>
        </div>
        {fieldErr(errors.appearance) && <p className="text-xs text-rose-600">{fieldErr(errors.appearance)}</p>}
      </Section>

      <Section title={t('admin.maintenance')} hint={t('admin.maintenanceHint')} onSave={() => save('maintenance', { maintenance: s.maintenance })} busy={busy === 'maintenance'} error={errors.maintenance}>
        <Toggle checked={s.maintenance.enabled} onChange={(v) => put('maintenance', { enabled: v })} label={t('admin.maintenanceOn')} hint={t('admin.maintenanceOnHint')} />
        {LANGS.map((l) => (
          <Field key={l.code} label={`${t('admin.maintenanceMessage')} (${l.label})`} optional={l.code !== 'ar'}>
            <textarea className="input" rows={2} dir={l.dir} maxLength={500} placeholder={t('maintenance.text')} value={s.maintenance.message?.[l.code] || ''}
              onChange={(e) => put('maintenance', { message: { ...s.maintenance.message, [l.code]: e.target.value } })} />
          </Field>
        ))}
      </Section>
    </div>
  );
}

/** Alert bar on top of every page: on/off, text, colour, still or scrolling, link. */
export function AdminAlerts() {
  const { t } = useI18n();
  const { s, setS, set, put, loading, error } = useSettingsDraft();
  const { save, busy, errors } = useSaveSettings();
  if (loading || !s) return error ? <ErrorBox error={error} /> : <Spinner />;
  const setTxt = (lang, value) => setS({ ...s, texts: { ...s.texts, [lang]: { ...s.texts[lang], 'announcement.text': value } } });
  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle icon="bell" title={t('admin.alerts')} subtitle={t('admin.set.announcementHint')} />
      <Section title={t('admin.set.announcement')} busy={busy === 'announcement'} error={errors.announcement}
        onSave={() => save('announcement', { announcement: s.announcement, texts: s.texts })}>
        <Toggle checked={s.announcement.enabled} onChange={(v) => put('announcement', { enabled: v })} label={t('admin.set.showAnnouncement')} />
        {LANGS.map((l) => (
          <Field key={l.code} label={`${t('admin.set.announcementText')} (${l.label})`} optional={l.code !== 'ar'}>
            <input className="input" dir={l.dir} maxLength={300} value={s.texts[l.code]?.['announcement.text'] || ''} onChange={(e) => setTxt(l.code, e.target.value)} />
          </Field>
        ))}
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t('admin.set.tone')}>
            <select className="input" value={s.announcement.tone} onChange={set('announcement', 'tone')}>
              {['gold', 'brand', 'rose'].map((v) => <option key={v} value={v}>{t(`admin.set.tones.${v}`)}</option>)}
            </select>
          </Field>
          <Field label={t('admin.alertStyle')}>
            <select className="input" value={s.announcement.style} onChange={set('announcement', 'style')}>
              <option value="static">{t('admin.alertStatic')}</option>
              <option value="marquee">{t('admin.alertMarquee')}</option>
            </select>
          </Field>
          <Field label={t('admin.set.link')} hint={t('admin.set.linkHint')} optional error={fieldErr(errors.announcement)}>
            <input className="input" dir="ltr" placeholder="/products?deals=1" value={s.announcement.link} onChange={set('announcement', 'link')} />
          </Field>
        </div>
      </Section>
    </div>
  );
}

/** Payments, VIP prices, payment numbers, support WhatsApp and social links. */
export function AdminPayments() {
  const { t, price } = useI18n();
  const { reloadMeta } = useApp();
  const { s, set, put, loading, error } = useSettingsDraft();
  const { save, busy, errors } = useSaveSettings();
  if (loading || !s) return error ? <ErrorBox error={error} /> : <Spinner />;
  const plans = s.pricing.featurePlans;
  const setPlan = (i, key, v) => put('pricing', { featurePlans: plans.map((p, j) => (j === i ? { ...p, [key]: Math.max(0, parseInt(v, 10) || 0) } : p)) });
  const saveAndRefresh = async (key, body) => { if (await save(key, body)) reloadMeta(); };
  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle icon="star" title={t('admin.payments')} subtitle={t('admin.paymentsHint')} />

      <Section title={t('admin.pricing')} hint={t('admin.pricingHint')} busy={busy === 'pricing'} error={errors.pricing}
        onSave={() => saveAndRefresh('pricing', { pricing: s.pricing, features: s.features })}>
        <Toggle checked={s.features.paidUpgrades} onChange={(v) => put('features', { paidUpgrades: v })} label={t('admin.paidOn')} hint={t('admin.paidOnHint')} />
        <Field label={t('admin.verifyPrice')}>
          <input className="input w-40" type="number" min="0" dir="ltr" value={s.pricing.verifyPrice} onChange={(e) => put('pricing', { verifyPrice: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
        </Field>
        <fieldset>
          <legend className="label">{t('admin.vipPlans')}</legend>
          <ul className="space-y-2">
            {plans.map((p, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2.5">
                <label className="flex items-center gap-1.5 text-sm">{t('upgrades.plan')}
                  <input className="input w-20 py-2" type="number" min="1" max="365" dir="ltr" value={p.days} onChange={(e) => setPlan(i, 'days', e.target.value)} />{t('admin.daysUnit')}
                </label>
                <label className="flex items-center gap-1.5 text-sm">{t('upgrades.price')}
                  <input className="input w-28 py-2" type="number" min="0" dir="ltr" value={p.price} onChange={(e) => setPlan(i, 'price', e.target.value)} />MRU
                </label>
                <span className="text-xs text-slate-400 ltr-nums">{price(p.price)} / {t('upgrades.planDays', { days: p.days })}</span>
                <button type="button" className="btn-ghost ms-auto p-1.5 text-rose-600" disabled={plans.length <= 1} onClick={() => put('pricing', { featurePlans: plans.filter((_, j) => j !== i) })} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-outline mt-2" disabled={plans.length >= 6} onClick={() => put('pricing', { featurePlans: [...plans, { days: 7, price: 200 }] })}><Icon name="plus" className="h-4 w-4" />{t('admin.addPlan')}</button>
        </fieldset>
        {fieldErr(errors.pricing) && <p className="text-xs text-rose-600">{fieldErr(errors.pricing)}</p>}
      </Section>

      <Section title={t('admin.set.payment')} hint={t('admin.set.paymentHint')} onSave={() => save('payment', { payment: s.payment })} busy={busy === 'payment'} error={errors.payment}>
        <div className="grid gap-3 sm:grid-cols-2">
          {['bankily', 'masrvi', 'sedad'].map((k) => (
            <Field key={k} label={t(`upgrades.methods.${k}`)} optional><input className="input" dir="ltr" value={s.payment[k]} onChange={set('payment', k)} /></Field>
          ))}
          <Field label={t('admin.set.accountName')} optional><input className="input" value={s.payment.accountName} onChange={set('payment', 'accountName')} /></Field>
        </div>
      </Section>

      <Section title={t('admin.set.contact')} hint={t('admin.contactHint2')} onSave={() => save('contact', { contact: s.contact })} busy={busy === 'contact'} error={errors.contact}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('admin.supportWhatsapp')} optional><input className="input" dir="ltr" placeholder="+222 ..." value={s.contact.whatsapp} onChange={set('contact', 'whatsapp')} /></Field>
          <Field label={t('auth.email')} optional><input className="input" type="email" dir="ltr" value={s.contact.email} onChange={set('contact', 'email')} /></Field>
          <Field label={t('auth.phone')} optional><input className="input" dir="ltr" value={s.contact.phone} onChange={set('contact', 'phone')} /></Field>
          <Field label={t('admin.set.address')} optional><input className="input" value={s.contact.address} onChange={set('contact', 'address')} /></Field>
        </div>
        {fieldErr(errors.contact) && <p className="text-xs text-rose-600">{fieldErr(errors.contact)}</p>}
      </Section>

      <Section title={t('admin.set.social')} hint={t('admin.set.socialHint')} onSave={() => save('social', { social: s.social })} busy={busy === 'social'} error={errors.social}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['x', 'X (Twitter)'], ['youtube', 'YouTube']].map(([k, label]) => (
            <Field key={k} label={label} optional><input className="input" dir="ltr" placeholder="https://" value={s.social[k]} onChange={set('social', k)} /></Field>
          ))}
        </div>
        {fieldErr(errors.social) && <p className="text-xs text-rose-600">{fieldErr(errors.social)}</p>}
      </Section>
    </div>
  );
}

// ---------- Delivery prices ----------

/** Same formula as the server (backend/src/lib/delivery.js). */
const feeFor = (d, km, interCity) => Math.ceil((Math.max(d.minFee, d.baseFee + d.perKm * km) + (interCity ? d.interCityFee : 0)) / 10) * 10;

export function AdminDeliveryPricing() {
  const { t, price } = useI18n();
  const { s, put, loading, error } = useSettingsDraft();
  const { save, busy, errors } = useSaveSettings();
  if (loading || !s) return error ? <ErrorBox error={error} /> : <Spinner />;
  const d = s.delivery;
  const num = (key) => (e) => put('delivery', { [key]: Math.max(0, parseInt(e.target.value, 10) || 0) });
  const fields = [['baseFee', 'MRU'], ['perKm', 'MRU / km'], ['minFee', 'MRU'], ['interCityFee', 'MRU'], ['maxKm', 'km']];
  const examples = [[2, false], [5, false], [12, false], [450, true]];
  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle icon="globe" title={t('delivery.admin.pricing')} subtitle={t('delivery.admin.pricingHint')} />
      <Section title={t('delivery.admin.pricing')} busy={busy === 'delivery'} error={errors.delivery} onSave={() => save('delivery', { delivery: d })}>
        <Toggle checked={d.enabled} onChange={(v) => put('delivery', { enabled: v })} label={t('delivery.admin.enabled')} hint={t('delivery.admin.enabledHint')} />
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(([k, unit]) => (
            <Field key={k} label={t(`delivery.admin.f.${k}`)} hint={t(`delivery.admin.f.${k}Hint`)}>
              <div className="flex items-center gap-2"><input className="input" type="number" min={k === 'maxKm' ? 1 : 0} dir="ltr" value={d[k]} onChange={num(k)} /><span className="shrink-0 text-xs text-slate-500">{unit}</span></div>
            </Field>
          ))}
        </div>
        <div className="rounded-xl bg-brand-50 p-4">
          <p className="mb-2 text-sm font-bold text-brand-900 dark-brand-text">{t('delivery.admin.examples')}</p>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {examples.map(([km, inter]) => (
              <li key={km} className="flex justify-between gap-2 rounded-lg bg-surface px-3 py-1.5">
                <span>{t('delivery.cost.distance', { km: String(km) })}{inter ? ` · ${t('delivery.cost.interCity')}` : ''}</span>
                <strong className="ltr-nums">{km > d.maxKm ? '—' : price(feeFor(d, km, inter))}</strong>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-slate-500">{t('delivery.admin.formula')}</p>
        </div>
      </Section>
    </div>
  );
}

// ---------- Site texts (override any text, in every language) ----------

const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => (
  v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, String(v)]]
));

// Public-facing groups first, in the order a visitor meets them.
const GROUP_ORDER = ['brand', 'announcement', 'hero', 'home', 'nav', 'footer', 'about', 'help', 'products', 'product', 'auth', 'dashboard', 'form', 'store', 'seller', 'roles', 'card', 'notifications', 'errors', 'common'];

export function AdminTexts() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { save, busy, errors } = useSaveSettings();
  const [lang, setLang] = useState('ar');
  const [group, setGroup] = useState('brand');
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState(() => structuredClone(settings.texts));
  useEffect(() => { setDraft(structuredClone(settings.texts)); }, [settings.texts]);

  const all = useMemo(() => flatten(messages[lang]), [lang]);
  const groups = useMemo(() => {
    const names = [...new Set(all.map(([k]) => k.split('.')[0]))];
    return [...GROUP_ORDER.filter((g) => names.includes(g)), ...names.filter((g) => !GROUP_ORDER.includes(g)).sort()];
  }, [all]);
  const needle = q.trim().toLowerCase();
  const rows = all.filter(([k, v]) => (needle ? k.toLowerCase().includes(needle) || v.toLowerCase().includes(needle) || (draft[lang]?.[k] || '').toLowerCase().includes(needle) : k.split('.')[0] === group));
  const changed = JSON.stringify(draft) !== JSON.stringify(settings.texts);
  const customCount = Object.values(draft[lang] || {}).filter(Boolean).length;
  const setText = (key, value) => setDraft((d) => {
    const next = { ...d, [lang]: { ...d[lang] } };
    if (value) next[lang][key] = value; else delete next[lang][key];
    return next;
  });
  const groupLabel = (g) => { const l = t(`admin.textGroups.${g}`); return l.startsWith('admin.') ? g : l; };

  return (
    <div className="max-w-4xl">
      <PageTitle icon="edit" title={t('admin.siteTexts')} subtitle={t('admin.siteTextsHint')}>
        <button className="btn-primary" disabled={!changed || Boolean(busy)} onClick={() => save('texts', { texts: draft })}>
          {busy ? t('common.loading') : t('admin.saveTexts')}
        </button>
      </PageTitle>
      <ErrorBox error={errors.texts} />
      <div className="card sticky top-16 z-10 mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {LANGS.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${lang === l.code ? 'bg-ink text-white' : 'text-slate-600'}`}>{l.label}</button>
          ))}
        </div>
        <select className="input w-auto py-2 text-sm" value={group} onChange={(e) => { setGroup(e.target.value); setQ(''); }} aria-label={t('admin.textGroup')} disabled={Boolean(needle)}>
          {groups.map((g) => <option key={g} value={g}>{groupLabel(g)}</option>)}
        </select>
        <input className="input min-w-[12rem] flex-1 py-2 text-sm" type="search" placeholder={t('admin.searchTexts')} value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="text-xs text-slate-500">{t('admin.customTexts', { n: customCount })}</span>
      </div>
      {!rows.length ? <EmptyState icon="search" title={t('common.empty')} /> : (
        <ul className="space-y-2">
          {rows.map(([key, def]) => {
            const value = draft[lang]?.[key] || '';
            const vars = def.match(/\{\w+\}/g) || [];
            const missing = value && vars.filter((v) => !value.includes(v));
            const long = def.length > 70 || value.length > 70;
            return (
              <li key={key} className={`card p-3 ${value ? 'border-brand-300 bg-brand-50/40' : ''}`}>
                <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500" dir="ltr">{key}</code>
                  {value && <span className="badge bg-brand-100 text-brand-800">{t('admin.customised')}</span>}
                  {value && <button type="button" className="link" onClick={() => setText(key, '')}>{t('admin.resetText')}</button>}
                </div>
                <p className="mb-1.5 text-xs text-slate-500" dir={LANGS.find((l) => l.code === lang).dir}>{t('admin.defaultText')}: {def || '—'}</p>
                {long ? (
                  <textarea className="input text-sm" rows={2} dir={LANGS.find((l) => l.code === lang).dir} placeholder={def} value={value} maxLength={2000} onChange={(e) => setText(key, e.target.value)} />
                ) : (
                  <input className="input text-sm" dir={LANGS.find((l) => l.code === lang).dir} placeholder={def} value={value} maxLength={2000} onChange={(e) => setText(key, e.target.value)} />
                )}
                {missing?.length > 0 && <p className="mt-1 text-xs text-amber-700">{t('admin.keepVars', { vars: missing.join(' ') })}</p>}
              </li>
            );
          })}
        </ul>
      )}
      {changed && (
        <div className="sticky bottom-4 mt-4 flex justify-center">
          <button className="btn-primary shadow-lg" disabled={Boolean(busy)} onClick={() => save('texts', { texts: draft })}>{t('admin.saveTexts')}</button>
        </div>
      )}
    </div>
  );
}

// ---------- The admin's own account ----------

export function AdminAccount() {
  const { t } = useI18n();
  const { user, refreshUser, notify } = useApp();
  const [form, setForm] = useState({ name: user.name, email: user.email || '', currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = useFieldError(error);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirm) { setError({ code: 'validation_error', fields: { confirm: 'mismatch' } }); return; }
    setBusy(true);
    setError(null);
    try {
      const { passwordChanged } = await api('/admin/account', { method: 'PUT', body: { name: form.name, email: form.email, currentPassword: form.currentPassword, newPassword: form.newPassword } });
      await refreshUser();
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirm: '' }));
      notify(passwordChanged ? t('admin.accountSavedPassword') : t('common.saved'));
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-xl">
      <PageTitle icon="shield" title={t('admin.adminAccount')} subtitle={t('admin.adminAccountHint')} />
      <form onSubmit={submit} className="card space-y-4 p-5" noValidate>
        <ErrorBox error={error && !error.fields ? error : null} />
        <Field label={t('auth.name')} error={fieldError('name')}><input className="input" required value={form.name} onChange={set('name')} /></Field>
        <Field label={t('admin.loginEmail')} error={fieldError('email')} hint={t('admin.loginEmailHint')}>
          <input className="input" type="email" autoComplete="username" dir="ltr" required value={form.email} onChange={set('email')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('admin.newPassword')} error={fieldError('newPassword')} hint={t('admin.newPasswordHint')} optional>
            <input className="input" type="password" autoComplete="new-password" dir="ltr" value={form.newPassword} onChange={set('newPassword')} />
          </Field>
          <Field label={t('auth.confirmPassword')} error={fieldError('confirm')} optional>
            <input className="input" type="password" autoComplete="new-password" dir="ltr" value={form.confirm} onChange={set('confirm')} />
          </Field>
        </div>
        <Field label={t('admin.currentPassword')} error={fieldError('currentPassword')} hint={t('admin.currentPasswordHint')}>
          <input className="input" type="password" autoComplete="current-password" dir="ltr" required value={form.currentPassword} onChange={set('currentPassword')} />
        </Field>
        <button className="btn-primary w-full" disabled={busy || !form.currentPassword}>{busy ? t('common.loading') : t('common.saveChanges')}</button>
      </form>
    </div>
  );
}

// ---------- Reviews ----------

export function AdminReviews() {
  const { t, date } = useI18n();
  const { notify } = useApp();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(`/admin/reviews?page=${page}`);
  const remove = async (r) => {
    if (!window.confirm(t('admin.deleteReviewConfirm'))) return;
    await api(`/admin/reviews/${r.id}`, { method: 'DELETE' });
    notify(t('common.changesSaved'));
    reload();
  };
  return (
    <div className="max-w-4xl">
      <PageTitle icon="star" title={t('admin.reviews')} subtitle={t('admin.reviewsHint')} />
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="star" title={t('common.empty')} /> : (
        <ul className="space-y-3">
          {data.items.map((r) => (
            <li key={r.id} className="card flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2"><Stars value={r.rating} /><span className="text-xs text-slate-400">{date(r.created_at)}</span></div>
                {r.comment && <p className="text-sm text-slate-700">«{r.comment}»</p>}
                <p className="text-xs text-slate-500">
                  <Link className="link" to={`/users/${r.reviewer_id}`}>{r.reviewer_name}</Link> → <Link className="link" to={`/users/${r.seller_id}`}>{r.seller_name}</Link> · <Link className="link" to={`/products/${r.product_id}`}>{r.product_title}</Link>
                </p>
              </div>
              <button className="btn-ghost p-2 text-rose-600" onClick={() => remove(r)} aria-label={t('common.delete')}><Icon name="trash" className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
    </div>
  );
}

// ---------- Files (uploaded images) ----------

const formatSize = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export function AdminFiles() {
  const { t, date, number } = useI18n();
  const { notify } = useApp();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const { data, loading, error, reload } = useApi(`/admin/files?page=${page}&filter=${filter}`);
  const remove = async (f) => {
    if (!window.confirm(f.used_by ? t('admin.deleteUsedFileConfirm', { label: f.used_by.label }) : t('admin.deleteFileConfirm'))) return;
    await api(`/admin/files/${f.id}`, { method: 'DELETE' });
    setViewing(null);
    notify(t('common.changesSaved'));
    reload();
  };
  const fileRef = useRef(null);
  const { upload, busy: uploading } = useImageUpload();
  const uploadFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    for (const f of list) await upload(f);
    if (list.length) { notify(t('common.changesSaved')); setFilter(''); setPage(1); reload(); }
  };
  const usageLink = (u) => (u.kind === 'listing' ? `/products/${u.id}` : u.kind === 'store' ? `/stores/${u.slug}` : `/users/${u.id}`);

  return (
    <div>
      <PageTitle icon="image" title={t('admin.files')} subtitle={t('admin.filesHint')}>
        <div className="flex flex-wrap items-center gap-2">
          {data?.totals && <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">{t('admin.filesTotal', { n: number(data.totals.n), size: formatSize(Number(data.totals.bytes)) })}</p>}
          <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={uploadFiles} tabIndex={-1} />
          <button type="button" className="btn-primary" disabled={uploading} onClick={() => fileRef.current?.click()}><Icon name="image" className="h-4 w-4" />{uploading ? t('common.loading') : t('admin.uploadImages')}</button>
        </div>
      </PageTitle>
      <div className="mb-4 flex gap-1 rounded-xl bg-surface p-1 ring-1 ring-slate-200 sm:inline-flex">
        {[['', t('common.all')], ['unused', t('admin.unusedFiles')]].map(([v, label]) => (
          <button key={v} type="button" onClick={() => { setFilter(v); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === v ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>
        ))}
      </div>
      <ErrorBox error={error} />
      {loading ? <Spinner /> : !data?.items?.length ? <EmptyState icon="image" title={t('common.empty')} /> : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {data.items.map((f) => (
            <li key={f.id} className="card overflow-hidden">
              <button type="button" className="block aspect-square w-full bg-slate-100" onClick={() => setViewing(f)} aria-label={t('admin.viewFile')}>
                <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
              <div className="space-y-1 p-2 text-[11px]">
                <p className="flex justify-between gap-2 text-slate-500"><span className="ltr-nums">{formatSize(Number(f.size))}</span><span>{date(f.created_at)}</span></p>
                {f.used_by ? (
                  <Link to={usageLink(f.used_by)} className="block truncate font-semibold text-brand-700 hover:underline">{t(`admin.usedBy.${f.used_by.kind}`)}: {f.used_by.label}</Link>
                ) : <p className="font-semibold text-amber-700">{t('admin.unused')}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} total={data.total} limit={data.limit} onPage={setPage} />}
      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={t('admin.viewFile')} size="lg">
        {viewing && (
          <div className="space-y-3">
            <img src={viewing.url} alt="" className="mx-auto max-h-[60vh] rounded-xl object-contain" />
            <p className="text-center text-xs text-slate-500" dir="ltr">{viewing.url} · {viewing.mime} · {formatSize(Number(viewing.size))}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href={viewing.url} target="_blank" rel="noreferrer" className="btn-outline">{t('admin.openOriginal')}</a>
              <button type="button" className="btn-outline" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${viewing.url}`).then(() => notify(t('common.copied')), () => {})}><Icon name="link" className="h-4 w-4" />{t('admin.copyLink')}</button>
              <button type="button" className="btn-danger" onClick={() => remove(viewing)}><Icon name="trash" className="h-4 w-4" />{t('common.delete')}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------- Site map: every page, section and outside dashboard ----------

const REPO_URL = 'https://github.com/souvisaad7-design/Mourimarket';

export function AdminSitemap() {
  const { t, tl, lang } = useI18n();
  const { categories } = useApp();
  const stores = useApi('/stores');
  const pagesList = useApi('/pages');
  const groups = [
    ['sitemap.public', [
      ['/', t('nav.home')], ['/products', t('nav.products')], ['/categories', t('nav.categories')], ['/products?deals=1', t('nav.offers')],
      ['/products?featured=1', t('home.featured')], ['/stores', t('nav.stores')], ['/about', t('nav.about')], ['/about#contact', t('nav.contact')],
      ['/help', t('nav.help')], ['/safety', t('footer.safety')],
    ]],
    ['sitemap.account', [
      ['/login', t('nav.login')], ['/register', t('nav.register')], ['/forgot-password', t('auth.forgot')], ['/dashboard', t('nav.dashboard')],
      ['/sell', t('nav.post')], ['/profile', t('nav.profile')], ['/dashboard/store', t('nav.myStore')], ['/favorites', t('nav.favorites')],
      ['/messages', t('nav.messages')], ['/notifications', t('nav.notifications')],
    ]],
    ['sitemap.admin', [
      ['/admin', t('admin.overview')], ['/admin/listings', t('admin.listings')], ['/admin/merchants', t('admin.merchantsTab')], ['/admin/reports', t('admin.reports')],
      ['/admin/users', t('admin.users')], ['/admin/stores', t('admin.stores')], ['/admin/categories', t('admin.categories')], ['/admin/reviews', t('admin.reviews')],
      ['/admin/files', t('admin.files')], ['/admin/settings', t('admin.siteSettings')], ['/admin/texts', t('admin.siteTexts')],
      ['/admin/appearance', t('admin.appearance')], ['/admin/alerts', t('admin.alerts')], ['/admin/payments', t('admin.payments')], ['/admin/cities', t('admin.cities')],
      ['/admin/banner', t('admin.banner')], ['/admin/menus', t('admin.menus')], ['/admin/pages', t('admin.customPages')],
      ['/admin/listings/new', t('admin.addListing')], ['/admin/users?new=1', t('admin.addUser')], ['/admin/account', t('admin.adminAccount')],
      ['/admin/login', t('admin.loginTitle')],
    ]],
    ['customPages', (pagesList.data?.items || []).map((p) => [`/p/${p.slug}`, pickLang(p.title, lang)])],
    ['sitemap.categories', categories.map((c) => [`/products?category=${c.slug}`, tl(c)])],
    ['sitemap.stores', (stores.data?.items || []).map((s) => [`/stores/${s.slug}`, s.name])],
  ];
  const outside = [
    [REPO_URL, t('admin.sitemap.repo'), t('admin.sitemap.repoHint')],
    ['https://vercel.com/dashboard', 'Vercel', t('admin.sitemap.vercelHint')],
    ['https://supabase.com/dashboard/project/ifgpposdzpvokmghltug', 'Supabase', t('admin.sitemap.supabaseHint')],
  ];
  return (
    <div className="max-w-5xl">
      <PageTitle icon="link" title={t('admin.sitemap.title')} subtitle={t('admin.sitemap.hint')} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.filter(([, links]) => links.length).map(([key, links]) => (
          <section key={key} className="card p-4">
            <h2 className="mb-2 font-bold">{t(`admin.${key}`)} <span className="text-xs font-normal text-slate-400">({links.length})</span></h2>
            <ul className="space-y-1 text-sm">
              {links.map(([to, label]) => (
                <li key={to} className="flex items-center justify-between gap-2">
                  <Link to={to} className="truncate text-slate-700 hover:text-brand-700 hover:underline">{label}</Link>
                  <code className="shrink-0 text-[10px] text-slate-400" dir="ltr">{to.length > 28 ? `${to.slice(0, 26)}…` : to}</code>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section className="card p-4 md:col-span-2 xl:col-span-3">
          <h2 className="mb-2 font-bold">{t('admin.sitemap.outside')}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {outside.map(([href, label, hint]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noreferrer" className="block rounded-xl border border-slate-200 p-3 hover:border-brand-400">
                  <span className="flex items-center gap-1.5 font-semibold text-brand-800"><Icon name="link" className="h-4 w-4" />{label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{hint}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
