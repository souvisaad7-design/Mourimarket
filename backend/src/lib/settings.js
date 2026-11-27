// Site settings the admin edits from the panel, stored in `site_settings`
// (one JSON document per section) and cached briefly in memory.
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db.js';
import { FEATURE_PLANS, VERIFY_PRICE } from './constants.js';
import { badRequest } from './http.js';

const text = (max = 200) => z.string().trim().max(max);
const internal = (v) => /^\/(?![/\\])/.test(v);
const url = z.string().trim().max(300).refine((v) => v === '' || /^https:\/\/[^\s]+$/i.test(v), 'https_url');
const langTexts = z.record(z.string().regex(/^[a-zA-Z0-9_.]{1,80}$/), z.string().max(2000))
  .refine((o) => Object.keys(o).length <= 600, 'too_many');

const L = (max = 200) => z.object({ ar: text(max), fr: text(max), en: text(max) });
// A link inside the site ("/products?deals=1") or to another site (https://…).
const href = z.string().trim().max(300).refine((v) => v === '' || internal(v) || /^https:\/\//i.test(v), 'link');
const imageUrl = z.string().trim().max(300).refine((v) => v === '' || /^\/uploads\/f\/\d+$/.test(v) || /^https:\/\//i.test(v), 'image');
const BUILTIN_LINKS = ['home', 'products', 'categories', 'stores', 'offers', 'wanted', 'social', 'live', 'eid', 'livestock', 'auctions', 'about', 'help', 'safety', 'sell'];
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
    escrow: z.boolean().default(false),
    baseFee: z.number().int().min(0).max(1_000_000),
    perKm: z.number().int().min(0).max(100_000),
    minFee: z.number().int().min(0).max(1_000_000),
    interCityFee: z.number().int().min(0).max(1_000_000),
    maxKm: z.number().int().min(1).max(2000),
  }),
  pricing: z.object({
    verifyPrice: z.number().int().min(0).max(10_000_000),
    bumpPrice: z.number().int().min(0).max(10_000_000).default(50),
    freeBumpDays: z.number().int().min(1).max(365).default(7),
    storePlans: z.array(z.object({
      key: z.string().regex(/^[a-z0-9-]{2,20}$/),
      name: z.object({ ar: z.string().trim().max(40), fr: z.string().trim().max(40), en: z.string().trim().max(40) }),
      price: z.number().int().min(0).max(10_000_000),
      featuredPerMonth: z.number().int().min(0).max(500),
    })).max(4).default([]),
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
    link: z.string().trim().max(300).refine((v) => v === '' || internal(v) || /^https:\/\//i.test(v), 'link'),
  }),
  features: z.object({ registration: z.boolean(), autoApprove: z.boolean(), paidUpgrades: z.boolean(), phoneVerification: z.boolean() }),
  // Souk AI: master switch, model, per-feature switches, per-user daily limit and spending caps (US$).
  ai: z.object({
    enabled: z.boolean(),
    model: z.enum(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5']),
    features: z.object({ assistant: z.boolean(), describe: z.boolean(), visual: z.boolean(), translate: z.boolean(), fraud: z.boolean() }),
    userDaily: z.number().int().min(1).max(500),
    dailyBudgetUsd: z.number().min(0).max(10_000),
    monthlyBudgetUsd: z.number().min(0).max(100_000),
  }),
  // Souk Social / Souk Live switches and the size of the live relay tree.
  community: z.object({
    enabled: z.boolean(),
    liveEnabled: z.boolean(),
    hostFanout: z.number().int().min(1).max(10),
    relayFanout: z.number().int().min(0).max(4),
    maxDepth: z.number().int().min(1).max(10),
    autoHideReports: z.number().int().min(2).max(100),
  }),
  // Seasonal sections: the Eid al-Adha sheep market (on from the admin, with the date of Eid).
  season: z.object({
    eid: z.object({ enabled: z.boolean(), date: z.string().trim().refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'date') }),
  }),
  // Auctions: switch, allowed length, and how much a last-minute bid extends the end (anti-sniping).
  auctions: z.object({
    enabled: z.boolean(),
    minHours: z.number().int().min(1).max(72),
    maxDays: z.number().int().min(1).max(30),
    extendMinutes: z.number().int().min(0).max(30),
  }),
  payment: z.object({ bankily: text(40), masrvi: text(40), sedad: text(40), accountName: text(80) }),
  texts: z.object({ ar: langTexts, fr: langTexts, en: langTexts, hs: langTexts.default({}) }),
};

export const defaults = () => ({
  // Empty values / null menus mean "use the built-in ones".
  appearance: { siteName: '', logoUrl: '', primaryColor: '', secondaryColor: '' },
  maintenance: { enabled: false, message: { ar: '', fr: '', en: '' } },
  delivery: { enabled: true, escrow: false, baseFee: 100, perKm: 20, minFee: 150, interCityFee: 500, maxKm: 600 },
  pricing: {
    verifyPrice: VERIFY_PRICE, featurePlans: FEATURE_PLANS, bumpPrice: 50, freeBumpDays: 7,
    storePlans: [
      { key: 'pro', name: { ar: 'محترف', fr: 'Pro', en: 'Pro' }, price: 1500, featuredPerMonth: 5 },
      { key: 'premium', name: { ar: 'مميز', fr: 'Premium', en: 'Premium' }, price: 4000, featuredPerMonth: 15 },
    ],
  },
  menu: { header: null, footer: null, home: Object.fromEntries(HOME_SECTIONS.map((k) => [k, true])) },
  contact: { email: '', whatsapp: '', phone: '', address: '' },
  social: { facebook: '', instagram: '', tiktok: '', x: '', youtube: '' },
  announcement: { enabled: false, tone: 'gold', style: 'static', link: '' },
  features: { registration: true, autoApprove: config.autoApprove, paidUpgrades: process.env.PAID_UPGRADES === 'true', phoneVerification: true },
  ai: {
    enabled: true, model: 'claude-opus-5-5',
    features: { assistant: true, describe: true, visual: true, translate: true, fraud: true },
    userDaily: 30, dailyBudgetUsd: 3, monthlyBudgetUsd: 30,
  },
  community: { enabled: true, liveEnabled: true, hostFanout: 4, relayFanout: 2, maxDepth: 6, autoHideReports: 5 },
  season: { eid: { enabled: false, date: '' } },
  auctions: { enabled: true, minHours: 6, maxDays: 7, extendMinutes: 3 },
  payment: { bankily: '', masrvi: '', sedad: '', accountName: 'سوق شنقيط' },
  texts: { ar: {}, fr: {}, en: {}, hs: {} },
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
