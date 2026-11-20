import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import { config } from './config.js';
import { HttpError } from './lib/http.js';
import { serveFile } from './middleware/upload.js';
import accountRoutes from './routes/account.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import { getSettings } from './lib/settings.js';
import { optionalAuth } from './middleware/auth.js';
import publicRoutes from './routes/public.js';
import geoRoutes from './routes/geo.js';
import orderRoutes from './routes/orders.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        // blob: is needed for local previews of photos before upload.
        // OpenStreetMap tiles for the maps (Leaflet).
        'img-src': ["'self'", 'data:', 'blob:', 'https://tile.openstreetmap.org', 'https://*.tile.openstreetmap.org'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      },
    },
  }));
  app.use(cors({ origin: config.corsOrigin.split(','), credentials: false }));
  app.use(express.json({ limit: '200kb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan(config.isProd ? 'combined' : 'dev'));

  app.get('/uploads/f/:id', serveFile);
  app.use('/uploads', express.static(config.uploadDir, { maxAge: '30d', immutable: true }));

  // Brute-force protection on credential endpoints.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.isProd ? 30 : 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'too_many_requests' },
  });

  // API answers depend on who asks: never let a browser or proxy cache them
  // (routes that are safe to cache set their own Cache-Control).
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  // Maintenance mode (Admin → Identity & appearance): visitors can read, only admins can change things.
  app.use('/api', async (req, res, next) => {
    try {
      if (req.method === 'GET' || req.path.startsWith('/auth/login') || req.path.startsWith('/admin')) return next();
      if (!(await getSettings()).maintenance.enabled) return next();
      await new Promise((resolve) => optionalAuth(req, res, resolve));
      if (req.user?.role === 'admin') return next();
      return res.status(503).json({ error: 'maintenance' });
    } catch (err) { return next(err); }
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/geo', geoRoutes);
  app.use('/api', orderRoutes);
  app.use('/api', publicRoutes);
  app.use('/api', accountRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

  // Serve the built React app in production (single deployable).
  if (fs.existsSync(path.join(config.frontendDist, 'index.html'))) {
    app.use(express.static(config.frontendDist, { maxAge: '1h' }));
    app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(path.join(config.frontendDist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.code, fields: err.details });
    }
    if (err instanceof multer.MulterError) {
      const code = err.code === 'LIMIT_FILE_SIZE' ? 'image_too_large' : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE' ? 'too_many_images' : 'upload_error';
      return res.status(400).json({ error: code });
    }
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid_json' });
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  });

  return app;
}
