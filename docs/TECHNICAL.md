# Souk Chinguetti – Technical documentation (v1.0)

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

### Admin area (full control)

The admin area is a separate part of the app at `/admin`, with its own sign-in page (`/admin/login`, email + password) and its own layout (sidebar, no public header or footer). It is loaded on demand, so visitors never download it. Sections:

| Group | Sections |
|---|---|
| Review | Listings (approve, reject, feature, **edit**, delete), merchant requests, reports, paid requests (only when `PAID_UPGRADES=true`) |
| Manage | Users (edit details, account type, verify, disable, reset password, make admin, **delete**), stores (**edit**, disable, **delete**), categories, reviews (**delete**), files (every uploaded image, where it is used, **delete**) |
| Website | Settings, texts, site map |
| Account | The admin's own name, sign-in email and password (current password required) |

**Site settings** live in the `site_settings` table (one JSON document per section, validated by `backend/src/lib/settings.js`) and are served publicly by `GET /api/settings`:
`contact` (email, WhatsApp, phone, address), `social` (https links shown in the footer), `announcement` (bar on top of every page: on/off, colour, link; its text is the `announcement.text` key), `features` (`registration` open/closed, `autoApprove` listings — replaces the `AUTO_APPROVE` env var at runtime), `payment` (mobile-money numbers), and `texts`.

**Texts**: `texts.{ar,fr,en}` maps any translation key (e.g. `brand.tagline`, `hero.s1Title`) to a replacement. The frontend's `t()` uses an override first, then the built-in text, so every text on the site can be changed from the panel without a deploy.

Endpoints: `GET/PUT /admin/settings` · `PUT /admin/account {currentPassword, name?, email?, newPassword?}` · `PUT /admin/users/:id/profile` · `DELETE /admin/users/:id` (not yourself, not an admin) · `PUT/DELETE /admin/stores/:id` · `GET /admin/reviews` · `DELETE /admin/reviews/:id` · `GET /admin/files?filter=unused` · `DELETE /admin/files/:id` (also detaches it from the listing / avatar / logo).

**Dynamic data (database, read by the whole site)**

| Table | What | Edited in |
|---|---|---|
| `site_settings` | One JSON row per section: `appearance` (site name, logo, primary/secondary colour), `maintenance` (on/off + message), `pricing` (verification price, VIP plans), `features` (sign-ups, auto-approve, **paid services on/off**), `payment` (Bankily / Masrvi / Sedad numbers), `contact` (support WhatsApp, email, phone, address), `social`, `announcement` (on/off, colour, **still or scrolling**, link), `menu`, `texts` | Admin → Identity & appearance · Alert bar · Payments · General settings · Menus · Texts |
| `banners` | Home-page slider (title/subtitle/button in 3 languages, background image, link, visible, order) | Admin → Banners |
| `categories` | Categories (names, emoji icon, order) | Admin → Categories |
| `cities` | Cities / wilayas used by filters and forms (seeded once from `CITIES`; hide instead of delete when in use) | Admin → Cities |
| `pages` | Custom pages | Admin → Pages |

The browser loads `GET /api/settings` (settings + visible banners) and `GET /api/meta` (active cities, prices) at start-up and again whenever the visitor returns to the tab, so a change saved in `/admin` reaches visitors without a deploy. Colours are CSS variables (`--brand-*`, `--gold-*`, see `index.css` and `lib/theme.js`): the admin's colours generate the whole shade range at runtime.

**Maintenance mode**: visitors see the maintenance page; the API keeps answering reads but refuses changes (`503 maintenance`) except for admins and sign-in.

**Row-level security**: RLS is on for every table. On Supabase, `site_settings`, `banners`, `categories`, `cities` and published `pages` have a `public_read` SELECT policy for the `anon` / `authenticated` roles and no write policy, so Supabase's public API can read them but never change them. All writes go through this app's API, which connects as the table owner and requires an admin token (`requireAdmin`) for every `/api/admin/*` route.

**Geolocation (near me, maps, distances)**

- *Listings*: `products.lat/lng` (optional pin), `area` (moughataa), `district` (neighbourhood), `loc_exact`. The API never returns the raw pin to buyers: `map_lat/map_lng` are exact only when `loc_exact`, otherwise rounded to 2 decimals (~1 km); `loc_precision` is `exact`, `approx` or `city` (no pin → city centre). The seller and admins get `pin_lat/pin_lng` on the listing detail to edit it.
- *Distance*: `mm_distance_km()` (SQL haversine). `GET /api/products?lat&lng` adds `distance_km` (pin or city centre), `&radius=` keeps listings within N km, `&sort=distance` orders by it. Distances to hidden pins are rounded to 0.5 km (never below 0.5) so they can't be used to find the pin; sorting uses the shown value. `GET /api/products/:id?lat&lng` returns the distance too.
- *Visitor position*: asked with the browser's Geolocation API only when the visitor presses «📍 تحديد موقعي». It is kept on the device (`localStorage`, rounded to ~100 m), sent to the API rounded to ~1 km and never stored server-side; the radius goes in the URL, never the coordinates. Visitors who refuse pick a city / moughataa by hand (distances then use its centre).
- *Place names*: `POST /api/geo/reverse {lat,lng,lang}` (rate-limited, coordinates rounded to ~100 m) returns the nearest city (`cities.lat/lng`), the Nouakchott moughataa (`AREAS` in `lib/constants.js`) and, when OpenStreetMap's Nominatim answers within 2.5 s, the neighbourhood. `GET /api/geo/areas` lists the moughataas for manual choice.
- *Maps*: Leaflet + OpenStreetMap tiles (`components/MapLeaflet.jsx`, loaded on demand). Used in the product list (map view), the listing page (exact pin or ~1 km circle), the listing form (click / drag to place the pin) and Admin → Cities (city centre). The CSP allows `tile.openstreetmap.org` images.

**Shaping the public site** (all from the panel, no deploy):
- **Banners** (`/admin/banner`, table `banners`, `GET/PUT /admin/banners`): up to 10 slides, each with an uploaded image, title/text/button in AR/FR/EN, link and on/off. No slides = the built-in four.
- **Menus & links** (`/admin/menus`, settings `menu`): ordered top-menu and footer lists of built-in links (`frontend/src/lib/menus.js`) or custom links (to a page, a path or an https site); `null` = the built-in lists. `menu.home` shows/hides each home-page section.
- **Pages** (`/admin/pages`, table `pages`): pages at `/p/:slug` with a cover image and a body in AR/FR/EN, written in a tiny safe format (`## heading`, `- list`, `**bold**`, `[text](/link)`, `![](/uploads/f/N)` image) rendered by `components/RichText.jsx` without injecting HTML. Drafts are hidden. Public: `GET /api/pages`, `GET /api/pages/:slug`; admin: `GET/POST/PUT/DELETE /admin/pages`.
- **Images**: `POST /admin/uploads` (field `file`) stores a public image and returns its URL; the Files page uploads with it too.
- **Adding**: `POST /admin/users` creates any account (merchants are approved at once); `POST /api/products` with `sellerId` lets an admin post a listing in another user's name, live immediately (`/admin/listings/new`, user picker `GET /admin/users/pick?q=`).

The source code itself is not editable from the browser: the site runs on Vercel, where code is fixed at build time. Code changes go through the GitHub repository.

### Merchant accounts are approved by an admin

1. Choosing **merchant** at sign-up, in the profile or from "become a seller" does not make the account a merchant: it becomes an `individual` seller with `users.merchant_status = 'pending'` (it can still post ads, which are moderated anyway), and every admin is notified.
2. Admins review the queue in **Admin → Merchant requests** (`GET /admin/merchant-requests?status`), with phone, city, bio, listing and report counts.
3. `PATCH /admin/merchant-requests/:id {status: approved}` sets `account_type = 'merchant'` (store creation is unlocked); `{status: rejected, note}` keeps the account individual and stores the reason. The seller is notified either way and can apply again from the profile. Choosing another account type withdraws a pending request.
4. Merchants that existed before this feature are marked `approved` by the migration.

### Paid verification & featuring (`upgrade_requests`)

> **Off by default — the site is free.** The feature is only active when the environment variable `PAID_UPGRADES=true` is set (Vercel → Settings → Environment Variables, then redeploy). When off, `/api/meta` returns `upgrades: null`, the request endpoints return 404, and the seller panel and admin tab are hidden. Admins can still verify accounts and feature listings for free from the Users and Listings tabs.

1. A seller picks **verify account** (`VERIFY_PRICE`) or **feature a listing** for 7/15/30 days (`FEATURE_PLANS`, in `backend/src/lib/constants.js`), pays by mobile money (numbers set in Admin → Site settings → Payment numbers) and uploads the receipt photo.
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
