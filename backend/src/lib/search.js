import { query } from '../db.js';

// Must match mm_normalize() in schema.sql.
const FROM = 'أإآٱةىؤئéèêëàâäîïôöùûüç';
const TO = 'ااااهيويeeeeaaaiioouuuc';
const MAP = new Map([...FROM].map((c, i) => [c, TO[i]]));
const TASHKEEL = /[ً-ْـ]/g;
const INVISIBLE = /[​-‏‪-‮⁦-⁩﻿]/g;

export function normalize(text) {
  return [...String(text || '').toLowerCase().replace(INVISIBLE, '')]
    .map((c) => MAP.get(c) ?? c)
    .join('')
    .replace(TASHKEEL, '');
}

/**
 * Split a query into normalised search terms. The Arabic definite article
 * ("ال", also "وال"/"بال"/"فال"/"كال"/"لل") is dropped so «السيارة» matches «سيارة».
 */
export function searchTerms(q) {
  const terms = normalize(q)
    .split(/[\s,.;:!?()\[\]"'«»،؛؟\-_/]+/)
    .map((w) => w.replace(/^(وال|بال|فال|كال|لل|ال)(?=\S{2,})/, ''))
    .filter((w) => w.length >= 2);
  return [...new Set(terms)].slice(0, 6);
}

export const escapeLike = (s) => s.replace(/[\\%_]/g, (m) => `\\${m}`);

let trgmAvailable = null;
/** True when pg_trgm's word_similarity() is usable by this database role. */
export async function hasTrgm() {
  if (trgmAvailable === null) {
    try {
      await query("SELECT word_similarity('a', 'a')");
      trgmAvailable = true;
    } catch {
      trgmAvailable = false;
    }
  }
  return trgmAvailable;
}

/**
 * Build WHERE conditions and a relevance score for a free-text query.
 * `push(value)` adds a bound parameter and returns its placeholder ($n).
 */
export async function buildSearch(q, push) {
  const terms = searchTerms(q);
  if (!terms.length) return null;
  const fuzzy = await hasTrgm();
  const conditions = [];
  const scores = [];
  for (const term of terms) {
    const like = push(`%${escapeLike(term)}%`);
    if (fuzzy && term.length >= 4) {
      const raw = push(term);
      conditions.push(`(p.search_text LIKE ${like} OR word_similarity(${raw}, p.search_text) >= 0.55)`);
      scores.push(`(CASE WHEN mm_normalize(p.title) LIKE ${like} THEN 2 ELSE 0 END)
        + (CASE WHEN p.search_text LIKE ${like} THEN 1 ELSE 0 END)
        + word_similarity(${raw}, p.search_text)`);
    } else {
      conditions.push(`p.search_text LIKE ${like}`);
      scores.push(`(CASE WHEN mm_normalize(p.title) LIKE ${like} THEN 2 ELSE 0 END) + 1`);
    }
  }
  return { where: conditions.join(' AND '), score: scores.map((s) => `(${s})`).join(' + ') };
}
