// Feature switches set by the admin (Admin → Control center). A feature that is off is hidden here
// and refused by the API.
import { useSettings } from '../context/SettingsContext.jsx';

/** Is a feature on? Reads the admin's switches (on unless explicitly switched off). */
export function featureOn(settings, key) {
  switch (key) {
    case 'auctions': return settings?.auctions?.enabled !== false;
    case 'social': return settings?.community?.enabled !== false;
    case 'live': return settings?.community?.enabled !== false && settings?.community?.liveEnabled !== false;
    case 'delivery': return settings?.delivery?.enabled !== false;
    default: return settings?.modules?.[key] !== false;
  }
}

export function useModule(key) {
  return featureOn(useSettings().settings, key);
}
