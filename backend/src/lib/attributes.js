// Category-specific details (the definitions are shared with the browser: frontend/src/lib/attributes.js).
import { attributesFor } from '../../../frontend/src/lib/attributes.js';
import { badRequest } from './http.js';

export { attributesFor };

/** Clean and check a listing's details for its category; unknown keys are dropped. */
export function validateAttrs(categorySlug, raw) {
  let input = raw;
  if (typeof input === 'string') {
    try { input = input ? JSON.parse(input) : {}; } catch { throw badRequest('validation_error', { attrs: 'invalid' }); }
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) input = {};
  const out = {};
  for (const def of attributesFor(categorySlug)) {
    let v = input[def.key];
    if (v === undefined || v === null || v === '') continue;
    if (def.type === 'select') {
      v = String(v);
      if (!def.options.includes(v)) throw badRequest('validation_error', { [`attrs.${def.key}`]: 'invalid' });
    } else if (def.type === 'int') {
      if (!/^\d{1,10}$/.test(String(v).replace(/[\s,]/g, ''))) throw badRequest('validation_error', { [`attrs.${def.key}`]: 'invalid_number' });
      v = Number(String(v).replace(/[\s,]/g, ''));
      if (v < def.min || v > def.max) throw badRequest('validation_error', { [`attrs.${def.key}`]: 'out_of_range' });
    } else {
      v = String(v).trim().slice(0, def.max || 60);
      if (!v) continue;
    }
    out[def.key] = v;
  }
  return out;
}

/**
 * Search filters from the URL: a.brand=toyota, a.year.min=2015, a.mileage.max=150000 …
 * Only keys defined for the chosen category are used; values are bound parameters.
 */
export function attrFilters(categorySlug, q, add) {
  for (const def of attributesFor(categorySlug)) {
    if (!def.filter) continue;
    const col = `(p.attrs->>'${def.key}')`; // key comes from our own definitions, never from the request
    if (def.filter === 'eq') {
      const v = q[`a.${def.key}`];
      if (typeof v === 'string' && def.options.includes(v)) add(`${col} = ?`, v);
      continue;
    }
    const num = `(CASE WHEN ${col} ~ '^[0-9]{1,10}$' THEN ${col}::bigint END)`;
    for (const side of ['min', 'max']) {
      if ((def.filter === 'min' && side === 'max') || (def.filter === 'max' && side === 'min')) continue;
      const v = q[`a.${def.key}.${side}`];
      if (typeof v === 'string' && /^\d{1,10}$/.test(v)) add(`${num} ${side === 'min' ? '>=' : '<='} ?`, Number(v));
    }
  }
}
