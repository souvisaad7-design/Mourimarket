import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { Icon, Logo } from './ui.jsx';

// ---------------------------------------------------------------------------
// Theme: "auto" follows the device; "light"/"dark" force a theme.
// ---------------------------------------------------------------------------
const THEMES = ['auto', 'light', 'dark'];

function readTheme() {
  try { return THEMES.includes(localStorage.getItem('mm_theme')) ? localStorage.getItem('mm_theme') : 'auto'; } catch { return 'auto'; }
}

export function applyTheme(theme = readTheme()) {
  const root = document.documentElement;
  if (theme === 'auto') delete root.dataset.theme;
  else root.dataset.theme = theme;
  const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#0b1220' : '#0f766e'));
}

export function ThemeToggle({ withLabel = false }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem('mm_theme', theme); } catch { /* ignore */ }
    if (theme !== 'auto') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('auto');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  const icon = theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : 'auto';
  return (
    <button type="button" onClick={() => setTheme(next)} className="btn-ghost gap-1.5 p-2"
      title={`${t('theme.label')}: ${t(`theme.${theme}`)}`} aria-label={`${t('theme.label')}: ${t(`theme.${theme}`)}`}>
      <Icon name={icon} className="h-5 w-5" />
      {withLabel && <span className="text-sm">{t('theme.label')}: {t(`theme.${theme}`)}</span>}
    </button>
  );
}

// ---------------------------------------------------------------------------
// "Install the app" prompt (Android/desktop: native prompt; iOS: instructions).
// ---------------------------------------------------------------------------
const DISMISS_KEY = 'mm_install_dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function InstallPrompt() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(() => {
    try { return Number(localStorage.getItem(DISMISS_KEY) || 0) > Date.now(); } catch { return false; }
  });

  useEffect(() => {
    if (isStandalone()) return undefined;
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
    // Ask iOS visitors only after they've looked around a little.
    const timer = isIos ? setTimeout(() => setIos(true), 15000) : null;
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); clearTimeout(timer); };
  }, []);

  if (hidden || (!deferred && !ios)) return null;

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + 14 * 24 * 3600 * 1000)); } catch { /* ignore */ }
  };
  const install = async () => {
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    dismiss();
  };

  return (
    <div className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-md animate-fade-in sm:bottom-6" role="dialog" aria-label={t('pwa.install')}>
      <div className="card flex items-start gap-3 p-4 shadow-xl">
        <div className="pointer-events-none shrink-0 [&_span]:hidden"><Logo /></div>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{t('pwa.install')}</p>
          <p className="mt-0.5 text-sm text-slate-600">{deferred ? t('pwa.installText') : t('pwa.iosHint')}</p>
          <div className="mt-3 flex gap-2">
            {deferred && <button type="button" onClick={install} className="btn-primary px-3 py-2 text-xs"><Icon name="download" className="h-4 w-4" />{t('pwa.install')}</button>}
            <button type="button" onClick={dismiss} className="btn-ghost px-3 py-2 text-xs">{t('pwa.later')}</button>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="btn-ghost -m-1 p-1" aria-label={t('common.close')}><Icon name="x" className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Offline notice.
// ---------------------------------------------------------------------------
export function OfflineBanner() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="sticky top-16 z-20 bg-ink px-4 py-2 text-center text-sm font-medium text-white" role="status">
      {t('pwa.offline')}
    </div>
  );
}
