-- ============================================================
-- 002_tables.sql
-- All application tables in dependency order
-- Run after 001_enums.sql
-- ============================================================

-- ── users ────────────────────────────────────────────────────
-- Mirror of auth.users — id must match Supabase auth UID
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  role        TEXT        DEFAULT 'staff',
  is_active   BOOLEAN     DEFAULT true,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── businesses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE,
  description TEXT,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  website     TEXT,
  logo_url    TEXT,
  currency    TEXT        DEFAULT 'SAR',
  timezone    TEXT        DEFAULT 'Asia/Riyadh',
  is_active   BOOLEAN     DEFAULT true,
  settings    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── business_users ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'staff',
  is_active   BOOLEAN     DEFAULT true,
  permissions JSONB,
  invited_at  TIMESTAMPTZ,
  joined_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (business_id, user_id)
);

-- ── business_order_counters ──────────────────────────────────
-- Tracks daily serial counter per business (resets each day)
CREATE TABLE IF NOT EXISTS public.business_order_counters (
  business_id UUID    PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  last_serial INTEGER NOT NULL DEFAULT 0
);

-- ── categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  slug        TEXT,
  description TEXT,
  icon        TEXT,
  color       TEXT,
  image_url   TEXT,
  sort_order  INTEGER     DEFAULT 0,
  is_active   BOOLEAN     DEFAULT true,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id          UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id          UUID        NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name                 TEXT        NOT NULL,
  name_ar              TEXT,
  description          TEXT,
  price                NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price           NUMERIC(10,2),
  sku                  TEXT,
  barcode              TEXT,
  images               TEXT[],
  modifiers            JSONB,
  variants             JSONB,
  tags                 TEXT[],
  stock_quantity       INTEGER,
  low_stock_threshold  INTEGER,
  is_featured          BOOLEAN     DEFAULT false,
  is_active            BOOLEAN     DEFAULT true,
  metadata             JSONB,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ── orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                        UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id               UUID              NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_number              TEXT              NOT NULL,
  daily_serial              TEXT,
  serial_date               DATE,
  status                    public.order_status NOT NULL DEFAULT 'completed',
  payment_method            public.payment_method NOT NULL DEFAULT 'cash',
  delivery_platform         public.delivery_platform,
  items                     JSONB             NOT NULL,
  total_amount              NUMERIC(10,2)     NOT NULL,
  cash_amount               NUMERIC(10,2),
  card_amount               NUMERIC(10,2),
  cash_received             NUMERIC(10,2),
  change_amount             NUMERIC(10,2),
  discount_type             TEXT,
  discount_value            NUMERIC(10,2),
  discount_amount           NUMERIC(10,2),
  event_discount_name       TEXT,
  event_discount_percentage NUMERIC(5,2),
  event_discount_amount     NUMERIC(10,2),
  customer_name             TEXT,
  created_by                UUID              NOT NULL REFERENCES public.users(id),
  created_at                TIMESTAMPTZ       DEFAULT now(),
  updated_at                TIMESTAMPTZ       DEFAULT now()
);

-- ── canceled_orders ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.canceled_orders (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  original_order_id TEXT        NOT NULL,
  order_data        JSONB       NOT NULL,
  reason            TEXT,
  canceled_by       UUID        NOT NULL REFERENCES public.users(id),
  canceled_at       TIMESTAMPTZ DEFAULT now()
);

-- ── modified_orders ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.modified_orders (
  id                UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID                      NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  original_order_id TEXT                      NOT NULL,
  modification_type public.modification_type  NOT NULL,
  original_data     JSONB                     NOT NULL,
  new_data          JSONB                     NOT NULL,
  modified_by       UUID                      NOT NULL REFERENCES public.users(id),
  modified_at       TIMESTAMPTZ               DEFAULT now()
);

-- ── customers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name             TEXT          NOT NULL,
  phone            TEXT          NOT NULL,
  address          TEXT,
  order_count      INTEGER       NOT NULL DEFAULT 0,
  total_purchases  NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_order_at    TIMESTAMPTZ,
  created_by       UUID          NOT NULL REFERENCES public.users(id),
  created_at       TIMESTAMPTZ   DEFAULT now(),
  updated_at       TIMESTAMPTZ   DEFAULT now(),
  UNIQUE (business_id, phone)
);

-- ── eod_reports ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.eod_reports (
  id                    UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID              NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  report_number         TEXT              NOT NULL,
  report_type           public.report_type NOT NULL DEFAULT 'eod',
  period_start          TIMESTAMPTZ       NOT NULL,
  period_end            TIMESTAMPTZ       NOT NULL,
  total_orders          INTEGER           NOT NULL DEFAULT 0,
  completed_orders      INTEGER           NOT NULL DEFAULT 0,
  cancelled_orders      INTEGER           NOT NULL DEFAULT 0,
  total_revenue         NUMERIC(12,2)     NOT NULL DEFAULT 0,
  revenue_ex_vat        NUMERIC(12,2)     NOT NULL DEFAULT 0,
  total_vat             NUMERIC(12,2)     NOT NULL DEFAULT 0,
  cash_revenue          NUMERIC(12,2)     NOT NULL DEFAULT 0,
  card_revenue          NUMERIC(12,2)     NOT NULL DEFAULT 0,
  delivery_revenue      NUMERIC(12,2)     NOT NULL DEFAULT 0,
  cash_received         NUMERIC(12,2)     NOT NULL DEFAULT 0,
  change_given          NUMERIC(12,2)     NOT NULL DEFAULT 0,
  total_discount        NUMERIC(12,2)     NOT NULL DEFAULT 0,
  average_order_value   NUMERIC(10,2)     NOT NULL DEFAULT 0,
  payment_breakdown     JSONB             DEFAULT '[]',
  category_breakdown    JSONB             DEFAULT '[]',
  top_items             JSONB             DEFAULT '[]',
  hourly_sales          JSONB             DEFAULT '[]',
  from_order_id         TEXT,
  to_order_id           TEXT,
  notes                 TEXT,
  generated_by          UUID              NOT NULL REFERENCES public.users(id),
  created_at            TIMESTAMPTZ       DEFAULT now()
);

-- ── sales_reports ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales_reports (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  report_name         TEXT,
  period_start        TIMESTAMPTZ   NOT NULL,
  period_end          TIMESTAMPTZ   NOT NULL,
  total_orders        INTEGER       NOT NULL DEFAULT 0,
  completed_orders    INTEGER       NOT NULL DEFAULT 0,
  cancelled_orders    INTEGER       NOT NULL DEFAULT 0,
  total_revenue       NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue_ex_vat      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_vat           NUMERIC(12,2) NOT NULL DEFAULT 0,
  cash_revenue        NUMERIC(12,2) NOT NULL DEFAULT 0,
  card_revenue        NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_revenue    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_discount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  average_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_breakdown   JSONB         DEFAULT '[]',
  category_breakdown  JSONB         DEFAULT '[]',
  top_items           JSONB         DEFAULT '[]',
  hourly_sales        JSONB         DEFAULT '[]',
  daily_sales         JSONB         DEFAULT '[]',
  generated_by        UUID          NOT NULL REFERENCES public.users(id),
  created_at          TIMESTAMPTZ   DEFAULT now()
);

-- ── dashboard_metrics ────────────────────────────────────────
-- One row per business — updated on every order via increment_dashboard_metrics()
CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
  id                          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id                 UUID          NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  current_day                 DATE          DEFAULT CURRENT_DATE,
  current_week_start          DATE          DEFAULT date_trunc('week', CURRENT_DATE)::DATE,
  current_month_start         DATE          DEFAULT date_trunc('month', CURRENT_DATE)::DATE,
  -- Totals (all-time)
  total_orders                INTEGER       NOT NULL DEFAULT 0,
  total_revenue               NUMERIC(14,2) NOT NULL DEFAULT 0,
  cash_total                  NUMERIC(14,2) NOT NULL DEFAULT 0,
  card_total                  NUMERIC(14,2) NOT NULL DEFAULT 0,
  delivery_total              NUMERIC(14,2) NOT NULL DEFAULT 0,
  mixed_cash_total            NUMERIC(14,2) NOT NULL DEFAULT 0,
  mixed_card_total            NUMERIC(14,2) NOT NULL DEFAULT 0,
  delivery_keeta_total        NUMERIC(14,2) NOT NULL DEFAULT 0,
  delivery_hunger_station_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  delivery_jahez_total        NUMERIC(14,2) NOT NULL DEFAULT 0,
  -- Daily
  daily_orders                INTEGER       NOT NULL DEFAULT 0,
  daily_total                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_cash                  NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_card                  NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_mixed                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_keeta                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_hunger_station        NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_jahez                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  -- Weekly
  weekly_orders               INTEGER       NOT NULL DEFAULT 0,
  weekly_total                NUMERIC(14,2) NOT NULL DEFAULT 0,
  weekly_cash                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  weekly_card                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  weekly_mixed                NUMERIC(14,2) NOT NULL DEFAULT 0,
  weekly_keeta                NUMERIC(14,2) NOT NULL DEFAULT 0,
  weekly_hunger_station       NUMERIC(14,2) NOT NULL DEFAULT 0,
  weekly_jahez                NUMERIC(14,2) NOT NULL DEFAULT 0,
  -- Monthly
  monthly_orders              INTEGER       NOT NULL DEFAULT 0,
  monthly_total               NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_cash                NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_card                NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_mixed               NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_keeta               NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_hunger_station      NUMERIC(14,2) NOT NULL DEFAULT 0,
  monthly_jahez               NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated_at                  TIMESTAMPTZ   DEFAULT now()
);
