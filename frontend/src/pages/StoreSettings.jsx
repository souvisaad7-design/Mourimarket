import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CitySelect, EmptyState, ErrorBox, Field, Icon, PageHeader, Spinner, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { compressImage } from '../lib/image.js';
import { useDocumentTitle } from '../lib/hooks.js';

export default function StoreSettings() {
  const { t } = useI18n();
  const { user, meta, notify, refreshUser } = useApp();
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', phone: user.phone || '', whatsapp: user.phone || '', email: user.email, city: user.city || '' });
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = useFieldError(error);
  useDocumentTitle(t('store.settings'));

  useEffect(() => {
    api('/stores/me').then(({ store: s }) => {
      if (s) {
        setStore(s);
        setForm({ name: s.name, description: s.description || '', phone: s.phone || '', whatsapp: s.whatsapp || '', email: s.email || '', city: s.city || '' });
      }
    }).finally(() => setLoading(false));
  }, []);

  if (user.account_type !== 'merchant') {
    return (
      <div className="container-page max-w-2xl py-10">
        <EmptyState icon="store" title={t('store.merchantOnly')}><Link to="/profile" className="btn-primary">{t('nav.profile')}</Link></EmptyState>
      </div>
    );
  }
  if (loading) return <Spinner />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append('logo', (await compressImage(logo, { maxWidth: 512 })).file);
      const { store: s } = await api('/stores/me', { method: 'PUT', body: fd });
      setStore(s);
      setLogo(null);
      refreshUser();
      notify(t('common.saved'));
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const logoUrl = logo ? URL.createObjectURL(logo) : store?.logo_url;

  return (
    <div className="container-page max-w-3xl py-8">
      <PageHeader title={t('store.settings')}>
        {store && <Link to={`/stores/${store.slug}`} className="btn-outline"><Icon name="store" className="h-4 w-4" />{t('store.view')}</Link>}
      </PageHeader>
      {store && !store.is_active && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{t('notifications.types.store_disabled', { name: store.name })}</div>}
      <form onSubmit={submit} className="card space-y-4 p-5">
        <ErrorBox error={error} />
        <div className="flex items-center gap-4">
          {logoUrl ? <img src={logoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover" /> : (
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-brand-800"><Icon name="store" className="h-8 w-8" /></span>
          )}
          <label className="btn-outline cursor-pointer">
            {t('store.logo')}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setLogo(e.target.files[0] || null)} />
          </label>
        </div>
        <Field label={t('store.name')} error={fieldError('name')}><input className="input" value={form.name} onChange={set('name')} required /></Field>
        <Field label={t('store.description')} optional><textarea className="input" rows={4} maxLength={2000} value={form.description} onChange={set('description')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('store.phone')} optional><input className="input" type="tel" value={form.phone} onChange={set('phone')} dir="ltr" /></Field>
          <Field label={t('store.whatsapp')} optional><input className="input" type="tel" value={form.whatsapp} onChange={set('whatsapp')} dir="ltr" /></Field>
          <Field label={t('store.email')} error={fieldError('email')} optional><input className="input" type="email" value={form.email} onChange={set('email')} dir="ltr" /></Field>
          <Field label={t('store.city')} optional><CitySelect value={form.city} onChange={(v) => setForm({ ...form, city: v })} cities={meta.cities} placeholder="—" /></Field>
        </div>
        <button className="btn-primary" disabled={busy}>{store ? t('common.save') : t('store.create')}</button>
      </form>
    </div>
  );
}
