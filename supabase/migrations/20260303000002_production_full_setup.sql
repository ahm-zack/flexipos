-- ============================================================
-- PRODUCTION FULL SETUP — copied from working dev database
-- Run this in Supabase SQL Editor (production project)
-- Safe to run multiple times — uses IF NOT EXISTS / OR REPLACE
-- ============================================================

-- ── 1. ENUMS ─────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.delivery_platform AS ENUM ('keeta', 'hunger_station', 'jahez');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.modification_type AS ENUM ('item_added', 'item_removed', 'quantity_changed', 'item_replaced', 'multiple_changes');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('completed', 'canceled', 'modified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'mixed', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.report_type AS ENUM ('eod', 'sales', 'weekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.role AS ENUM ('superadmin', 'admin', 'manager', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. TABLES ────────────────────────────────────────────────

-- users (must come before any table that FKs to it)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  role        TEXT        NOT NULL DEFAULT 'staff',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE,
  description TEXT,
  logo_url    TEXT,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  website     TEXT,
  timezone    TEXT        DEFAULT 'UTC',
  currency    TEXT        DEFAULT 'SAR',
  settings    JSONB       DEFAULT '{}',
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- business_users
CREATE TABLE IF NOT EXISTS public.business_users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'cashier',
  permissions JSONB       DEFAULT '{}',
  is_active   BOOLEAN     DEFAULT true,
  invited_at  TIMESTAMPTZ DEFAULT now(),
  joined_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

-- business_order_counters
CREATE TABLE IF NOT EXISTS public.business_order_counters (
  business_id UUID    PRIMARY KEY REFERENCES public.businesses(id) ON DELETE CASCADE,
  last_serial INTEGER NOT NULL DEFAULT 0
);

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  slug        TEXT,
  description TEXT,
  icon        TEXT,
  color       TEXT        DEFAULT '#3b82f6',
  image_url   TEXT,
  sort_order  INTEGER     DEFAULT 0,
  is_active   BOOLEAN     DEFAULT true,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id         UUID          NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name                TEXT          NOT NULL,
  name_ar             TEXT,
  description         TEXT,
  price               NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_price          NUMERIC(10,2),
  sku                 TEXT,
  barcode             TEXT,
  images              TEXT[],
  modifiers           JSONB,
  variants            JSONB,
  tags                TEXT[],
  stock_quantity      INTEGER,
  low_stock_threshold INTEGER,
  is_featured         BOOLEAN       DEFAULT false,
  is_active           BOOLEAN       DEFAULT true,
  metadata            JSONB,
  created_at          TIMESTAMPTZ   DEFAULT now(),
  updated_at          TIMESTAMPTZ   DEFAULT now()
);

-- orders
CREATE TABLE IF NOT EXISTS public.orders (
  id                        UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id               UUID                      NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_number              TEXT                      NOT NULL,
  daily_serial              TEXT,
  serial_date               DATE,
  status                    public.order_status       NOT NULL DEFAULT 'completed',
  payment_method            public.payment_method     NOT NULL DEFAULT 'cash',
  delivery_platform         public.delivery_platform,
  items                     JSONB                     NOT NULL,
  total_amount              NUMERIC(10,2)             NOT NULL,
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
  created_by                UUID                      NOT NULL REFERENCES public.users(id),
  created_at                TIMESTAMPTZ               DEFAULT now(),
  updated_at                TIMESTAMPTZ               DEFAULT now()
);

-- canceled_orders
CREATE TABLE IF NOT EXISTS public.canceled_orders (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  original_order_id TEXT        NOT NULL,
  order_data        JSONB       NOT NULL,
  reason            TEXT,
  canceled_by       UUID        NOT NULL REFERENCES public.users(id),
  canceled_at       TIMESTAMPTZ DEFAULT now()
);

-- modified_orders
CREATE TABLE IF NOT EXISTS public.modified_orders (
  id                UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID                     NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  original_order_id TEXT                     NOT NULL,
  modification_type public.modification_type NOT NULL,
  original_data     JSONB                    NOT NULL,
  new_data          JSONB                    NOT NULL,
  modified_by       UUID                     NOT NULL REFERENCES public.users(id),
  modified_at       TIMESTAMPTZ              DEFAULT now()
);

-- customers
CREATE TABLE IF NOT EXISTS public.customers (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID          NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name             TEXT          NOT NULL,
  phone            TEXT          NOT NULL,
  address          TEXT,
  total_purchases  NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_count      INTEGER       NOT NULL DEFAULT 0,
  last_order_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  created_by       UUID          NOT NULL REFERENCES public.users(id),
  UNIQUE (business_id, phone)
);

-- eod_reports
CREATE TABLE IF NOT EXISTS public.eod_reports (
  id                    UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           UUID               NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  report_number         TEXT               NOT NULL,
  report_type           public.report_type NOT NULL DEFAULT 'eod',
  period_start          TIMESTAMPTZ        NOT NULL,
  period_end            TIMESTAMPTZ        NOT NULL,
  total_orders          INTEGER            NOT NULL DEFAULT 0,
  completed_orders      INTEGER            NOT NULL DEFAULT 0,
  cancelled_orders      INTEGER            NOT NULL DEFAULT 0,
  total_revenue         NUMERIC(12,2)      NOT NULL DEFAULT 0,
  revenue_ex_vat        NUMERIC(12,2)      NOT NULL DEFAULT 0,
  total_vat             NUMERIC(12,2)      NOT NULL DEFAULT 0,
  cash_revenue          NUMERIC(12,2)      NOT NULL DEFAULT 0,
  card_revenue          NUMERIC(12,2)      NOT NULL DEFAULT 0,
  delivery_revenue      NUMERIC(12,2)      NOT NULL DEFAULT 0,
  cash_received         NUMERIC(12,2)      NOT NULL DEFAULT 0,
  change_given          NUMERIC(12,2)      NOT NULL DEFAULT 0,
  total_discount        NUMERIC(12,2)      NOT NULL DEFAULT 0,
  average_order_value   NUMERIC(10,2)      NOT NULL DEFAULT 0,
  payment_breakdown     JSONB              DEFAULT '[]',
  category_breakdown    JSONB              DEFAULT '[]',
  top_items             JSONB              DEFAULT '[]',
  hourly_sales          JSONB              DEFAULT '[]',
  from_order_id         TEXT,
  to_order_id           TEXT,
  notes                 TEXT,
  generated_by          UUID               NOT NULL REFERENCES public.users(id),
  created_at            TIMESTAMPTZ        DEFAULT now()
);

-- sales_reports
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

-- dashboard_metrics (one row per business)
CREATE TABLE IF NOT EXISTS public.dashboard_metrics (
  id                              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id                     UUID          NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
  total_revenue                   NUMERIC       NOT NULL DEFAULT 0,
  total_orders                    INTEGER       NOT NULL DEFAULT 0,
  cash_total                      NUMERIC       NOT NULL DEFAULT 0,
  card_total                      NUMERIC       NOT NULL DEFAULT 0,
  mixed_cash_total                NUMERIC       NOT NULL DEFAULT 0,
  mixed_card_total                NUMERIC       NOT NULL DEFAULT 0,
  delivery_total                  NUMERIC       NOT NULL DEFAULT 0,
  delivery_keeta_total            NUMERIC       NOT NULL DEFAULT 0,
  delivery_hunger_station_total   NUMERIC       NOT NULL DEFAULT 0,
  delivery_jahez_total            NUMERIC       NOT NULL DEFAULT 0,
  current_day                     DATE          NOT NULL DEFAULT CURRENT_DATE,
  daily_total                     NUMERIC       NOT NULL DEFAULT 0,
  daily_orders                    INTEGER       NOT NULL DEFAULT 0,
  daily_cash                      NUMERIC       NOT NULL DEFAULT 0,
  daily_card                      NUMERIC       NOT NULL DEFAULT 0,
  daily_mixed                     NUMERIC       NOT NULL DEFAULT 0,
  daily_keeta                     NUMERIC       NOT NULL DEFAULT 0,
  daily_hunger_station            NUMERIC       NOT NULL DEFAULT 0,
  daily_jahez                     NUMERIC       NOT NULL DEFAULT 0,
  current_week_start              DATE          NOT NULL DEFAULT (date_trunc('week', CURRENT_DATE))::DATE,
  weekly_total                    NUMERIC       NOT NULL DEFAULT 0,
  weekly_orders                   INTEGER       NOT NULL DEFAULT 0,
  weekly_cash                     NUMERIC       NOT NULL DEFAULT 0,
  weekly_card                     NUMERIC       NOT NULL DEFAULT 0,
  weekly_mixed                    NUMERIC       NOT NULL DEFAULT 0,
  weekly_keeta                    NUMERIC       NOT NULL DEFAULT 0,
  weekly_hunger_station           NUMERIC       NOT NULL DEFAULT 0,
  weekly_jahez                    NUMERIC       NOT NULL DEFAULT 0,
  current_month_start             DATE          NOT NULL DEFAULT (date_trunc('month', CURRENT_DATE))::DATE,
  monthly_total                   NUMERIC       NOT NULL DEFAULT 0,
  monthly_orders                  INTEGER       NOT NULL DEFAULT 0,
  monthly_cash                    NUMERIC       NOT NULL DEFAULT 0,
  monthly_card                    NUMERIC       NOT NULL DEFAULT 0,
  monthly_mixed                   NUMERIC       NOT NULL DEFAULT 0,
  monthly_keeta                   NUMERIC       NOT NULL DEFAULT 0,
  monthly_hunger_station          NUMERIC       NOT NULL DEFAULT 0,
  monthly_jahez                   NUMERIC       NOT NULL DEFAULT 0,
  updated_at                      TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- ── 3. INDEXES ───────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique                  ON public.users(email);
CREATE UNIQUE INDEX IF NOT EXISTS customers_business_phone_unique     ON public.customers(business_id, phone);
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_metrics_business_id_key   ON public.dashboard_metrics(business_id);
CREATE        INDEX IF NOT EXISTS dashboard_metrics_business_id_idx   ON public.dashboard_metrics(business_id);


-- ── 4. SEQUENCES ─────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.eod_report_number_seq START 1;


-- ── 5. FUNCTIONS ─────────────────────────────────────────────

-- Trigger function: auto-insert public.users when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'user_role', 'staff'),
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING; -- code may have already inserted the row
  RETURN NEW;
END;
$$;

-- Trigger function: sync auth user updates to public.users
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users SET
    email      = NEW.email,
    full_name  = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Trigger function: delete auth user when public.users row is deleted
CREATE OR REPLACE FUNCTION public.handle_public_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Trigger function: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Atomically increment daily order serial per business
CREATE OR REPLACE FUNCTION public.get_next_order_serial(p_business_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_serial INTEGER;
BEGIN
  INSERT INTO public.business_order_counters (business_id, last_serial)
  VALUES (p_business_id, 1)
  ON CONFLICT (business_id)
  DO UPDATE SET last_serial = business_order_counters.last_serial + 1
  RETURNING last_serial INTO next_serial;
  RETURN next_serial;
END;
$$;

-- Generate unique order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_val BIGINT;
BEGIN
  next_val := nextval('public.order_number_seq');
  RETURN 'ORD-' || LPAD(next_val::TEXT, 4, '0');
END;
$$;

-- Generate unique EOD report number
CREATE OR REPLACE FUNCTION public.generate_eod_report_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_val BIGINT;
BEGIN
  next_val := nextval('public.eod_report_number_seq');
  RETURN 'EOD-' || LPAD(next_val::TEXT, 4, '0');
END;
$$;

-- Peek at next EOD number without incrementing
CREATE OR REPLACE FUNCTION public.get_next_eod_report_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  curr_val BIGINT;
BEGIN
  SELECT last_value + 1 INTO curr_val FROM public.eod_report_number_seq;
  RETURN 'EOD-' || LPAD(curr_val::TEXT, 4, '0');
END;
$$;

-- Reset daily order serials (called at end of day)
CREATE OR REPLACE FUNCTION public.reset_daily_serial_sequence()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.business_order_counters SET last_serial = 0;
END;
$$;

-- Increment dashboard metrics on order completion
CREATE OR REPLACE FUNCTION public.increment_dashboard_metrics(
  p_business_id     UUID,
  p_total           NUMERIC,
  p_payment_method  TEXT,
  p_cash_amount     NUMERIC DEFAULT NULL,
  p_card_amount     NUMERIC DEFAULT NULL,
  p_delivery_platform TEXT  DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_week_start DATE := date_trunc('week', CURRENT_DATE)::DATE;
  v_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_row dashboard_metrics%ROWTYPE;
  v_needs_daily_reset BOOLEAN;
  v_needs_weekly_reset BOOLEAN;
  v_needs_monthly_reset BOOLEAN;
BEGIN
  INSERT INTO public.dashboard_metrics (business_id, current_day, current_week_start, current_month_start)
  VALUES (p_business_id, v_today, v_week_start, v_month_start)
  ON CONFLICT (business_id) DO NOTHING;

  SELECT * INTO v_row FROM public.dashboard_metrics
  WHERE business_id = p_business_id FOR UPDATE;

  v_needs_daily_reset   := v_row.current_day <> v_today;
  v_needs_weekly_reset  := v_row.current_week_start <> v_week_start;
  v_needs_monthly_reset := v_row.current_month_start <> v_month_start;

  UPDATE public.dashboard_metrics SET
    total_revenue                 = total_revenue + p_total,
    total_orders                  = total_orders + 1,
    cash_total                    = cash_total + CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END,
    card_total                    = card_total + CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END,
    mixed_cash_total              = mixed_cash_total + CASE WHEN p_payment_method='mixed' THEN COALESCE(p_cash_amount,0) ELSE 0 END,
    mixed_card_total              = mixed_card_total + CASE WHEN p_payment_method='mixed' THEN COALESCE(p_card_amount,0) ELSE 0 END,
    delivery_total                = delivery_total + CASE WHEN p_payment_method='delivery' THEN p_total ELSE 0 END,
    delivery_keeta_total          = delivery_keeta_total + CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END,
    delivery_hunger_station_total = delivery_hunger_station_total + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END,
    delivery_jahez_total          = delivery_jahez_total + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END,
    current_day      = v_today,
    daily_total      = CASE WHEN v_needs_daily_reset THEN p_total ELSE daily_total + p_total END,
    daily_orders     = CASE WHEN v_needs_daily_reset THEN 1 ELSE daily_orders + 1 END,
    daily_cash       = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END ELSE daily_cash + CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END END,
    daily_card       = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END ELSE daily_card + CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END END,
    daily_mixed      = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE daily_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    daily_keeta      = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END ELSE daily_keeta + CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END END,
    daily_hunger_station = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE daily_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    daily_jahez      = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE daily_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,
    current_week_start = v_week_start,
    weekly_total     = CASE WHEN v_needs_weekly_reset THEN p_total ELSE weekly_total + p_total END,
    weekly_orders    = CASE WHEN v_needs_weekly_reset THEN 1 ELSE weekly_orders + 1 END,
    weekly_cash      = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END ELSE weekly_cash + CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END END,
    weekly_card      = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END ELSE weekly_card + CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END END,
    weekly_mixed     = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE weekly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    weekly_keeta     = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END ELSE weekly_keeta + CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END END,
    weekly_hunger_station = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE weekly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    weekly_jahez     = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE weekly_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,
    current_month_start = v_month_start,
    monthly_total    = CASE WHEN v_needs_monthly_reset THEN p_total ELSE monthly_total + p_total END,
    monthly_orders   = CASE WHEN v_needs_monthly_reset THEN 1 ELSE monthly_orders + 1 END,
    monthly_cash     = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END ELSE monthly_cash + CASE WHEN p_payment_method='cash' THEN p_total ELSE 0 END END,
    monthly_card     = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END ELSE monthly_card + CASE WHEN p_payment_method='card' THEN p_total ELSE 0 END END,
    monthly_mixed    = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE monthly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    monthly_keeta    = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END ELSE monthly_keeta + CASE WHEN p_delivery_platform='keeta' THEN p_total ELSE 0 END END,
    monthly_hunger_station = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE monthly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    monthly_jahez    = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE monthly_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,
    updated_at = now()
  WHERE business_id = p_business_id;
END;
$$;


-- ── 6. TRIGGERS ──────────────────────────────────────────────

-- Auth → public.users: on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Auth → public.users: on user email/metadata update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- public.users → auth.users: cascade delete
DROP TRIGGER IF EXISTS on_public_user_deleted ON public.users;
CREATE TRIGGER on_public_user_deleted
  AFTER DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_public_user_deleted();

-- products: auto-update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 7. ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE public.users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_order_counters  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canceled_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modified_orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eod_reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics        ENABLE ROW LEVEL SECURITY;

-- Drop all old conflicting policies first
DROP POLICY IF EXISTS "Users can view own profile"                    ON public.users;
DROP POLICY IF EXISTS "Users can update own profile"                  ON public.users;
DROP POLICY IF EXISTS "users: read own or same business"              ON public.users;
DROP POLICY IF EXISTS "users: update own profile"                     ON public.users;
DROP POLICY IF EXISTS "businesses: read if member"                    ON public.businesses;
DROP POLICY IF EXISTS "businesses: update if admin"                   ON public.businesses;
DROP POLICY IF EXISTS "business_users: read if same business"         ON public.business_users;
DROP POLICY IF EXISTS "business_users: read own memberships"          ON public.business_users;
DROP POLICY IF EXISTS "business_users: manage if admin"               ON public.business_users;
DROP POLICY IF EXISTS "counters: read if member"                      ON public.business_order_counters;
DROP POLICY IF EXISTS "categories: read if member"                    ON public.categories;
DROP POLICY IF EXISTS "categories: write if admin/manager"            ON public.categories;
DROP POLICY IF EXISTS "products: read if member"                      ON public.products;
DROP POLICY IF EXISTS "products: write if admin/manager"              ON public.products;
DROP POLICY IF EXISTS "orders: read if member"                        ON public.orders;
DROP POLICY IF EXISTS "orders: insert if member"                      ON public.orders;
DROP POLICY IF EXISTS "orders: update if member"                      ON public.orders;
DROP POLICY IF EXISTS "canceled_orders: read if member"               ON public.canceled_orders;
DROP POLICY IF EXISTS "canceled_orders: insert if member"             ON public.canceled_orders;
DROP POLICY IF EXISTS "modified_orders: read if member"               ON public.modified_orders;
DROP POLICY IF EXISTS "modified_orders: insert if member"             ON public.modified_orders;
DROP POLICY IF EXISTS "customers: read if member"                     ON public.customers;
DROP POLICY IF EXISTS "customers: write if member"                    ON public.customers;
DROP POLICY IF EXISTS "eod_reports: read if member"                   ON public.eod_reports;
DROP POLICY IF EXISTS "eod_reports: write if admin/manager"           ON public.eod_reports;
DROP POLICY IF EXISTS "sales_reports: read if member"                 ON public.sales_reports;
DROP POLICY IF EXISTS "sales_reports: write if admin/manager"         ON public.sales_reports;
DROP POLICY IF EXISTS "dashboard_metrics: read if member"             ON public.dashboard_metrics;
DROP POLICY IF EXISTS "eod_select"                                    ON public.eod_reports;
DROP POLICY IF EXISTS "eod_insert"                                    ON public.eod_reports;
DROP POLICY IF EXISTS "eod_delete"                                    ON public.eod_reports;
DROP POLICY IF EXISTS "sales_select"                                  ON public.sales_reports;
DROP POLICY IF EXISTS "sales_insert"                                  ON public.sales_reports;
DROP POLICY IF EXISTS "sales_delete"                                  ON public.sales_reports;
DROP POLICY IF EXISTS "dashboard_metrics_select"                      ON public.dashboard_metrics;
DROP POLICY IF EXISTS "dashboard_metrics_update"                      ON public.dashboard_metrics;

-- ── users ─────────────────────────────────────────────────────
CREATE POLICY "users: read own"
  ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users: update own"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- ── businesses ────────────────────────────────────────────────
CREATE POLICY "businesses: read if member"
  ON public.businesses FOR SELECT TO authenticated
  USING (id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "businesses: write if admin"
  ON public.businesses FOR ALL TO authenticated
  USING (id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND role IN ('superadmin','admin') AND is_active = true
  ));

-- ── business_users ────────────────────────────────────────────
-- Non-recursive: user sees only their own membership rows
CREATE POLICY "business_users: read own"
  ON public.business_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "business_users: manage if admin"
  ON public.business_users FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND role IN ('superadmin','admin') AND is_active = true
  ))
  WITH CHECK (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND role IN ('superadmin','admin') AND is_active = true
  ));

-- ── business_order_counters ───────────────────────────────────
CREATE POLICY "counters: member access"
  ON public.business_order_counters FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- ── categories ────────────────────────────────────────────────
CREATE POLICY "categories: read if member"
  ON public.categories FOR SELECT TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "categories: write if admin/manager"
  ON public.categories FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND role IN ('superadmin','admin','manager') AND is_active = true
  ));

-- ── products ──────────────────────────────────────────────────
CREATE POLICY "products: read if member"
  ON public.products FOR SELECT TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "products: write if admin/manager"
  ON public.products FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND role IN ('superadmin','admin','manager') AND is_active = true
  ));

-- ── orders ────────────────────────────────────────────────────
CREATE POLICY "orders: all if member"
  ON public.orders FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ))
  WITH CHECK (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- ── canceled_orders ───────────────────────────────────────────
CREATE POLICY "canceled_orders: all if member"
  ON public.canceled_orders FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ))
  WITH CHECK (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- ── modified_orders ───────────────────────────────────────────
CREATE POLICY "modified_orders: all if member"
  ON public.modified_orders FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ))
  WITH CHECK (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- ── customers ─────────────────────────────────────────────────
CREATE POLICY "customers: all if member"
  ON public.customers FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ))
  WITH CHECK (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- ── eod_reports ───────────────────────────────────────────────
CREATE POLICY "eod_reports: read if member"
  ON public.eod_reports FOR SELECT TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "eod_reports: write if admin/manager"
  ON public.eod_reports FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND role IN ('superadmin','admin','manager') AND is_active = true
  ));

-- ── sales_reports ─────────────────────────────────────────────
CREATE POLICY "sales_reports: read if member"
  ON public.sales_reports FOR SELECT TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "sales_reports: write if admin/manager"
  ON public.sales_reports FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND role IN ('superadmin','admin','manager') AND is_active = true
  ));

-- ── dashboard_metrics ─────────────────────────────────────────
CREATE POLICY "dashboard_metrics: all if member"
  ON public.dashboard_metrics FOR ALL TO authenticated
  USING (business_id IN (
    SELECT business_id FROM public.business_users
    WHERE user_id = auth.uid() AND is_active = true
  ));


-- ── 8. STORAGE ───────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('product-images', 'product-images', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
DROP POLICY IF EXISTS "product images public read"   ON storage.objects;
DROP POLICY IF EXISTS "product images auth upload"   ON storage.objects;
DROP POLICY IF EXISTS "product images auth delete"   ON storage.objects;

CREATE POLICY "product images public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "product images auth upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product images auth delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');
