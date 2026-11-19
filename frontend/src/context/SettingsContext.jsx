import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyColors } from '../lib/theme.js';

// Same shape as the server defaults (backend/src/lib/settings.js), used until /api/settings loads.
export const DEFAULT_SETTINGS = {
  appearance: { siteName: '', logoUrl: '', primaryColor: '', secondaryColor: '' },
  maintenance: { enabled: false, message: { ar: '', fr: '', en: '' } },
  pricing: { verifyPrice: 500, featurePlans: [] },
  contact: { email: '', whatsapp: '', phone: '', address: '' },
  social: { facebook: '', instagram: '', tiktok: '', x: '', youtube: '' },
  announcement: { enabled: false, tone: 'gold', style: 'static', link: '' },
  features: { registration: true, autoApprove: false, paidUpgrades: false },
  payment: { bankily: '', masrvi: '', sedad: '', accountName: 'سوق شنقيط' },
  menu: { header: null, footer: null, home: {} },
  texts: { ar: {}, fr: {}, en: {} },
};

let currentSiteName = 'سوق شنقيط';
/** The site name for places outside React (the browser tab title); set by the i18n provider. */
export const getSiteName = () => currentSiteName;
export function setCurrentSiteName(name) {
  if (!name || name === currentSiteName) return;
  if (document.title.includes(currentSiteName)) document.title = document.title.replace(currentSiteName, name);
  currentSiteName = name;
}

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, banners: [], reload: () => {}, setSettings: () => {}, setBanners: () => {} });

/**
 * Site settings the admin edits (texts, identity, colours, banners…), loaded from the
 * database and shared. Reloaded when the visitor comes back to the tab, so changes
 * saved in /admin show up without a manual refresh.
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [banners, setBanners] = useState([]);
  const reload = useCallback(() => fetch('/api/settings', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d?.settings) return;
      setSettings({ ...DEFAULT_SETTINGS, ...d.settings });
      setBanners(d.banners || []);
    })
    .catch(() => {}), []);

  useEffect(() => {
    reload();
    const onVisible = () => { if (document.visibilityState === 'visible') reload(); };
    document.addEventListener('visibilitychange', onVisible);
    const id = setInterval(() => { if (document.visibilityState === 'visible') reload(); }, 120_000);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(id); };
  }, [reload]);

  // Identity: colours, tab icon and name.
  const { primaryColor, secondaryColor, logoUrl } = settings.appearance || {};
  useEffect(() => { applyColors({ primaryColor, secondaryColor }); }, [primaryColor, secondaryColor]);
  useEffect(() => {
    const icon = document.querySelector('link[rel="icon"]');
    if (icon) {
      icon.setAttribute('href', logoUrl || '/favicon.svg');
      if (logoUrl) icon.removeAttribute('type'); else icon.setAttribute('type', 'image/svg+xml');
    }
  }, [logoUrl]);

  const value = useMemo(() => ({ settings, banners, reload, setSettings, setBanners }), [settings, banners, reload]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
