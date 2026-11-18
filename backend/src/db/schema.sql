-- MauriMarket – PostgreSQL schema
-- All prices are stored in MRU (Mauritanian ouguiya, new).

-- Uploaded images (stored in the database so they survive redeploys).
CREATE TABLE IF NOT EXISTS files (
  id          SERIAL PRIMARY KEY,
  mime        VARCHAR(40) NOT NULL,
  data        BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(160) NOT NULL UNIQUE,
  phone          VARCHAR(30),
  password_hash  TEXT NOT NULL,
  role           VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  account_type   VARCHAR(12) NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual','merchant')),
  city           VARCHAR(40),
  bio            TEXT,
  avatar_url     TEXT,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(60) NOT NULL UNIQUE,
  name_ar     VARCHAR(80) NOT NULL,
  name_fr     VARCHAR(80) NOT NULL,
  name_en     VARCHAR(80) NOT NULL,
  icon        VARCHAR(16),
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stores (
  id           SERIAL PRIMARY KEY,
  owner_id     INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  slug         VARCHAR(120) NOT NULL UNIQUE,
  logo_url     TEXT,
  description  TEXT,
  phone        VARCHAR(30),
  whatsapp     VARCHAR(30),
  email        VARCHAR(160),
  city         VARCHAR(40),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id                SERIAL PRIMARY KEY,
  seller_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id       INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  store_id          INTEGER REFERENCES stores(id) ON DELETE SET NULL,
  title             VARCHAR(140) NOT NULL,
  description       TEXT NOT NULL,
  price             NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  city              VARCHAR(40) NOT NULL,
  condition         VARCHAR(10) NOT NULL DEFAULT 'used' CHECK (condition IN ('new','used')),
  status            VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  availability      VARCHAR(10) NOT NULL DEFAULT 'available' CHECK (availability IN ('available','sold')),
  rejection_reason  TEXT,
  sold_to_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sold_at           TIMESTAMPTZ,
  views             INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_listing ON products(status, availability, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_city ON products(city);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

CREATE TABLE IF NOT EXISTS product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

CREATE TABLE IF NOT EXISTS favorites (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id               SERIAL PRIMARY KEY,
  product_id       INTEGER REFERENCES products(id) ON DELETE SET NULL,
  buyer_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (buyer_id <> seller_id),
  UNIQUE (product_id, buyer_id, seller_id)
);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);

CREATE TABLE IF NOT EXISTS messages (
  id               SERIAL PRIMARY KEY,
  conversation_id  INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- A review is only possible for a documented sale: products.sold_to_id = reviewer.
CREATE TABLE IF NOT EXISTS reviews (
  id           SERIAL PRIMARY KEY,
  product_id   INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  reviewer_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (reviewer_id <> seller_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);

CREATE TABLE IF NOT EXISTS reports (
  id           SERIAL PRIMARY KEY,
  reporter_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reason       VARCHAR(20) NOT NULL CHECK (reason IN ('scam','prohibited','wrong_category','duplicate','offensive','other')),
  details      TEXT,
  status       VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  handled_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(30) NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ---------------------------------------------------------------------------
-- v1.1 additions (safe to re-run on an existing database)
-- ---------------------------------------------------------------------------

-- Verified sellers (badge granted by an admin).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Featured listings: shown first with a badge until this date.
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured_until) WHERE featured_until IS NOT NULL;

-- Special offers: optional price before discount (shown struck through).
ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price NUMERIC(14,2) CHECK (old_price IS NULL OR old_price >= 0);
CREATE INDEX IF NOT EXISTS idx_products_deals ON products(created_at DESC) WHERE old_price IS NOT NULL;

-- Category icons closer to the new design.
UPDATE categories SET icon = '💼' WHERE slug = 'services' AND icon = '🤝';

-- v1.3: buyers vs sellers, phone-number login ----------------------------------
-- account_type: 'buyer' (cannot post ads), 'individual' (seller), 'merchant' (seller with a store).
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_type_check;
ALTER TABLE users ADD CONSTRAINT users_account_type_check CHECK (account_type IN ('buyer', 'individual', 'merchant'));
ALTER TABLE users ALTER COLUMN account_type SET DEFAULT 'buyer';
-- Log in with a phone number; email becomes optional.
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
-- Canonical phone format +222XXXXXXXX (only rewrites values that clearly are Mauritanian numbers).
UPDATE users SET phone = '+222' || right(regexp_replace(phone, '[^0-9]', '', 'g'), 8)
  WHERE phone IS NOT NULL AND phone !~ '^\+222[234][0-9]{7}$'
    AND regexp_replace(phone, '[^0-9]', '', 'g') ~ '^(00222|222)?[234][0-9]{7}$';
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users(phone) WHERE phone IS NOT NULL;

-- Search normalisation: lower-case; unify Arabic letter variants (أ إ آ ٱ → ا, ة → ه,
-- ى → ي, ؤ → و, ئ → ي); drop tashkeel/tatweel; strip French accents.
CREATE OR REPLACE FUNCTION mm_normalize(t text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $fn$
  SELECT regexp_replace(
    translate(lower(coalesce(t, '')),
      'أإآٱةىؤئéèêëàâäîïôöùûüç',
      'ااااهيويeeeeaaaiioouuuc'),
    '[ً-ْـ]', '', 'g')
$fn$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS search_text TEXT
  GENERATED ALWAYS AS (mm_normalize(title || ' ' || description)) STORED;

-- Typo-tolerant search uses pg_trgm when it is available (it is on Supabase).
DO $do$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'pg_trgm could not be created by this role; ask an admin to install it';
  END;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_search_trgm ON products USING gin (search_text gin_trgm_ops)';
    EXCEPTION WHEN undefined_object THEN
      RAISE NOTICE 'gin_trgm_ops not on search_path; skipping trigram index';
    END;
  END IF;
END
$do$;

-- Supabase exposes the public schema through its REST API (PostgREST) to anyone
-- holding the public anon key. Enabling RLS with no policies blocks that API
-- entirely; the app connects as the table owner, which bypasses RLS.
ALTER TABLE files            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;

-- ---------- Verification & featuring requests (paid, reviewed by an admin) ----------
-- Private files (payment receipts) are never served by the public /uploads route.
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS upgrade_requests (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL CHECK (kind IN ('verify', 'feature')),
  product_id      INT REFERENCES products(id) ON DELETE CASCADE,
  days            INT CHECK (days IS NULL OR days > 0),
  amount          INT NOT NULL CHECK (amount >= 0),
  payment_method  TEXT NOT NULL,
  payment_ref     TEXT,
  note            TEXT,
  receipt_file_id INT REFERENCES files(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note      TEXT,
  reviewed_by     INT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (kind = 'verify' OR (product_id IS NOT NULL AND days IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON upgrade_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_user ON upgrade_requests(user_id, created_at DESC);
-- At most one pending request per account (verify) or per listing (feature).
CREATE UNIQUE INDEX IF NOT EXISTS upgrade_requests_one_pending_verify ON upgrade_requests(user_id) WHERE status = 'pending' AND kind = 'verify';
CREATE UNIQUE INDEX IF NOT EXISTS upgrade_requests_one_pending_feature ON upgrade_requests(product_id) WHERE status = 'pending' AND kind = 'feature';
ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;

-- ---------- Merchant accounts are reviewed by an admin ----------
-- Choosing "merchant" puts the account in a queue (merchant_status = 'pending'); it stays an
-- individual seller until an admin approves it. Existing merchants are approved already.
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_status TEXT;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_merchant_status_check;
ALTER TABLE users ADD CONSTRAINT users_merchant_status_check CHECK (merchant_status IS NULL OR merchant_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_note TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_requested_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_reviewed_by INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS merchant_reviewed_at TIMESTAMPTZ;
UPDATE users SET merchant_status = 'approved' WHERE account_type = 'merchant' AND merchant_status IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_merchant_status ON users(merchant_status, merchant_requested_at);

-- ---------- Site settings edited from the admin panel ----------
-- One JSON document per section (contact, social, announcement, features, payment, texts).
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  INT REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ---------- Custom pages the admin creates (terms, privacy, offers…) ----------
CREATE TABLE IF NOT EXISTS pages (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(80) NOT NULL UNIQUE,
  title         JSONB NOT NULL,           -- {ar, fr, en}
  body          JSONB NOT NULL,           -- {ar, fr, en}, simple text formatting
  cover_url     TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
