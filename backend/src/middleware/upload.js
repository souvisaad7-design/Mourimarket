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

/**
 * Save a private upload (e.g. a payment receipt) and return its file id.
 * Private files are never served by the public /uploads route.
 */
export async function savePrivateFile(file, client = { query }) {
  const mime = sniff(file.buffer);
  if (!mime) throw badRequest('invalid_image_type');
  const { rows } = await client.query('INSERT INTO files (mime, data, is_private) VALUES ($1, $2, true) RETURNING id', [mime, file.buffer]);
  return rows[0].id;
}

/** Real type of a voice note (browsers record webm/ogg; iPhone records mp4/aac). */
function sniffAudio(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'audio/webm';
  if (buf.toString('ascii', 0, 4) === 'OggS') return 'audio/ogg';
  if (buf.toString('ascii', 4, 8) === 'ftyp') return 'audio/mp4';
  if (buf.toString('ascii', 0, 3) === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0 && (buf[1] & 0x06) !== 0)) return 'audio/mpeg';
  if (buf[0] === 0xff && (buf[1] & 0xf6) === 0xf0) return 'audio/aac';
  return null;
}

/** Chat attachments: one photo or one voice note (≤ 5 MB), checked by content. */
export const chatUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!/^(image|audio|video\/webm)/.test(file.mimetype)) return cb(badRequest('invalid_file_type'));
    cb(null, true);
  },
});

/** Save a chat photo / voice note as a private file. Returns { id, kind }. */
export async function saveChatMedia(file, client = { query }) {
  const image = sniff(file.buffer);
  const audio = image ? null : sniffAudio(file.buffer);
  if (!image && !audio) throw badRequest('invalid_file_type');
  const { rows } = await client.query('INSERT INTO files (mime, data, is_private) VALUES ($1, $2, true) RETURNING id', [image || audio, file.buffer]);
  return { id: rows[0].id, kind: image ? 'image' : 'audio' };
}

/** Save a public voice recording (a listing's spoken description). Returns its URL. */
export async function saveVoice(file, client = { query }) {
  const audio = sniffAudio(file.buffer);
  if (!audio) throw badRequest('invalid_file_type');
  const { rows } = await client.query('INSERT INTO files (mime, data) VALUES ($1, $2) RETURNING id', [audio, file.buffer]);
  return `/uploads/f/${rows[0].id}`;
}

/** Send a stored file (public or private) with safe headers. */
export async function sendFile(res, id, { isPrivate = false } = {}) {
  const { rows } = await query('SELECT mime, data FROM files WHERE id = $1 AND is_private = $2', [id, isPrivate]);
  if (!rows[0]) return res.status(404).end();
  res.set({
    'Content-Type': rows[0].mime,
    'Accept-Ranges': 'none',
    'Cache-Control': isPrivate ? 'private, no-store' : 'public, max-age=31536000, s-maxage=31536000, immutable',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    'X-Content-Type-Options': 'nosniff',
  });
  return res.send(rows[0].data);
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

// Smaller copies for listing cards and data-saver mode (?w=240 or ?w=480). Made once per size, then
// served from the CDN cache (immutable): cards download ~15–30 KB instead of the full photo.
const THUMB_WIDTHS = new Set([240, 480]);

/** Express handler for GET /uploads/f/:id[?w=240|480] */
export async function serveFile(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(404).end();
  const w = parseInt(req.query.w, 10);
  if (!THUMB_WIDTHS.has(w)) return sendFile(res, id);
  const { rows } = await query('SELECT mime, data FROM files WHERE id = $1 AND is_private = false', [id]);
  if (!rows[0]) return res.status(404).end();
  if (!/^image\/(jpeg|png|webp)$/.test(rows[0].mime)) return sendFile(res, id);
  let out;
  try {
    const sharp = (await import('sharp')).default;
    out = await sharp(rows[0].data).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: w <= 240 ? 55 : 65 }).toBuffer();
  } catch {
    return sendFile(res, id); // unreadable image: send the original
  }
  res.set({
    'Content-Type': 'image/webp',
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    'X-Content-Type-Options': 'nosniff',
  });
  return res.send(out);
}
