import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Same shape as the server defaults (backend/src/lib/settings.js), used until /api/settings loads.
export const DEFAULT_SETTINGS = {
  contact: { email: '', whatsapp: '', phone: '', address: '' },
  social: { facebook: '', instagram: '', tiktok: '', x: '', youtube: '' },
  announcement: { enabled: false, tone: 'gold', link: '' },
  features: { registration: true, autoApprove: false },
  payment: { bankily: '', masrvi: '', sedad: '', accountName: 'MauriMarket' },
  texts: { ar: {}, fr: {}, en: {} },
};

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, reload: () => {}, setSettings: () => {} });

/** Site settings the admin edits (texts, contact details, switches), loaded once and shared. */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const reload = useCallback(() => fetch('/api/settings')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d?.settings) setSettings(d.settings); })
    .catch(() => {}), []);
  useEffect(() => { reload(); }, [reload]);
  const value = useMemo(() => ({ settings, reload, setSettings }), [settings, reload]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
