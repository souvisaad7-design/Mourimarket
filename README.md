# MauriMarket

**سوقك الموريتاني في مكان واحد** — Mauritanian online marketplace (v1.0).

Individuals and merchants post listings (vehicles, phones, real estate, furniture, services…), buyers search, save favorites and message sellers directly. Payment and delivery happen outside the platform, as the spec requires for v1. Prices are in **MRU**. The UI comes in **Arabic (RTL, default)**, **French** and **English**.

| Layer | Stack |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS 3, Vite 5 |
| Backend | Node.js 22, Express 5, REST API, JWT auth, Zod validation, Multer uploads |
| Database | PostgreSQL 16 (11 tables from the spec + `password_resets`) |

## Quick start

Requirements: Node.js ≥ 20 and PostgreSQL ≥ 14.

```bash
# 1. Database
sudo -u postgres psql -c "CREATE USER mauri WITH PASSWORD 'mauri' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE maurimarket OWNER mauri;"

# 2. Install & configure
npm run install:all
cp backend/.env.example backend/.env      # edit JWT_SECRET, DATABASE_URL…

# 3. Create tables + demo data
npm run db:reset

# 4. Run (two terminals)
npm run dev:api     # API on http://localhost:4000
npm run dev:web     # Web on http://localhost:5173 (proxies /api and /uploads)
```

**Production / single server:** run `npm run build` and then `npm start`. Express serves the built React app and the API on the same port.

### Demo accounts (after `db:reset`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@maurimarket.mr` | `Admin12345` |
| Seller (individual) | `mohamed@example.mr` | `Password123` |
| Merchant + store | `amana@example.mr`, `fatimetou@example.mr` | `Password123` |
| Buyer | `buyer@example.mr` | `Password123` |

Change the admin credentials with `ADMIN_EMAIL` and `ADMIN_PASSWORD` before seeding a real deployment.

## Tests

```bash
npm run db:reset && npm test
```

The 15 API integration tests cover: registration/login, permissions (visitor, user, admin), creating a listing with an image, moderation, search, filters and sort, favorites, messaging, reviews limited to documented sales, reports, merchant stores, ownership checks, password reset, and disabled accounts.

## Project layout

```
backend/
  src/app.js            Express app (security headers, rate limits, routes, errors)
  src/routes/           auth · products · public (categories, users, stores) · account · admin
  src/db/schema.sql     PostgreSQL schema (PK/FK/constraints/indexes)
  src/db/seed.js        Categories, demo users, stores, listings
  test/api.test.js      Integration tests
frontend/
  src/pages/            Every page in the site map (public, user, admin)
  src/i18n/messages.js  AR / FR / EN strings
docs/
  TECHNICAL.md          Architecture, database design, API reference, security
  USER_GUIDE.md         دليل استخدام المنصة (Arabic user guide)
```

See [docs/TECHNICAL.md](docs/TECHNICAL.md) for the full technical documentation.
