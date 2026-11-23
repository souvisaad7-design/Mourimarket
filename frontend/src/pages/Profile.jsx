import { useState } from 'react';
import ProfileCard from '../components/ProfileCard.jsx';
import { Avatar, CitySelect, ErrorBox, Field, PageHeader, PhoneInput, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api, setToken } from '../lib/api.js';
import { compressImage } from '../lib/image.js';
import MerchantStatus from '../components/MerchantStatus.jsx';
import { useApi, useDocumentTitle } from '../lib/hooks.js';
import { Link } from 'react-router-dom';

function ProfileForm() {
  const { t } = useI18n();
  const { user, meta, refreshUser, notify } = useApp();
  const [form, setForm] = useState({
    name: user.name, phone: (user.phone || '').replace(/^\+222/, ''), email: user.email || '', city: user.city || '', bio: user.bio || '', accountType: user.merchant_status === 'pending' ? 'merchant' : user.account_type,
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
      const wasPending = user.merchant_status === 'pending';
      const fresh = await refreshUser();
      setAvatar(null);
      notify(!wasPending && fresh?.merchant_status === 'pending' ? t('merchant.requested') : t('common.saved'));
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
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => setAvatar(e.target.files[0] || null)} />
        </label>
      </div>
      <Field label={t('auth.name')} error={fieldError('name')}><input className="input" value={form.name} onChange={set('name')} required /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('auth.phone')} error={fieldError('phone')} hint={t('profile.phoneLogin')}><PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></Field>
        <Field label={t('auth.email')} error={fieldError('email')} optional><input className="input" type="email" value={form.email} onChange={set('email')} dir="ltr" /></Field>
      </div>
      <Field label={t('form.city')} optional><CitySelect value={form.city} onChange={(v) => setForm({ ...form, city: v })} cities={meta.cities} placeholder="—" /></Field>
      <Field label={t('profile.bio')} optional><textarea className="input" rows={3} maxLength={500} value={form.bio} onChange={set('bio')} /></Field>
      <MerchantStatus user={user} />
      <Field label={t('auth.accountType')} hint={form.accountType === 'merchant' && user.account_type !== 'merchant' ? t('merchant.profileHint') : t(`roles.${form.accountType}Text`)}>
        <select className="input" value={form.accountType} onChange={set('accountType')}>
          <option value="buyer">{t('roles.buyer')}</option>
          <option value="individual">{t('roles.individual')}</option>
          <option value="merchant">{t('roles.merchant')}</option>
        </select>
      </Field>
      <button className="btn-primary" disabled={busy}>{t('common.save')}</button>
    </form>
  );
}

function ProfileCardFromContext() {
  const { user } = useApp();
  return <ProfileCard user={user} />;
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
      const { token } = await api('/auth/me/password', { method: 'PUT', body: form });
      if (token) setToken(token); // other devices are signed out, this one stays signed in
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

/** Is my number confirmed? (only shown when the site asks for it) */
function PhoneStatus() {
  const { t } = useI18n();
  const { data } = useApi('/auth/phone');
  if (!data?.required || !data.phone) return null;
  return (
    <div className={`card flex flex-wrap items-center gap-3 p-4 ${data.verified ? '' : 'border-amber-300 bg-amber-50'}`}>
      <span aria-hidden="true" className="text-2xl">📱</span>
      <p className="min-w-0 flex-1 text-sm"><span className="font-bold ltr-nums" dir="ltr">{data.phone}</span> — {data.verified ? <span className="text-emerald-700">{t('phone.badge')} ✓</span> : t('phone.notVerified')}</p>
      {!data.verified && <Link to="/verify-phone" state={{ from: '/profile' }} className="btn-primary">{t('phone.verifyNow')}</Link>}
    </div>
  );
}

export default function Profile() {
  const { t } = useI18n();
  useDocumentTitle(t('profile.title'));
  return (
    <div className="container-page max-w-3xl py-8">
      <PageHeader title={t('profile.title')} />
      <div className="mb-6"><ProfileCardFromContext /></div>
      <div className="space-y-6">
        <PhoneStatus />
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}
