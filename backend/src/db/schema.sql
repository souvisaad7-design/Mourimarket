-- Souk Chinguetti (سوق شنقيط) – PostgreSQL schema
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

-- ---------- Banners (home page slider), edited in Admin → Banners ----------
CREATE TABLE IF NOT EXISTS banners (
  id          SERIAL PRIMARY KEY,
  title       JSONB NOT NULL DEFAULT '{}',   -- {ar, fr, en}
  subtitle    JSONB NOT NULL DEFAULT '{}',
  cta         JSONB NOT NULL DEFAULT '{}',
  link        TEXT NOT NULL DEFAULT '/products',
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Slides saved earlier in site_settings move to the table once.
INSERT INTO banners (title, subtitle, cta, link, image_url, is_active, sort_order)
SELECT COALESCE(s->'title', '{}'), COALESCE(s->'text', '{}'), COALESCE(s->'cta', '{}'), COALESCE(NULLIF(s->>'link', ''), '/products'),
       NULLIF(s->>'image', ''), COALESCE((s->>'enabled')::boolean, true), (ord * 10)::int
FROM site_settings st, jsonb_array_elements(st.value->'slides') WITH ORDINALITY AS t(s, ord)
WHERE st.key = 'hero' AND NOT EXISTS (SELECT 1 FROM banners);
DELETE FROM site_settings WHERE key = 'hero';

-- ---------- Cities / wilayas shown in filters and forms, edited in Admin → Cities ----------
CREATE TABLE IF NOT EXISTS cities (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(40) NOT NULL UNIQUE,   -- stored on listings, users and stores
  name_ar     VARCHAR(80) NOT NULL,
  name_fr     VARCHAR(80) NOT NULL,
  name_en     VARCHAR(80) NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
-- First run only (so cities the admin deletes are not brought back).
INSERT INTO cities (key, name_ar, name_fr, name_en, sort_order)
SELECT * FROM (VALUES
  ('nouakchott', 'نواكشوط', 'Nouakchott', 'Nouakchott', 10),
  ('nouadhibou', 'نواذيبو', 'Nouadhibou', 'Nouadhibou', 20),
  ('rosso', 'روصو', 'Rosso', 'Rosso', 30),
  ('kaedi', 'كيهيدي', 'Kaédi', 'Kaedi', 40),
  ('kiffa', 'كيفة', 'Kiffa', 'Kiffa', 50),
  ('zouerate', 'ازويرات', 'Zouérate', 'Zouerate', 60),
  ('atar', 'أطار', 'Atar', 'Atar', 70),
  ('selibaby', 'سيلبابي', 'Sélibaby', 'Selibaby', 80),
  ('nema', 'النعمة', 'Néma', 'Nema', 90),
  ('aioun', 'العيون', 'Aïoun', 'Aioun', 100),
  ('aleg', 'ألاك', 'Aleg', 'Aleg', 110),
  ('akjoujt', 'أكجوجت', 'Akjoujt', 'Akjoujt', 120),
  ('tidjikja', 'تجكجة', 'Tidjikja', 'Tidjikja', 130),
  ('boutilimit', 'بوتلميت', 'Boutilimit', 'Boutilimit', 140),
  ('other', 'مدينة أخرى', 'Autre ville', 'Other city', 150)
) AS v(key, name_ar, name_fr, name_en, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM cities);

-- ---------- Row-level security ----------
-- The app server connects as the table owner and checks the admin role itself, so it is the
-- only writer. Through Supabase's public API (roles anon / authenticated) these tables are
-- read-only: there is a SELECT policy and no INSERT / UPDATE / DELETE policy.
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities  ENABLE ROW LEVEL SECURITY;
DO $rls$
DECLARE t text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    FOREACH t IN ARRAY ARRAY['site_settings', 'banners', 'categories', 'cities'] LOOP
      EXECUTE format('DROP POLICY IF EXISTS public_read ON %I', t);
      EXECUTE format('CREATE POLICY public_read ON %I FOR SELECT TO anon, authenticated USING (true)', t);
      EXECUTE format('GRANT SELECT ON %I TO anon, authenticated', t);
    END LOOP;
    DROP POLICY IF EXISTS public_read ON pages;
    CREATE POLICY public_read ON pages FOR SELECT TO anon, authenticated USING (is_published);
    GRANT SELECT ON pages TO anon, authenticated;
  END IF;
END
$rls$;

-- ---------- Geolocation ----------
-- Where a listing is. The exact point is only shown to buyers when the seller chooses
-- (loc_exact); otherwise the API rounds it to about 1 km.
ALTER TABLE products ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE products ADD COLUMN IF NOT EXISTS area VARCHAR(80);       -- moughataa / department
ALTER TABLE products ADD COLUMN IF NOT EXISTS district VARCHAR(80);   -- neighbourhood
ALTER TABLE products ADD COLUMN IF NOT EXISTS loc_exact BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_lat_lng_check;
ALTER TABLE products ADD CONSTRAINT products_lat_lng_check
  CHECK ((lat IS NULL AND lng IS NULL) OR (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180));
CREATE INDEX IF NOT EXISTS idx_products_lat_lng ON products(lat, lng) WHERE lat IS NOT NULL;

-- City centres: distance for listings without a pin, and "my city" when the visitor
-- picks it by hand instead of sharing their position.
ALTER TABLE cities ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
UPDATE cities c SET lat = v.lat, lng = v.lng FROM (VALUES
  ('nouakchott', 18.0858, -15.9785), ('nouadhibou', 20.9310, -17.0347), ('rosso', 16.5138, -15.8050),
  ('kaedi', 16.1503, -13.5047), ('kiffa', 16.6166, -11.4044), ('zouerate', 22.7354, -12.4792),
  ('atar', 20.5170, -13.0499), ('selibaby', 15.1585, -12.1843), ('nema', 16.6170, -7.2500),
  ('aioun', 16.6611, -9.6149), ('aleg', 17.0530, -13.9137), ('akjoujt', 19.7469, -14.3853),
  ('tidjikja', 18.5564, -11.4271), ('boutilimit', 17.5500, -14.7000)
) AS v(key, lat, lng)
WHERE c.key = v.key AND c.lat IS NULL;

-- Great-circle distance in km (NULL when a point is missing).
CREATE OR REPLACE FUNCTION mm_distance_km(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
RETURNS double precision LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $fn$
  SELECT 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)))
$fn$;

-- ---------- Delivery service ----------
-- Delivery partners: any user can apply; an admin approves.
CREATE TABLE IF NOT EXISTS couriers (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  phone           VARCHAR(20) NOT NULL,
  city            VARCHAR(40) NOT NULL,
  vehicle         TEXT NOT NULL CHECK (vehicle IN ('motorbike', 'car', 'bicycle', 'tricycle', 'foot')),
  note            TEXT,
  admin_note      TEXT,
  is_available    BOOLEAN NOT NULL DEFAULT TRUE,
  share_location  BOOLEAN NOT NULL DEFAULT FALSE,   -- the courier's consent to be tracked
  last_lat        DOUBLE PRECISION,
  last_lng        DOUBLE PRECISION,
  last_seen_at    TIMESTAMPTZ,
  reviewed_by     INT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_couriers_status_city ON couriers(status, city);

-- Orders with delivery (cash on delivery). Prices are copied at order time.
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  product_id      INT REFERENCES products(id) ON DELETE SET NULL,
  product_title   VARCHAR(140) NOT NULL,
  buyer_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  courier_id      INT REFERENCES couriers(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'preparing', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
  item_price      BIGINT NOT NULL,
  delivery_fee    BIGINT NOT NULL,
  total           BIGINT NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod')),
  distance_km     NUMERIC(7, 1),
  -- Delivery address (private: buyer, assigned courier and admins only)
  city            VARCHAR(40) NOT NULL,
  area            VARCHAR(80),
  district        VARCHAR(80),
  address         VARCHAR(300),
  phone           VARCHAR(20) NOT NULL,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  -- Pick-up point (the listing's place at order time)
  pickup_city     VARCHAR(40),
  pickup_lat      DOUBLE PRECISION,
  pickup_lng      DOUBLE PRECISION,
  note            VARCHAR(500),
  cancel_reason   VARCHAR(300),
  cancelled_by    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_courier ON orders(courier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at DESC);
-- One open order per buyer and listing.
CREATE UNIQUE INDEX IF NOT EXISTS orders_one_open_per_buyer ON orders(product_id, buyer_id)
  WHERE status NOT IN ('delivered', 'cancelled');

-- Every status change, for the order timeline.
CREATE TABLE IF NOT EXISTS order_events (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  actor_id    INT REFERENCES users(id) ON DELETE SET NULL,
  actor_role  TEXT,
  note        VARCHAR(300),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id, id);

-- The buyer rates the delivery once it is done.
CREATE TABLE IF NOT EXISTS delivery_ratings (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  courier_id  INT REFERENCES couriers(id) ON DELETE SET NULL,
  buyer_id    INT REFERENCES users(id) ON DELETE SET NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE couriers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_ratings ENABLE ROW LEVEL SECURITY;
