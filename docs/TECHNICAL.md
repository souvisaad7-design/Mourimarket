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
* **Images**: the browser downsizes each photo to at most 1600 px as a JPEG before upload. The server accepts JPEG, PNG and WebP up to 5 MB, with at most 8 per listing.

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

### Admin (🛡)
`GET /admin/stats` · `GET /admin/users?q&page` · `PATCH /admin/users/:id {isActive?, role?, accountType?}` · `GET /admin/products?status&q&page` · `PATCH /admin/products/:id/status {status, reason?}` · `DELETE /admin/products/:id` · `POST/PUT/DELETE /admin/categories[/:id]` · `GET /admin/reports?status` · `PATCH /admin/reports/:id {status}` · `GET /admin/stores` · `PATCH /admin/stores/:id {isActive}`

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
| ADMIN_EMAIL / ADMIN_PASSWORD | admin@maurimarket.mr / Admin12345 | used by the seed script |

## 6. Deployment

1. Provision PostgreSQL and create the database.
2. `npm run install:all && npm run build`
3. Set `NODE_ENV=production` and the variables above, then run `npm --prefix backend run db:migrate` and, once, `db:seed` for the categories and admin account.
4. `npm start` behind a reverse proxy (nginx/Caddy) with HTTPS. Persist `backend/uploads/` on disk, or move it to object storage later.

## 7. Known limits of v1 / next steps

* Password-reset emails are **logged, not sent**. Connect an SMTP or SMS provider in `routes/auth.js` (`forgot-password`).
* Live updates use polling. Socket.IO would make messaging instant.
* Images are stored on local disk. For scale, use S3-compatible storage and server-side thumbnails.
* Search uses `ILIKE`. For large catalogues, add `pg_trgm` or a full-text index.
* Future features from §17 of the spec: mobile apps, online payment, delivery, seller identity verification, paid promotion, merchant analytics, recommendations.
