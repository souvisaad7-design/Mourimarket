// Site settings the admin edits from the panel, stored in `site_settings`
// (one JSON document per section) and cached briefly in memory.
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db.js';
import { FEATURE_PLANS, VERIFY_PRICE } from './constants.js';
import { badRequest } from './http.js';

const text = (max = 200) => z.string().trim().max(max);
const url = z.string().trim().max(300).refine((v) => v === '' || /^https:\/\/[^\s]+$/i.test(v), 'https_url');
const langTexts = z.record(z.string().regex(/^[a-zA-Z0-9_.]{1,80}$/), z.string().max(2000))
  .refine((o) => Object.keys(o).length <= 600, 'too_many');

const L = (max = 200) => z.object({ ar: text(max), fr: text(max), en: text(max) });
// A link inside the site ("/products?deals=1") or to another site (https://…).
const href = z.string().trim().max(300).refine((v) => v === '' || v.startsWith('/') || /^https:\/\//i.test(v), 'link');
const imageUrl = z.string().trim().max(300).refine((v) => v === '' || /^\/uploads\/f\/\d+$/.test(v) || /^https:\/\//i.test(v), 'image');
const BUILTIN_LINKS = ['home', 'products', 'categories', 'stores', 'offers', 'about', 'help', 'safety', 'sell'];
const menuItem = z.discriminatedUnion('type', [
  z.object({ type: z.literal('builtin'), key: z.enum(BUILTIN_LINKS) }),
  z.object({ type: z.literal('link'), label: L(60), to: href.refine((v) => v !== '', 'required') }),
]);
const HOME_SECTIONS = ['hero', 'categories', 'latest', 'promo', 'deals', 'cities', 'stores', 'features'];

export const SECTIONS = {
  appearance: z.object({
    siteName: text(40),
    logoUrl: imageUrl,
    // '' = the original Mauritanian green / gold.
    primaryColor: z.string().trim().refine((v) => v === '' || /^#[0-9a-f]{6}$/i.test(v), 'color'),
    secondaryColor: z.string().trim().refine((v) => v === '' || /^#[0-9a-f]{6}$/i.test(v), 'color'),
  }),
  maintenance: z.object({ enabled: z.boolean(), message: L(500) }),
  // Delivery prices (MRU): base + per km, never under the minimum; extra when crossing cities.
  delivery: z.object({
    enabled: z.boolean(),
    baseFee: z.number().int().min(0).max(1_000_000),
    perKm: z.number().int().min(0).max(100_000),
    minFee: z.number().int().min(0).max(1_000_000),
    interCityFee: z.number().int().min(0).max(1_000_000),
    maxKm: z.number().int().min(1).max(2000),
  }),
  pricing: z.object({
    verifyPrice: z.number().int().min(0).max(10_000_000),
    featurePlans: z.array(z.object({ days: z.number().int().min(1).max(365), price: z.number().int().min(0).max(10_000_000) }))
      .min(1).max(6).refine((plans) => new Set(plans.map((p) => p.days)).size === plans.length, 'duplicate_days'),
  }),
  menu: z.object({
    header: z.array(menuItem).max(12).nullable(),
    footer: z.array(menuItem).max(15).nullable(),
    home: z.object(Object.fromEntries(HOME_SECTIONS.map((k) => [k, z.boolean()]))),
  }),
  contact: z.object({ email: z.union([z.literal(''), z.string().trim().email().max(120)]), whatsapp: text(40), phone: text(40), address: text(200) }),
  social: z.object({ facebook: url, instagram: url, tiktok: url, x: url, youtube: url }),
  announcement: z.object({
    enabled: z.boolean(),
    tone: z.enum(['brand', 'gold', 'rose']),
    style: z.enum(['static', 'marquee']),
    link: z.string().trim().max(300).refine((v) => v === '' || v.startsWith('/') || /^https:\/\//i.test(v), 'link'),
  }),
  features: z.object({ registration: z.boolean(), autoApprove: z.boolean(), paidUpgrades: z.boolean() }),
  payment: z.object({ bankily: text(40), masrvi: text(40), sedad: text(40), accountName: text(80) }),
  texts: z.object({ ar: langTexts, fr: langTexts, en: langTexts }),
};

export const defaults = () => ({
  // Empty values / null menus mean "use the built-in ones".
  appearance: { siteName: '', logoUrl: '', primaryColor: '', secondaryColor: '' },
  maintenance: { enabled: false, message: { ar: '', fr: '', en: '' } },
  delivery: { enabled: true, baseFee: 100, perKm: 20, minFee: 150, interCityFee: 500, maxKm: 600 },
  pricing: { verifyPrice: VERIFY_PRICE, featurePlans: FEATURE_PLANS },
  menu: { header: null, footer: null, home: Object.fromEntries(HOME_SECTIONS.map((k) => [k, true])) },
  contact: { email: '', whatsapp: '', phone: '', address: '' },
  social: { facebook: '', instagram: '', tiktok: '', x: '', youtube: '' },
  announcement: { enabled: false, tone: 'gold', style: 'static', link: '' },
  features: { registration: true, autoApprove: config.autoApprove, paidUpgrades: process.env.PAID_UPGRADES === 'true' },
  payment: { bankily: '', masrvi: '', sedad: '', accountName: 'سوق شنقيط' },
  texts: { ar: {}, fr: {}, en: {} },
});

let cache = null;
let cachedAt = 0;
const TTL = 10_000;

export async function getSettings({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cachedAt < TTL) return cache;
  const { rows } = await query('SELECT key, value FROM site_settings');
  const out = defaults();
  for (const { key, value } of rows) {
    if (out[key] && value && typeof value === 'object') out[key] = { ...out[key], ...value };
  }
  cache = out;
  cachedAt = Date.now();
  return out;
}

/** Replace whole sections (validated); returns the full settings. */
export async function saveSettings(patch, userId) {
  const parsed = {};
  for (const [key, value] of Object.entries(patch || {})) {
    if (!SECTIONS[key]) continue;
    const r = SECTIONS[key].safeParse({ ...defaults()[key], ...value });
    if (!r.success) {
      const issue = r.error.issues[0];
      throw badRequest('validation_error', { [[key, ...issue.path].join('.')]: issue.message });
    }
    parsed[key] = r.data;
  }
  for (const [key, value] of Object.entries(parsed)) {
    await query(
      `INSERT INTO site_settings (key, value, updated_by, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [key, value, userId],
    );
  }
  cache = null;
  return getSettings({ fresh: true });
}

/** Paid verification / featuring requests (Admin → Payments). Off by default: the site is free. */
export const paidUpgradesEnabled = async () => (await getSettings()).features.paidUpgrades;
