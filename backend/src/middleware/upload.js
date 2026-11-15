// Uploaded images are stored in PostgreSQL (table `files`), not on local disk,
// so they survive restarts/redeploys on hosts with an ephemeral filesystem.
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { config } from '../config.js';
import { query } from '../db.js';
import { MAX_IMAGES } from '../lib/constants.js';
import { badRequest } from '../lib/http.js';

const MIME = ['image/jpeg', 'image/png', 'image/webp'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_IMAGES },
  fileFilter: (_req, file, cb) => {
    if (!MIME.includes(file.mimetype)) return cb(badRequest('invalid_image_type'));
    cb(null, true);
  },
});

/** Detect the real image type from its first bytes (never trust the client's mimetype). */
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

/**
 * Save an uploaded file and return its public URL. Pass a transaction client
 * so the file is rolled back together with the row that references it.
 */
export async function saveFile(file, client = { query }) {
  const mime = sniff(file.buffer);
  if (!mime) throw badRequest('invalid_image_type');
  const { rows } = await client.query('INSERT INTO files (mime, data) VALUES ($1, $2) RETURNING id', [mime, file.buffer]);
  return `/uploads/f/${rows[0].id}`;
}

/** Store a non-user file such as seed artwork. */
export async function saveRaw(buffer, mime, client = { query }) {
  const { rows } = await client.query('INSERT INTO files (mime, data) VALUES ($1, $2) RETURNING id', [mime, buffer]);
  return `/uploads/f/${rows[0].id}`;
}

/** Delete stored files by URL (database files, and legacy files on disk). */
export function removeUploads(urls) {
  const ids = [];
  for (const url of urls) {
    if (!url) continue;
    const m = /^\/uploads\/f\/(\d+)$/.exec(url);
    if (m) ids.push(Number(m[1]));
    else if (url.startsWith('/uploads/')) {
      fs.promises.unlink(path.join(config.uploadDir, path.basename(url))).catch(() => {});
    }
  }
  if (ids.length) query('DELETE FROM files WHERE id = ANY($1::int[])', [ids]).catch(() => {});
}

/** Express handler for GET /uploads/f/:id */
export async function serveFile(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(404).end();
  const { rows } = await query('SELECT mime, data FROM files WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).end();
  res.set({
    'Content-Type': rows[0].mime,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(rows[0].data);
}
