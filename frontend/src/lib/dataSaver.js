// Data-saver mode: smaller photos, maps only on request, no video preloading. Remembered on this
// device; on by default when the phone itself asks to save data (Android "Data saver").
import { useEffect, useState } from 'react';

const KEY = 'sc_lite';
const EVENT = 'sc:lite';

export function liteOn() {
  try {
    const v = localStorage.getItem(KEY);
    if (v !== null) return v === '1';
  } catch { /* storage unavailable */ }
  return Boolean(typeof navigator !== 'undefined' && navigator.connection?.saveData);
}

export function setLite(on) {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVENT));
}

export function useLite() {
  const [on, setOn] = useState(liteOn);
  useEffect(() => {
    const update = () => setOn(liteOn());
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return on;
}

/** A smaller copy of one of our uploaded photos (the server resizes and the CDN caches it). */
export const thumb = (url, width) => (url && /^\/uploads\/f\/\d+$/.test(url) ? `${url}?w=${width}` : url);
