// Car inspections by a partner workshop: the seller asks, the workshop inspects, the admin publishes the report.
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { badRequest, conflict, forbidden, notFound, parse } from '../lib/http.js';
import { notify } from '../lib/notify.js';
import { limiter } from '../lib/rateLimit.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { saveFile, upload } from '../middleware/upload.js';

const router = Router();

export const CHECK_ITEMS = ['engine', 'gearbox', 'brakes', 'suspension', 'steering', 'body', 'electrical', 'ac', 'tires', 'interior'];
const CHECK_VALUES = ['ok', 'attention', 'problem'];

/** The published report of a listing (for the listing page). */
export async function publishedInspection(productId) {
  const { rows } = await query(
    `SELECT i.id, i.workshop, i.inspected_on, i.mileage, i.overall, i.checklist, i.summary, f.id AS file_id
     FROM inspections i LEFT JOIN files f ON f.id = i.report_file_id
     WHERE i.product_id = $1 AND i.status = 'published' ORDER BY i.updated_at DESC LIMIT 1`,
    [productId],
  );
  const r = rows[0];
  if (!r) return null;
  return { ...r, report_url: r.file_id ? `/uploads/f/${r.file_id}` : null, file_id: undefined };
}

/** POST /api/products/:id/inspection – the seller asks for an inspection of their car. */
router.post('/products/:id/inspection', requireAuth, limiter('inspection-request', { windowMs: 24 * 60 * 60 * 1000, limit: 5, keyGenerator: (req) => String(req.user.id) }), async (req, res) => {
  const { note } = parse(z.object({ note: z.string().trim().max(500).optional() }), req.body || {});
  const { rows } = await query(
    `SELECT p.id, p.title, p.seller_id, p.status, c.slug FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = $1`,
    [parseInt(req.params.id, 10) || 0],
  );
  const p = rows[0];
  if (!p) throw notFound('product_not_found');
  if (p.seller_id !== req.user.id) throw forbidden();
  if (p.slug !== 'vehicles') throw badRequest('vehicles_only');
  if (p.status !== 'approved') throw badRequest('product_not_featurable');
  try {
    const r = await query('INSERT INTO inspections (product_id, requested_by, admin_note) VALUES ($1, $2, $3) RETURNING id, status', [p.id, req.user.id, note || null]);
    const admins = await query("SELECT id FROM users WHERE role = 'admin' AND is_active");
    for (const a of admins.rows) await notify(a.id, 'inspection_request', { name: req.user.name, title: p.title }, '/admin/inspections');
    res.status(201).json({ inspection: r.rows[0] });
  } catch (err) {
    if (err.code === '23505') throw conflict('inspection_pending');
    throw err;
  }
});

/** GET /api/products/:id/inspection – my requests for this listing (seller). */
router.get('/products/:id/inspection', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT i.id, i.status, i.created_at, i.updated_at FROM inspections i JOIN products p ON p.id = i.product_id
     WHERE i.product_id = $1 AND p.seller_id = $2 ORDER BY i.created_at DESC LIMIT 5`,
    [parseInt(req.params.id, 10) || 0, req.user.id],
  );
  res.json({ items: rows });
});

// ---------- Admin ----------

router.get('/admin/inspections', requireAuth, requireAdmin, async (req, res) => {
  const status = ['requested', 'scheduled', 'published', 'cancelled'].includes(req.query.status) ? req.query.status : null;
  const { rows } = await query(
    `SELECT i.*, p.title AS product_title, p.attrs, u.name AS seller_name, u.phone AS seller_phone,
       (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS cover_url
     FROM inspections i JOIN products p ON p.id = i.product_id JOIN users u ON u.id = p.seller_id
     ${status ? 'WHERE i.status = $1' : ''} ORDER BY (i.status IN ('requested', 'scheduled')) DESC, i.created_at DESC LIMIT 200`,
    status ? [status] : [],
  );
  res.json({ items: rows, checkItems: CHECK_ITEMS });
});

const reportSchema = z.object({
  status: z.enum(['scheduled', 'published', 'cancelled']),
  workshop: z.string().trim().max(120).optional().transform((v) => v || null),
  inspectedOn: z.preprocess((v) => v || undefined, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  mileage: z.preprocess((v) => (v === '' || v == null ? undefined : v), z.coerce.number().int().min(0).max(5_000_000).optional()),
  overall: z.preprocess((v) => v || undefined, z.enum(['excellent', 'good', 'fair', 'poor']).optional()),
  checklist: z.preprocess((v) => (typeof v === 'string' ? (() => { try { return JSON.parse(v || '{}'); } catch { return {}; } })() : v || {}), z.record(z.string(), z.string())),
  summary: z.string().trim().max(2000).optional().transform((v) => v || null),
});

/** PUT /api/admin/inspections/:id (multipart, optional "report" photo) – fill in and publish the report. */
router.put('/admin/inspections/:id', requireAuth, requireAdmin, upload.single('report'), async (req, res) => {
  const d = parse(reportSchema, req.body);
  const checklist = Object.fromEntries(Object.entries(d.checklist).filter(([k, v]) => CHECK_ITEMS.includes(k) && CHECK_VALUES.includes(v)));
  if (d.status === 'published' && (!d.workshop || !d.inspectedOn || !d.overall)) {
    throw badRequest('validation_error', { [!d.workshop ? 'workshop' : !d.inspectedOn ? 'inspectedOn' : 'overall']: 'required' });
  }
  const id = parseInt(req.params.id, 10) || 0;
  const fileUrl = req.file ? await saveFile(req.file) : null;
  const fileId = fileUrl ? Number(fileUrl.split('/').pop()) : null;
  const { rows } = await query(
    `UPDATE inspections SET status = $1, workshop = $2, inspected_on = $3, mileage = $4, overall = $5, checklist = $6, summary = $7,
       report_file_id = COALESCE($8, report_file_id), updated_at = now()
     WHERE id = $9 RETURNING id, product_id, status`,
    [d.status, d.workshop, d.inspectedOn ?? null, d.mileage ?? null, d.overall ?? null, checklist, d.summary, fileId, id],
  );
  if (!rows[0]) throw notFound();
  const p = (await query('SELECT seller_id, title FROM products WHERE id = $1', [rows[0].product_id])).rows[0];
  if (p && d.status !== 'scheduled') await notify(p.seller_id, `inspection_${d.status}`, { title: p.title }, `/products/${rows[0].product_id}`);
  res.json({ inspection: rows[0] });
});

export default router;
