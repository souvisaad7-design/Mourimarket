import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { config } from '../config.js';
import { MAX_IMAGES } from '../lib/constants.js';
import { badRequest } from '../lib/http.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${EXT[file.mimetype]}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_IMAGES },
  fileFilter: (_req, file, cb) => {
    if (!EXT[file.mimetype]) return cb(badRequest('invalid_image_type'));
    cb(null, true);
  },
});

export const fileUrl = (file) => `/uploads/${file.filename}`;

/** Delete files from disk that belong to /uploads (ignores external URLs). */
export function removeUploads(urls) {
  for (const url of urls) {
    if (!url?.startsWith('/uploads/')) continue;
    const p = path.join(config.uploadDir, path.basename(url));
    fs.promises.unlink(p).catch(() => {});
  }
}
