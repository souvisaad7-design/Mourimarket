// The visitor's position, for "near me" and distances.
// Privacy: it stays on this device (localStorage, rounded to ~100 m) and is only sent to the
// server rounded to ~1 km when asking for listings; nothing about it is ever saved there.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from './AppContext.jsx';
import { useI18n } from '../i18n/index.jsx';
import { api } from '../lib/api.js';

const KEY = 'mm_location';
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;

function readSaved() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && typeof v.lat === 'number' && typeof v.lng === 'number') return v;
  } catch { /* storage unavailable */ }
  return null;
}

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { lang } = useI18n();
  const { meta } = useApp();
  // saved: { lat, lng, source: 'gps' | 'manual', place: { city, area, district } }
  const [saved, setSaved] = useState(readSaved);
  // idle | locating | denied | unavailable | unsupported | outside
  const [status, setStatus] = useState('idle');

  const persist = useCallback((value) => {
    setSaved(value);
    try {
      if (value) localStorage.setItem(KEY, JSON.stringify(value)); else localStorage.removeItem(KEY);
    } catch { /* ignore */ }
  }, []);

  /** Ask the browser for the position (it shows its own permission prompt), then name the place. */
  const locate = useCallback(() => new Promise((resolve) => {
    if (!('geolocation' in navigator)) { setStatus('unsupported'); resolve(null); return; }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = round(pos.coords.latitude, 3);
      const lng = round(pos.coords.longitude, 3);
      let place = null;
      try {
        place = await api('/geo/reverse', { method: 'POST', body: { lat, lng, lang } });
      } catch { /* the position still works without names */ }
      if (place && !place.inMauritania) {
        setStatus('outside');
        resolve(null);
        return;
      }
      const value = { lat, lng, source: 'gps', place: place ? { city: place.city, area: place.area, district: place.district } : null };
      persist(value);
      setStatus('idle');
      resolve(value);
    }, (err) => {
      setStatus(err.code === 1 ? 'denied' : 'unavailable');
      resolve(null);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  }), [lang, persist]);

  /** Pick a city (and a Nouakchott moughataa) by hand: distances are then from its centre. */
  const setManual = useCallback(({ cityKey, area }) => {
    const city = meta.cities.find((c) => c.key === cityKey);
    if (!city || city.lat == null) return null;
    const point = area?.lat != null ? area : city;
    const value = {
      lat: round(Number(point.lat), 3), lng: round(Number(point.lng), 3), source: 'manual',
      place: { city: { key: city.key, ar: city.ar, fr: city.fr, en: city.en }, area: area ? { key: area.key, ar: area.ar, fr: area.fr, en: area.en } : null, district: null },
    };
    persist(value);
    setStatus('idle');
    return value;
  }, [meta.cities, persist]);

  const forget = useCallback(() => { persist(null); setStatus('idle'); }, [persist]);

  // Coordinates sent with listing searches: ~1 km, never the precise point.
  const query = useMemo(() => (saved ? { lat: round(saved.lat, 2), lng: round(saved.lng, 2) } : null), [saved]);

  useEffect(() => { if (saved) setStatus('idle'); }, [saved]);

  const value = useMemo(() => ({ location: saved, status, locate, setManual, forget, query }), [saved, status, locate, setManual, forget, query]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useGeo = () => useContext(LocationContext);

/** "Tevragh Zeina, Nouakchott" in the visitor's language. */
export function placeLabel(place, lang) {
  if (!place) return '';
  const name = (x) => (x ? x[lang] || x.ar || '' : '');
  return [place.district, name(place.area), name(place.city)].filter(Boolean).join(lang === 'ar' ? '، ' : ', ');
}
