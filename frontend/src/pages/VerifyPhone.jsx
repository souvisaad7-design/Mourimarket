// Confirm the account's phone number with the code received by SMS.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CategoryIcon, ErrorBox, Icon, Spinner } from '../components/ui.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { useApi, useDocumentTitle } from '../lib/hooks.js';

export default function VerifyPhone() {
  const { t, lang } = useI18n();
  const { refreshUser, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from || '/';
  const status = useApi('/auth/phone');
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const input = useRef(null);
  useDocumentTitle(t('phone.title'));
  useEffect(() => { if (wait <= 0) return undefined; const id = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(id); }, [wait]);

  const send = async () => {
    setBusy(true); setError(null);
    try {
      const r = await api('/auth/phone/send', { method: 'POST', body: { lang } });
      if (r.verified) { navigate(next, { replace: true }); return; }
      setSent(true); setWait(60); setDevCode(r.devCode || '');
      setTimeout(() => input.current?.focus(), 50);
    } catch (err) { setError(err); } finally { setBusy(false); }
  };
  const verify = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await api('/auth/phone/verify', { method: 'POST', body: { code } });
      await refreshUser();
      notify(t('phone.done'));
      navigate(next, { replace: true });
    } catch (err) { setError(err); } finally { setBusy(false); }
  };

  if (status.loading) return <Spinner />;
  const s = status.data || {};
  return (
    <div className="container-page max-w-md py-10">
      <div className="card space-y-4 p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-3xl" aria-hidden="true"><CategoryIcon icon="📱" /></span>
        <h1 className="text-xl font-bold">{t('phone.title')}</h1>
        {s.verified ? (
          <>
            <p className="text-sm text-emerald-700">✓ {t('phone.already')}</p>
            <Link to={next} className="btn-primary w-full">{t('common.continue')}</Link>
          </>
        ) : !s.required ? (
          <p className="text-sm text-slate-600">{t('phone.notNeeded')}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600">{t('phone.why')}</p>
            <p className="text-lg font-bold ltr-nums" dir="ltr">{s.phone}</p>
            {!s.phone && <Link to="/profile" className="link text-sm">{t('phone.addPhone')}</Link>}
            {sent && (
              <form onSubmit={verify} className="space-y-3">
                <label className="block text-sm font-semibold" htmlFor="otp">{t('phone.enterCode')}</label>
                <input id="otp" ref={input} className="input text-center text-2xl tracking-[0.5em]" dir="ltr" inputMode="numeric" autoComplete="one-time-code"
                  pattern="[0-9]*" maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
                {devCode && <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{t('phone.devCode', { code: devCode })}</p>}
                <button className="btn-primary w-full" disabled={busy || code.length < 4}><Icon name="check" className="h-4 w-4" />{t('phone.confirm')}</button>
              </form>
            )}
            <ErrorBox error={error} />
            <button type="button" className={sent ? 'btn-ghost w-full text-sm' : 'btn-primary w-full'} onClick={send} disabled={busy || wait > 0 || !s.phone}>
              {sent ? (wait > 0 ? t('phone.resendIn', { s: wait }) : t('phone.resend')) : t('phone.send')}
            </button>
            {sent && <p className="text-xs text-slate-500">{t('phone.wrongNumber')} <Link to="/profile" className="link">{t('phone.change')}</Link></p>}
          </>
        )}
      </div>
    </div>
  );
}
