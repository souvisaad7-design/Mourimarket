import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';
import { disablePush, enablePush, needsInstallOnIOS, pushState, pushSupported } from '../lib/push.js';
import { Icon } from './ui.jsx';

function usePushState() {
  const [state, setState] = useState('loading');
  useEffect(() => { pushState().then(setState).catch(() => setState('unsupported')); }, []);
  return [state, setState];
}

/** Settings card: turn phone notifications on or off for this device. */
export function PushToggle({ className = '' }) {
  const { t, lang } = useI18n();
  const { notify } = useApp();
  const [state, setState] = usePushState();
  const [busy, setBusy] = useState(false);
  const ios = pushSupported() ? false : needsInstallOnIOS();
  const turnOn = async () => {
    setBusy(true);
    try { const s = await enablePush(lang); setState(s); if (s === 'on') notify(t('push.enabled')); } catch { notify(t('common.error')); } finally { setBusy(false); }
  };
  const turnOff = async () => { setBusy(true); await disablePush(); setState('off'); setBusy(false); };
  const test = async () => { const { sent } = await api('/push/test', { method: 'POST' }).catch(() => ({ sent: 0 })); notify(sent ? t('push.testSent') : t('common.error')); };
  if (state === 'loading') return null;
  return (
    <section className={`card flex flex-wrap items-center gap-3 p-4 ${className}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800"><Icon name="bell" className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{t('push.title')}</p>
        <p className="text-xs text-slate-500">
          {state === 'on' ? t('push.onText') : state === 'denied' ? t('push.denied') : ios ? t('push.iosHint') : state === 'unsupported' ? t('push.unsupported') : t('push.text')}
        </p>
      </div>
      {state === 'off' && <button className="btn-primary" onClick={turnOn} disabled={busy}>{t('push.enable')}</button>}
      {state === 'on' && (
        <div className="flex gap-2">
          <button className="btn-outline" onClick={test}>{t('push.test')}</button>
          <button className="btn-ghost text-rose-600" onClick={turnOff} disabled={busy}>{t('push.disable')}</button>
        </div>
      )}
    </section>
  );
}

/** A one-time invitation for signed-in users (can be dismissed). */
export function PushBanner() {
  const { t, lang } = useI18n();
  const { user, notify } = useApp();
  const [state, setState] = usePushState();
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem('mm_push_prompt') === 'no'; } catch { return false; } });
  if (!user || hidden || state !== 'off') return null;
  const dismiss = () => { try { localStorage.setItem('mm_push_prompt', 'no'); } catch { /* ignore */ } setHidden(true); };
  const turnOn = async () => {
    try { const s = await enablePush(lang); setState(s); if (s === 'on') notify(t('push.enabled')); else dismiss(); } catch { dismiss(); }
  };
  return (
    <div role="region" aria-label={t('push.title')} className="flex items-center gap-3 rounded-2xl border border-gold-300 bg-gold-300/15 p-3">
      <span aria-hidden="true" className="text-2xl">🔔</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{t('push.bannerTitle')}</p>
        <p className="text-xs text-slate-600">{t('push.bannerText')}</p>
      </div>
      <button className="btn-primary px-3 py-2 text-sm" onClick={turnOn}>{t('push.enable')}</button>
      <button className="btn-ghost p-1.5" onClick={dismiss} aria-label={t('push.later')}><Icon name="x" className="h-4 w-4" /></button>
    </div>
  );
}
