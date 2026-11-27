import { featureOn } from './modules.js';
// Links the admin can put in the top menu or the footer (Admin → Menus & links).
export const BUILTIN_LINKS = {
  home: { to: '/', icon: 'home', label: 'nav.home', end: true },
  products: { to: '/products', icon: 'grid', label: 'nav.allProducts', end: true },
  categories: { to: '/categories', icon: 'grid', label: 'nav.categories', dropdown: true },
  stores: { to: '/stores', icon: 'store', label: 'nav.stores' },
  offers: { to: '/products?deals=1', emoji: '🔥', label: 'nav.offers' },
  wanted: { to: '/wanted', emoji: '🙋', label: 'wanted.nav', module: 'wanted' },
  social: { to: '/social', emoji: '💬', label: 'social.nav', module: 'social' },
  live: { to: '/live', emoji: '🔴', label: 'live.nav', module: 'live' },
  eid: { to: '/eid', emoji: '🐑', label: 'eid.nav' },
  livestock: { to: '/livestock', emoji: '🐪', label: 'livestock.nav', module: 'livestock' },
  auctions: { to: '/auctions', emoji: '🔨', label: 'auction.nav', module: 'auctions' },
  about: { to: '/about', icon: 'info', label: 'nav.about' },
  help: { to: '/help', icon: 'help', label: 'nav.help' },
  safety: { to: '/safety', icon: 'shield', label: 'footer.safety' },
  sell: { to: '/sell', icon: 'plus', label: 'nav.post' },
};

const b = (key) => ({ type: 'builtin', key });
export const DEFAULT_HEADER = ['home', 'products', 'categories', 'stores', 'offers', 'auctions', 'live', 'social', 'wanted', 'about'].map(b);
export const DEFAULT_FOOTER = ['products', 'auctions', 'livestock', 'live', 'social', 'wanted', 'stores', 'sell', 'offers', 'about', 'help', 'safety'].map(b);
export const HOME_SECTIONS = ['hero', 'categories', 'latest', 'promo', 'deals', 'cities', 'stores', 'features'];

/** Resolve a menu item to { to, label, icon, emoji, end, dropdown, external }. */
export function resolveLink(item, t, lang, settings) {
  if (item.type === 'builtin') {
    const d = BUILTIN_LINKS[item.key];
    // A link to a feature the admin switched off disappears from the menus.
    if (d?.module && settings && !featureOn(settings, d.module)) return null;
    return d ? { ...d, label: t(d.label), key: item.key } : null;
  }
  const label = item.label?.[lang] || item.label?.ar || item.to;
  return { to: item.to, label, external: /^https?:/i.test(item.to), key: item.to };
}
