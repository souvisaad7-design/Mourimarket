// Delivery pricing and the order life cycle (who may move an order to which status).
import { AREAS } from './constants.js';
import { getCities } from './cities.js';
import { distanceKm } from './geo.js';

export const STATUSES = ['pending', 'accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
export const OPEN_STATUSES = ['pending', 'accepted', 'preparing', 'picked_up', 'on_the_way'];

// next status → roles allowed to make that move
export const FLOW = {
  pending: { accepted: ['seller', 'admin'], cancelled: ['buyer', 'seller', 'admin'] },
  accepted: { preparing: ['seller', 'admin'], picked_up: ['courier', 'admin'], cancelled: ['buyer', 'seller', 'admin'] },
  preparing: { picked_up: ['courier', 'admin'], cancelled: ['seller', 'admin'] },
  picked_up: { on_the_way: ['courier', 'admin'], cancelled: ['admin'] },
  on_the_way: { delivered: ['courier', 'admin'], cancelled: ['admin'] },
  delivered: {},
  cancelled: {},
};

/** Where a delivery goes: the buyer's pin, else the moughataa centre, else the city centre. */
export async function destinationPoint({ city, area, lat, lng }) {
  if (lat != null && lng != null) return { lat: Number(lat), lng: Number(lng) };
  const a = (AREAS[city] || []).find((x) => x.key === area || x.ar === area || x.fr === area || x.en === area);
  if (a) return { lat: a.lat, lng: a.lng };
  const c = (await getCities()).find((x) => x.key === city);
  return c?.lat != null ? { lat: Number(c.lat), lng: Number(c.lng) } : null;
}

/** Where it is picked up: the listing's pin, else its city centre. */
export async function pickupPoint(product) {
  if (product.lat != null) return { lat: Number(product.lat), lng: Number(product.lng) };
  const c = (await getCities()).find((x) => x.key === product.city);
  return c?.lat != null ? { lat: Number(c.lat), lng: Number(c.lng) } : null;
}

/** fee = max(minFee, baseFee + perKm × km) (+ interCityFee between cities), rounded up to 10 MRU. */
export function deliveryFee(pricing, km, interCity) {
  const raw = Math.max(pricing.minFee, pricing.baseFee + pricing.perKm * km) + (interCity ? pricing.interCityFee : 0);
  return Math.ceil(raw / 10) * 10;
}

export async function quote(pricing, product, dest) {
  const from = await pickupPoint(product);
  const to = await destinationPoint(dest);
  // Without coordinates on either side, count a short in-town trip.
  const km = from && to ? Math.round(distanceKm(from.lat, from.lng, to.lat, to.lng) * 1.25 * 10) / 10 : 3; // ×1.25: roads are not straight
  const interCity = dest.city !== product.city;
  return {
    itemPrice: Number(product.price),
    deliveryFee: deliveryFee(pricing, km, interCity),
    distanceKm: km,
    interCity,
    deliverable: km <= pricing.maxKm,
    pickup: from,
    destination: to,
  };
}
