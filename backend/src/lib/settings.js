// Site settings the admin edits from the panel, stored in `site_settings`
// (one JSON document per section) and cached briefly in memory.
import { z } from 'zod';
import { config } from '../config.js';
import { query } from '../db.js';
import { badRequest } from './http.js';

const text = (max = 200) => z.string().trim().max(max);
const url = z.string().trim().max(300).refine((v) => v === '' || /^https:\/\/[^\s]+$/i.test(v), 'https_url');
const langTexts = z.record(z.string().regex(/^[a-zA-Z0-9_.]{1,80}$/), z.string().max(2000))
  .refine((o) => Object.keys(o).length <= 600, 'too_many');

export const SECTIONS = {
  contact: z.object({ email: z.union([z.literal(''), z.string().trim().email().max(120)]), whatsapp: text(40), phone: text(40), address: text(200) }),
  social: z.object({ facebook: url, instagram: url, tiktok: url, x: url, youtube: url }),
  announcement: z.object({
    enabled: z.boolean(),
    tone: z.enum(['brand', 'gold', 'rose']),
    link: z.string().trim().max(300).refine((v) => v === '' || v.startsWith('/') || /^https:\/\//i.test(v), 'link'),
  }),
  features: z.object({ registration: z.boolean(), autoApprove: z.boolean() }),
  payment: z.object({ bankily: text(40), masrvi: text(40), sedad: text(40), accountName: text(80) }),
  texts: z.object({ ar: langTexts, fr: langTexts, en: langTexts }),
};

export const DEFAULTS = {
  contact: { email: '', whatsapp: '', phone: '', address: '' },
  social: { facebook: '', instagram: '', tiktok: '', x: '', youtube: '' },
  announcement: { enabled: false, tone: 'gold', link: '' },
  features: { registration: true, autoApprove: config.autoApprove },
  payment: { bankily: '', masrvi: '', sedad: '', accountName: 'MauriMarket' },
  texts: { ar: {}, fr: {}, en: {} },
};

let cache = null;
let cachedAt = 0;
const TTL = 15_000;

export async function getSettings({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cachedAt < TTL) return cache;
  const { rows } = await query('SELECT key, value FROM site_settings');
  const out = structuredClone(DEFAULTS);
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
    const r = SECTIONS[key].safeParse({ ...DEFAULTS[key], ...value });
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
