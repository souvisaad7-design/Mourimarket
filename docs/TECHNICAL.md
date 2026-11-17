# MauriMarket – Technical documentation (v1.0)

## 1. Architecture

```
Browser (React SPA, AR/FR/EN, RTL/LTR)
   │  fetch /api/*  (JSON or multipart, Authorization: Bearer <JWT>)
   ▼
Express 5 API ── helmet (CSP), CORS, rate limits, Zod validation
   │   ├── /uploads  (static, product images / logos / avatars)
   │   └── frontend/dist (served in production → single deployable)
   ▼
PostgreSQL 16
```

* **Auth**: stateless JWT (default lifetime 7 days). On each request the user row is reloaded, so disabling an account takes effect immediately.
* **Roles**: anonymous *visitor*; authenticated *user*, who can both buy and sell (`account_type` = `individual` | `merchant`); and `role = admin`. Only merchants can own a store.
* **Moderation**: new listings start as `pending`. Editing a listing's content sends it back to `pending`. Set `AUTO_APPROVE=true` to skip review.
* **Notifications** are stored as `type` + JSON `data`, and the client renders the text in the user's language. Header badges are polled every 20 seconds, and an open conversation every 8 seconds. Websockets are a possible future upgrade.
* **Images**: as soon as a photo is picked, the browser resizes it to at most 1000 px wide and re-encodes it as WebP at quality 0.75 (`frontend/src/lib/image.js`, HTML5 Canvas). Browsers that cannot encode WebP fall back to JPEG. Re-encoding applies the EXIF orientation and strips metadata such as GPS location; the form shows each photo's size and the total saved. The server accepts JPEG, PNG and WebP up to 5 MB, with at most 8 per listing.

## 2. Database design

```
users 1──* products *──1 categories
  │  1──1 stores 1──* products
  │        products 1──* product_images
  ├──* favorites *──1 products
  ├──* conversations (buyer_id, seller_id) *──1 products
  │        conversations 1──* messages *──1 users (sender)
  ├──* reviews (reviewer_id, seller_id) 1──1 products   (UNIQUE product_id)
  ├──* reports *──1 products
  ├──* notifications
  └──* password_resets
```

| Table | Primary key | Foreign keys | Notes |
|---|---|---|---|
| users | id | – | `email` UNIQUE, bcrypt `password_hash`, `role`, `account_type`, `is_active` |
| categories | id | – | `slug` UNIQUE, `name_ar/fr/en`, `icon`, `sort_order` |
| stores | id | owner_id → users (CASCADE, UNIQUE) | one store per merchant, `slug` UNIQUE |
| products | id | seller_id → users, category_id → categories (RESTRICT), store_id → stores (SET NULL), sold_to_id → users | `price NUMERIC ≥ 0` (MRU), `status` pending/approved/rejected, `availability` available/sold |
| product_images | id | product_id → products (CASCADE) | `sort_order` (0 = cover) |
| favorites | (user_id, product_id) | both CASCADE | |
| conversations | id | product_id (SET NULL), buyer_id, seller_id | UNIQUE (product, buyer, seller), CHECK buyer ≠ seller |
| messages | id | conversation_id (CASCADE), sender_id | `read_at` for unread counts |
| reviews | id | product_id UNIQUE, reviewer_id, seller_id | rating 1–5. **Only allowed when `products.sold_to_id = reviewer`** |
| reports | id | reporter_id, product_id, handled_by | reason enum, status open/resolved/dismissed |
| notifications | id | user_id | `type`, `data JSONB`, `link`, `is_read` |
| password_resets | id | user_id | SHA-256 of a one-time token, valid for 1 hour |

The full DDL is in `backend/src/db/schema.sql`. Indexes cover the listing query (`status, availability, created_at`), category, seller, city, price, and per-user lookups.

### Documented sale → review

1. A buyer messages the seller about a listing, which creates a conversation.
2. The seller clicks **Mark sold** and picks that buyer. The API checks that the buyer has a conversation about this listing, then sets `sold_to_id`.
3. Only that buyer can leave one review for that listing (`reviews.product_id` UNIQUE).

This meets the spec's requirement to tie reviews to documented sales and so limit fake reviews.

### Paid verification & featuring (`upgrade_requests`)

1. A seller picks **verify account** (`VERIFY_PRICE`) or **feature a listing** for 7/15/30 days (`FEATURE_PLANS`, in `backend/src/lib/constants.js`), pays by mobile money (numbers in `frontend/src/siteConfig.js` → `SITE_PAYMENT`) and uploads the receipt photo.
2. The amount is always set by the server. One pending request per account (verify) or per listing (feature), enforced by partial unique indexes.
3. Receipts are stored in `files` with `is_private = true`: the public `/uploads/f/:id` route returns 404 for them; admins load them via `GET /admin/upgrade-requests/:id/receipt` (bearer token → blob URL).
4. An admin approves (sets `users.is_verified`, or extends `products.featured_until` by the paid days on top of any time left) or rejects with a reason; the seller is notified either way.

## 3. REST API

Base path `/api`. Errors look like `{ "error": "<code>", "fields": { "<field>": "<code>" } }`.
🔓 = public · 🔑 = logged in · 🛡 = admin

### Auth
| Method | Path | | Description |
|---|---|---|---|
| POST | /auth/register | 🔓 | `{name, email, password, phone?, accountType, city?}` → `{user, token}` |
| POST | /auth/login | 🔓 | `{email, password}` → `{user, token}` |
| GET | /auth/me | 🔑 | Current user (+ store) |
| PUT | /auth/me | 🔑 | Update profile (multipart, optional `avatar`) |
| PUT | /auth/me/password | 🔑 | `{currentPassword, newPassword}` |
| POST | /auth/forgot-password | 🔓 | Always `{ok:true}`; logs the reset link (and returns `devResetLink` outside production) |
| POST | /auth/reset-password | 🔓 | `{token, password}` |

### Listings
| Method | Path | | Description |
|---|---|---|---|
| GET | /products | 🔓 | Query params: `q, category (slug), city, minPrice, maxPrice, condition, sort=newest\|oldest\|price_asc\|price_desc, availability=available\|sold\|all, seller, store, page, limit` |
| GET | /products/:id | 🔓 | Detail. Pending or rejected listings are visible only to the owner and admins |
| GET | /products/mine | 🔑 | The seller's listings in every status, with stats |
| POST | /products | 🔑 | Multipart: `title, description, price, categoryId, city, condition, images[]` |
| PUT | /products/:id | 🔑 owner | Multipart, also takes `removeImageIds[]` |
| PATCH | /products/:id/availability | 🔑 owner | `{availability, soldToId?}` |
| GET | /products/:id/buyers | 🔑 owner | Users who messaged about this listing |
| DELETE | /products/:id | 🔑 owner/admin | |

### Public data
`GET /meta` (cities, report reasons) · `GET /categories` · `GET /stats/public` · `GET /users/:id` (profile + listings + reviews) · `GET /stores` · `GET /stores/:slug`

### Account (🔑)
| Method | Path | Description |
|---|---|---|
| GET/PUT | /stores/me | Read / create-or-update the merchant store (multipart `logo`) |
| GET | /favorites | Saved listings |
| POST/DELETE | /favorites/:productId | Add / remove |
| GET | /conversations | Inbox with last message and unread counts |
| POST | /conversations | `{productId, body}` starts a conversation or reuses an existing one |
| GET | /conversations/:id | Messages (marks them read) |
| POST | /conversations/:id/messages | `{body}` |
| GET | /notifications · /notifications/summary | List · badge counts |
| POST | /notifications/read-all · PATCH /notifications/:id/read | |
| POST | /reviews | `{productId, rating, comment?}` (documented sale only) |
| POST | /reports | `{productId, reason, details?}` |
| GET | /upgrade-requests | The user's own verification/featuring requests |
| POST | /upgrade-requests | multipart: `kind` (verify\|feature), `productId?`, `days?`, `paymentMethod`, `paymentRef?`, `note?`, `receipt` (image) – sellers only |

### Admin (🛡)
`GET /admin/stats` · `GET /admin/users?q&page` · `PATCH /admin/users/:id {isActive?, role?, accountType?}` · `GET /admin/products?status&q&page` · `PATCH /admin/products/:id/status {status, reason?}` · `DELETE /admin/products/:id` · `POST/PUT/DELETE /admin/categories[/:id]` · `GET /admin/reports?status` · `PATCH /admin/reports/:id {status}` · `GET /admin/stores` · `PATCH /admin/stores/:id {isActive}` · `GET /admin/upgrade-requests?status&kind&page` · `GET /admin/upgrade-requests/:id/receipt` · `PATCH /admin/upgrade-requests/:id {status: approved|rejected, note?}`

## 4. Security

* Passwords are hashed with bcrypt (cost 12) and never returned by the API. A dummy hash comparison keeps login timing uniform, so attackers cannot learn which emails exist.
* Parameterised SQL everywhere. `ILIKE` wildcards in search terms are escaped.
* Every request body and query is validated with Zod. Uploads are limited by type, size and count.
* Ownership checks guard every write to a listing. Admin routes require `role = admin`.
* Rate limits: 30 attempts per 15 minutes on login, registration and password reset (production), and 30 writes per minute per user on messages, reports and reviews.
* Helmet security headers include a strict Content-Security-Policy.
* Password-reset tokens are random 256-bit values, stored as a SHA-256 hash, single-use, and expire after one hour. The API gives the same answer whether or not an email exists.
* `JWT_SECRET` is mandatory when `NODE_ENV=production`.

## 5. Configuration (`backend/.env`)

| Variable | Default | |
|---|---|---|
| PORT | 4000 | |
| DATABASE_URL | postgres://mauri:mauri@localhost:5432/maurimarket | |
| JWT_SECRET | dev value | **set a long random value in production** |
| JWT_EXPIRES_IN | 7d | |
| CORS_ORIGIN | http://localhost:5173 | comma-separated; also used to build reset links |
| UPLOAD_DIR | uploads | |
| AUTO_APPROVE | false | |
| ADMIN_EMAIL / ADMIN_PASSWORD | admin@maurimarket.mr / Admin12345 | used by the seed script (password **required** in production) |
| DB_SSL | auto | TLS to the database; on for any non-localhost URL |
| SEED_DEMO | false in production | load demo users and listings |
| DB_POOL_MAX | 10 | connection pool size |

## 6. Deployment

Two ready-made setups, with step-by-step instructions in Arabic in [DEPLOY.md](DEPLOY.md):

* **Vercel + Supabase** (`vercel.json`, `api/index.js`): the React build is served as static files and Express runs as one serverless function. Migrations and seeding run during the build. `POSTGRES_URL` from the Supabase integration is accepted; `sslmode` and `supa` params are stripped so `pg` uses our TLS settings. Request bodies are capped at 4.5 MB, so photos are compressed in the browser first.
* **Render + Supabase** (`render.yaml`): one long-running web service.

* Uploaded images live in the `files` table (BYTEA), so the app needs no persistent disk. The server checks each upload's real type from its magic bytes (JPEG, PNG or WebP only), and serves files with a long cache lifetime.
* Startup runs `db:migrate` (idempotent DDL) and then `db:seed`. The seed does nothing once categories exist. In production it creates only the categories and the admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, required). `SEED_DEMO=true` loads demo data instead.
* TLS to the database is enabled automatically for any non-localhost `DATABASE_URL` (override with `DB_SSL`). With Supabase, use the **Session pooler** connection string, because Render's free tier has no IPv6.
* Any other host works the same way: `npm run install:all && npm run build`, set the variables, then `npm start` behind HTTPS.

## 7. Known limits of v1 / next steps

* Password-reset emails are **logged, not sent**. Connect an SMTP or SMS provider in `routes/auth.js` (`forgot-password`).
* Live updates use polling. Socket.IO would make messaging instant.
* Images are stored in PostgreSQL. This is simple and durable for an MVP. At scale, move them to object storage (e.g. Supabase Storage or S3) and add server-side thumbnails.
* Search uses `ILIKE`. For large catalogues, add `pg_trgm` or a full-text index.
* Future features from §17 of the spec: mobile apps, online payment, delivery, seller identity verification, paid promotion, merchant analytics, recommendations.
