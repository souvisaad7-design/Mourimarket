// Souk AI on the visitor's side: the listings they looked at stay on their own device
// (localStorage) and are only sent when asking for recommendations. They can turn it off or clear it.
const SEEN = 'sc_seen';
const PERSONAL = 'sc_ai_personal';

const read = (k, fallback) => { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export const personalizeOn = () => read(PERSONAL, true) !== false;
export function setPersonalize(on) { write(PERSONAL, Boolean(on)); if (!on) clearSeen(); }

export const seenIds = () => (personalizeOn() ? read(SEEN, []).filter((n) => Number.isInteger(n)).slice(0, 30) : []);
export function rememberView(id) {
  if (!personalizeOn() || !Number.isInteger(id)) return;
  write(SEEN, [id, ...read(SEEN, []).filter((n) => n !== id)].slice(0, 30));
}
export function clearSeen() { try { localStorage.removeItem(SEEN); } catch { /* ignore */ } }
