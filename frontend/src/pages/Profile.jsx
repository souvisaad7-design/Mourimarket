import { useState } from 'react';
import { Avatar, CitySelect, ErrorBox, Field, PageHeader, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { compressImage } from '../lib/image.js';
import { useDocumentTitle } from '../lib/hooks.js';

function ProfileForm() {
  const { t } = useI18n();
  const { user, meta, refreshUser, notify } = useApp();
  const [form, setForm] = useState({
    name: user.name, phone: user.phone || '', city: user.city || '', bio: user.bio || '', accountType: user.account_type,
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = useFieldError(error);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatar) fd.append('avatar', (await compressImage(avatar, { maxWidth: 512 })).file);
      await api('/auth/me', { method: 'PUT', body: fd });
      await refreshUser();
      setAvatar(null);
      notify(t('common.saved'));
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h2 className="text-lg font-bold">{t('profile.personal')}</h2>
      <ErrorBox error={error} />
      <div className="flex items-center gap-4">
        <Avatar name={user.name} url={avatar ? URL.createObjectURL(avatar) : user.avatar_url} size="h-16 w-16" />
        <label className="btn-outline cursor-pointer">
          {t('profile.avatar')}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setAvatar(e.target.files[0] || null)} />
        </label>
      </div>
      <Field label={t('auth.name')} error={fieldError('name')}><input className="input" value={form.name} onChange={set('name')} required /></Field>
      <Field label={t('auth.email')}><input className="input bg-slate-50" value={user.email} disabled dir="ltr" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('auth.phone')} error={fieldError('phone')} optional><input className="input" type="tel" value={form.phone} onChange={set('phone')} dir="ltr" /></Field>
        <Field label={t('form.city')} optional><CitySelect value={form.city} onChange={(v) => setForm({ ...form, city: v })} cities={meta.cities} placeholder="—" /></Field>
      </div>
      <Field label={t('profile.bio')} optional><textarea className="input" rows={3} maxLength={500} value={form.bio} onChange={set('bio')} /></Field>
      <Field label={t('auth.accountType')}>
        <select className="input" value={form.accountType} onChange={set('accountType')}>
          <option value="individual">{t('auth.individual')}</option>
          <option value="merchant">{t('auth.merchant')}</option>
        </select>
      </Field>
      <button className="btn-primary" disabled={busy}>{t('common.save')}</button>
    </form>
  );
}

function PasswordForm() {
  const { t } = useI18n();
  const { notify } = useApp();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState(null);
  const fieldError = useFieldError(error);
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api('/auth/me/password', { method: 'PUT', body: form });
      setForm({ currentPassword: '', newPassword: '' });
      notify(t('profile.passwordChanged'));
    } catch (err) { setError(err); }
  };
  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h2 className="text-lg font-bold">{t('profile.changePassword')}</h2>
      <ErrorBox error={error} />
      <Field label={t('profile.currentPassword')}>
        <input className="input" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} dir="ltr" />
      </Field>
      <Field label={t('auth.newPassword')} error={fieldError('newPassword')} hint={t('fields.min_8')}>
        <input className="input" type="password" autoComplete="new-password" required minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} dir="ltr" />
      </Field>
      <button className="btn-outline">{t('profile.changePassword')}</button>
    </form>
  );
}

export default function Profile() {
  const { t } = useI18n();
  useDocumentTitle(t('profile.title'));
  return (
    <div className="container-page max-w-3xl py-8">
      <PageHeader title={t('profile.title')} />
      <div className="space-y-6">
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}
