import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CitySelect, ErrorBox, Field, Logo, useFieldError } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useDocumentTitle } from '../lib/hooks.js';

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="container-page flex justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  );
}

export function Login() {
  const { t } = useI18n();
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(t('nav.login'));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: form });
      login(token, user);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <AuthCard title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}
      footer={<>{t('auth.noAccount')} <Link to="/register" className="link">{t('nav.register')}</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ErrorBox error={error} />
        <Field label={t('auth.email')}>
          <input className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} dir="ltr" />
        </Field>
        <Field label={t('auth.password')}>
          <input className="input" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} dir="ltr" />
        </Field>
        <div className="text-end"><Link to="/forgot-password" className="link text-sm">{t('auth.forgot')}</Link></div>
        <button className="btn-primary w-full" disabled={busy}>{t('nav.login')}</button>
      </form>
    </AuthCard>
  );
}

export function Register() {
  const { t } = useI18n();
  const { login, meta } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', accountType: 'individual', city: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fieldError = useFieldError(error);
  useDocumentTitle(t('nav.register'));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError({ code: 'validation_error', fields: { confirm: 'mismatch' } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { confirm, city, ...rest } = form;
      const { token, user } = await api('/auth/register', { method: 'POST', body: { ...rest, city: city || undefined } });
      login(token, user);
      navigate(user.account_type === 'merchant' ? '/dashboard/store' : '/dashboard', { replace: true });
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  return (
    <AuthCard title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}
      footer={<>{t('auth.haveAccount')} <Link to="/login" className="link">{t('nav.login')}</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ErrorBox error={error} />
        <fieldset>
          <legend className="label">{t('auth.accountType')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {['individual', 'merchant'].map((type) => (
              <label key={type} className={`cursor-pointer rounded-xl border-2 p-3 text-sm transition ${form.accountType === type ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="accountType" value={type} checked={form.accountType === type} onChange={set('accountType')} className="sr-only" />
                <span className="block font-semibold">{t(`auth.${type}`)}</span>
                <span className="text-xs text-slate-500">{t(`auth.${type}Text`)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label={t('auth.name')} error={fieldError('name')}>
          <input className="input" autoComplete="name" required value={form.name} onChange={set('name')} />
        </Field>
        <Field label={t('auth.email')} error={fieldError('email')}>
          <input className="input" type="email" autoComplete="email" required value={form.email} onChange={set('email')} dir="ltr" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('auth.phone')} error={fieldError('phone')} optional>
            <input className="input" type="tel" autoComplete="tel" placeholder="+222 ..." value={form.phone} onChange={set('phone')} dir="ltr" />
          </Field>
          <Field label={t('form.city')} optional>
            <CitySelect value={form.city} onChange={(v) => setForm({ ...form, city: v })} cities={meta.cities} placeholder="—" />
          </Field>
        </div>
        <Field label={t('auth.password')} error={fieldError('password')} hint={t('fields.min_8')}>
          <input className="input" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set('password')} dir="ltr" />
        </Field>
        <Field label={t('auth.confirmPassword')} error={error?.fields?.confirm && t('auth.passwordMismatch')}>
          <input className="input" type="password" autoComplete="new-password" required value={form.confirm} onChange={set('confirm')} dir="ltr" />
        </Field>
        <p className="text-xs text-slate-500">{t('auth.terms')}</p>
        <button className="btn-primary w-full" disabled={busy}>{t('nav.register')}</button>
      </form>
    </AuthCard>
  );
}

export function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  useDocumentTitle(t('auth.forgotTitle'));
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try { setResult(await api('/auth/forgot-password', { method: 'POST', body: { email } })); } catch (err) { setError(err); }
  };
  return (
    <AuthCard title={t('auth.forgotTitle')} subtitle={t('auth.forgotText')} footer={<Link to="/login" className="link">{t('nav.login')}</Link>}>
      {result ? (
        <div className="space-y-3 text-sm">
          <p className="rounded-xl bg-emerald-50 p-3 text-emerald-800">{t('auth.linkSent')}</p>
          {result.devResetLink && (
            <p className="break-all rounded-xl bg-slate-100 p-3 text-xs">
              {t('auth.devLink')} <a className="link" href={result.devResetLink.replace(/^https?:\/\/[^/]+/, '')}>{result.devResetLink}</a>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <ErrorBox error={error} />
          <Field label={t('auth.email')}>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </Field>
          <button className="btn-primary w-full">{t('auth.sendLink')}</button>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPassword() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const fieldError = useFieldError(error);
  useDocumentTitle(t('auth.resetTitle'));
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token: params.get('token') || '', password } });
      setDone(true);
    } catch (err) { setError(err); }
  };
  return (
    <AuthCard title={t('auth.resetTitle')}>
      {done ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{t('auth.resetDone')}</p>
          <Link to="/login" className="btn-primary w-full">{t('nav.login')}</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <ErrorBox error={error} />
          <Field label={t('auth.newPassword')} error={fieldError('password')} hint={t('fields.min_8')}>
            <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
          </Field>
          <button className="btn-primary w-full">{t('common.save')}</button>
        </form>
      )}
    </AuthCard>
  );
}
