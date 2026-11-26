import { query } from '../db.js';
import { synonymsOf } from './synonyms.js';

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

/** A term and the words that mean the same (normalised), the term itself first. */
export const termAlternatives = (term) => [term, ...synonymsOf(term, normalize).filter((w) => w !== term)];

/**
 * Build WHERE conditions and a relevance score for a free-text query.
 * `push(value)` adds a bound parameter and returns its placeholder ($n).
 * Each word matches the listing text, a synonym of it, or the listing's category name
 * (when `withCategory`, i.e. the query joins categories as `c`); long words also match with typos.
 */
export async function buildSearch(q, push, { withCategory = true } = {}) {
  const terms = searchTerms(q);
  if (!terms.length) return null;
  const fuzzy = await hasTrgm();
  const conditions = [];
  const scores = [];
  const catText = "mm_normalize(c.name_ar || ' ' || c.name_fr || ' ' || c.name_en || ' ' || c.slug)";
  for (const term of terms) {
    const alts = termAlternatives(term).slice(0, 20);
    const like = push(`%${escapeLike(term)}%`);
    const altLikes = push(alts.map((a) => `%${escapeLike(a)}%`));
    const any = (col) => `${col} LIKE ANY(${altLikes}::text[])`;
    // (the plain term is also in the condition: queries that only use the WHERE part still bind every parameter)
    const parts = [`p.search_text LIKE ${like}`, any('p.search_text')];
    if (withCategory) parts.push(any(catText));
    let score = `(CASE WHEN mm_normalize(p.title) LIKE ${like} THEN 2 ELSE 0 END)
      + (CASE WHEN p.search_text LIKE ${like} THEN 1 WHEN ${any('p.search_text')} THEN 0.8 ELSE 0 END)`;
    if (withCategory) score += ` + (CASE WHEN ${any(catText)} THEN 0.5 ELSE 0 END)`;
    if (fuzzy && term.length >= 4) {
      const raw = push(term);
      parts.push(`word_similarity(${raw}, p.search_text) >= 0.55`);
      score += ` + word_similarity(${raw}, p.search_text)`;
    }
    conditions.push(`(${parts.join(' OR ')})`);
    scores.push(score);
  }
  return { where: conditions.join(' AND '), score: scores.map((s) => `(${s})`).join(' + ') };
}
