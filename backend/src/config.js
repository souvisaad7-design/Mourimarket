import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

export const config = {
  isProd,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || 'postgres://mauri:mauri@localhost:5432/maurimarket',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173',
  uploadDir: path.resolve(root, process.env.UPLOAD_DIR || 'uploads'),
  // When true, new and edited listings go live immediately (no admin review).
  autoApprove: process.env.AUTO_APPROVE === 'true',
  dbSsl: process.env.DB_SSL ? process.env.DB_SSL === 'true' : !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || 'localhost'),
  frontendDist: path.resolve(root, '../frontend/dist'),
};
