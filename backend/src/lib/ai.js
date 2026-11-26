// Souk AI – every call to the AI provider goes through here: the API key stays on the server,
// each call is checked against the admin's switches, the per-user daily limit and the daily /
// monthly budget, and its token usage and cost are written to `ai_usage`.
import crypto from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '../db.js';
import { HttpError, badRequest } from './http.js';
import { getSettings } from './settings.js';

export const AI_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'];
export const AI_FEATURES = ['assistant', 'describe', 'visual', 'translate', 'fraud'];

// US$ per million tokens: input, output, cache read (cache writes cost 1.25 × input).
const PRICES = {
  'claude-opus-5-5': [4, 20, 0.2],
  'claude-sonnet-5-5': [2, 10, 0.1],
  'claude-haiku-5-5': [0.1, 0.5, 0.01],
};

let client = null;
let testClient = null;

/** Tests swap in a fake provider (same `beta.messages.create` shape). */
export function setAiClient(fake) { testClient = fake; }

export const aiConfigured = () => Boolean(testClient || process.env.ANTHROPIC_API_KEY);

function provider() {
  if (testClient) return testClient;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  // The serverless function has 60 s in all: one try of at most 25 s per call.
  client ??= new Anthropic({ maxRetries: 0, timeout: 25_000 });
  return client;
}

export function costOf(model, usage = {}) {
  const [inp, out, read] = PRICES[model] || PRICES['claude-opus-5-5'];
  const write = usage.cache_creation_input_tokens || 0;
  return ((usage.input_tokens || 0) * inp + write * inp * 1.25 + (usage.cache_read_input_tokens || 0) * read
    + (usage.output_tokens || 0) * out) / 1_000_000;
}

/** Public view for the site: is Souk AI on, and which parts. */
export async function aiStatus() {
  const { ai } = await getSettings();
  const on = Boolean(ai.enabled && aiConfigured());
  return { enabled: on, features: Object.fromEntries(AI_FEATURES.map((f) => [f, on && ai.features[f] !== false])) };
}

async function spent(interval) {
  const { rows } = await query(`SELECT COALESCE(SUM(cost_usd), 0)::float8 AS usd FROM ai_usage WHERE created_at > now() - $1::interval`, [interval]);
  return rows[0].usd;
}

/** Throw if this feature can't be used right now (switched off, over the budget or the user's limit). */
export async function assertAiAvailable(feature, user, { checkUser = true } = {}) {
  const { ai } = await getSettings();
  if (!ai.enabled || !aiConfigured() || ai.features[feature] === false) throw new HttpError(503, 'ai_disabled');
  if (await spent('1 day') >= ai.dailyBudgetUsd || await spent('30 days') >= ai.monthlyBudgetUsd) throw new HttpError(503, 'ai_budget');
  if (checkUser && user && user.role !== 'admin') {
    // One question to the assistant may take several model calls: they share a request id and count once.
    const { rows } = await query(
      "SELECT COUNT(DISTINCT request_id)::int AS n FROM ai_usage WHERE user_id = $1 AND feature <> 'fraud' AND created_at > now() - interval '1 day'",
      [user.id],
    );
    if (rows[0].n >= ai.userDaily) throw new HttpError(429, 'ai_quota');
  }
  return ai;
}

function log(row) {
  return query(
    `INSERT INTO ai_usage (feature, user_id, model, input_tokens, output_tokens, cache_read, cache_write, cost_usd, ok, error, ms, request_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [row.feature, row.userId ?? null, row.model ?? null, row.usage?.input_tokens || 0, row.usage?.output_tokens || 0,
      row.usage?.cache_read_input_tokens || 0, row.usage?.cache_creation_input_tokens || 0,
      row.model ? costOf(row.model, row.usage) : 0, row.ok, row.error ?? null, row.ms ?? null, row.requestId],
  ).catch(() => {});
}

/**
 * One request to the model. `schema` asks for JSON matching it (structured output) and returns
 * the parsed object as `.data`. Usage and cost are always recorded, also when the call fails.
 */
export async function aiMessage({ feature, user, system, messages, tools, schema, maxTokens = 2000, effort = 'low', requestId = crypto.randomUUID(), checkUser = true }) {
  const ai = await assertAiAvailable(feature, user, { checkUser });
  const model = ai.model;
  const params = {
    model,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort, ...(schema ? { format: { type: 'json_schema', schema } } : {}) },
  };
  if (tools) params.tools = tools;
  // On a safety decline the API retries on a fallback model itself (Haiku has no server-side fallback).
  if (model !== 'claude-haiku-5-5') {
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }
  const started = Date.now();
  let res;
  try {
    res = await provider().beta.messages.create(params);
  } catch (err) {
    const code = err instanceof Anthropic.RateLimitError ? 'provider_rate_limited'
      : err instanceof Anthropic.AuthenticationError ? 'provider_auth'
        : err instanceof Anthropic.APIError ? `provider_${err.status || 'error'}` : 'provider_unreachable';
    await log({ feature, requestId, userId: user?.id, model, ok: false, error: code, ms: Date.now() - started });
    console.error('[ai]', feature, code, err?.message);
    throw new HttpError(502, 'ai_failed');
  }
  const usedModel = res.model || model;
  const refused = res.stop_reason === 'refusal';
  await log({ feature, requestId, userId: user?.id, model: usedModel, usage: res.usage, ok: !refused, error: refused ? 'refusal' : null, ms: Date.now() - started });
  if (refused) throw badRequest('ai_refused');
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let data = null;
  if (schema) {
    if (res.stop_reason === 'max_tokens') throw new HttpError(502, 'ai_failed');
    try { data = JSON.parse(text); } catch { throw new HttpError(502, 'ai_failed'); }
  }
  return { res, text, data };
}

/** Run work after the response is sent (Vercel keeps the function alive for it). */
export async function inBackground(promise) {
  const safe = Promise.resolve(promise).catch((err) => console.error('[ai background]', err?.message));
  if (process.env.NODE_ENV === 'test') return safe;
  try {
    const { waitUntil } = await import('@vercel/functions');
    waitUntil(safe);
  } catch { /* local server: the promise just runs */ }
  return undefined;
}

/** How many AI requests this user has left today. */
export async function remainingToday(user) {
  if (!user) return null;
  const { ai } = await getSettings();
  if (user.role === 'admin') return ai.userDaily;
  const { rows } = await query(
    "SELECT COUNT(DISTINCT request_id)::int AS n FROM ai_usage WHERE user_id = $1 AND feature <> 'fraud' AND created_at > now() - interval '1 day'",
    [user.id],
  );
  return Math.max(0, ai.userDaily - rows[0].n);
}

/** Usage numbers for the admin page. */
export async function usageReport() {
  const [totals, byFeature, daily] = await Promise.all([
    query(`SELECT
        COALESCE(SUM(cost_usd) FILTER (WHERE created_at > now() - interval '1 day'), 0)::float8 AS today_usd,
        COALESCE(SUM(cost_usd) FILTER (WHERE created_at > now() - interval '30 days'), 0)::float8 AS month_usd,
        COUNT(*) FILTER (WHERE created_at > now() - interval '1 day')::int AS today_calls,
        COUNT(*) FILTER (WHERE created_at > now() - interval '30 days')::int AS month_calls,
        COUNT(*) FILTER (WHERE NOT ok AND created_at > now() - interval '1 day')::int AS today_errors,
        COUNT(DISTINCT user_id) FILTER (WHERE created_at > now() - interval '30 days')::int AS month_users
      FROM ai_usage`),
    query(`SELECT feature, COUNT(*)::int AS calls, COUNT(*) FILTER (WHERE NOT ok)::int AS errors,
        COALESCE(SUM(cost_usd), 0)::float8 AS usd, COALESCE(SUM(input_tokens + output_tokens), 0)::bigint AS tokens
      FROM ai_usage WHERE created_at > now() - interval '30 days' GROUP BY feature ORDER BY usd DESC`),
    query(`SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS calls, COALESCE(SUM(cost_usd), 0)::float8 AS usd
      FROM ai_usage WHERE created_at > now() - interval '14 days' GROUP BY 1 ORDER BY 1`),
  ]);
  return { ...totals.rows[0], byFeature: byFeature.rows, daily: daily.rows };
}
