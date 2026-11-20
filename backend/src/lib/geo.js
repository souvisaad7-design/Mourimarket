// Turning a position into "city / moughataa / neighbourhood".
// The city and the Nouakchott moughataa come from our own data (always works, no outside call);
// the neighbourhood comes from OpenStreetMap's Nominatim when it answers in time.
import { AREAS } from './constants.js';
import { getCities } from './cities.js';

export function distanceKm(lat1, lng1, lat2, lng2) {
  const r = (d) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

const nearest = (list, lat, lng) => list.reduce((best, item) => {
  const d = distanceKm(lat, lng, item.lat, item.lng);
  return !best || d < best.d ? { item, d } : best;
}, null);

const cache = new Map();
const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse';

async function nominatim(lat, lng, lang) {
  const url = `${NOMINATIM}?format=jsonv2&zoom=17&addressdetails=1&accept-language=${lang}&lat=${lat}&lon=${lng}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'SoukChinguetti/1.0 (+https://souk-chinguetti.vercel.app)' } });
    if (!res.ok) return null;
    const a = (await res.json()).address || {};
    return {
      area: a.city_district || a.county || a.state_district || a.municipality || null,
      district: a.neighbourhood || a.suburb || a.quarter || a.residential || a.hamlet || a.village || null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Describe a position. Coordinates are rounded to ~100 m before any lookup, so the
 * exact point never leaves the server or lands in a cache.
 */
export async function reverseGeocode(rawLat, rawLng, lang = 'ar') {
  const lat = Math.round(rawLat * 1000) / 1000;
  const lng = Math.round(rawLng * 1000) / 1000;
  const key = `${lat},${lng},${lang}`;
  if (cache.has(key)) return cache.get(key);

  const cities = (await getCities()).filter((c) => c.is_active && c.lat != null);
  const near = nearest(cities.map((c) => ({ ...c, lat: Number(c.lat), lng: Number(c.lng) })), lat, lng);
  const city = near ? { key: near.item.key, ar: near.item.name_ar, fr: near.item.name_fr, en: near.item.name_en, km: Math.round(near.d) } : null;

  let area = null;
  const areas = city && AREAS[city.key];
  if (areas) {
    const a = nearest(areas, lat, lng);
    if (a && a.d < 10) area = { key: a.item.key, ar: a.item.ar, fr: a.item.fr, en: a.item.en };
  }

  const osm = await nominatim(lat, lng, lang);
  const out = {
    city,
    area: area || (osm?.area ? { key: null, ar: osm.area, fr: osm.area, en: osm.area } : null),
    district: osm?.district || null,
    // False for a position far from every city we know (e.g. outside Mauritania).
    inMauritania: Boolean(city && city.km <= 250),
    source: osm ? 'osm' : 'local',
  };
  if (cache.size > 1000) cache.delete(cache.keys().next().value);
  cache.set(key, out);
  return out;
}
