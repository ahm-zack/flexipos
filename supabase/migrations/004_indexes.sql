-- ============================================================
-- 004_indexes.sql
-- Performance indexes for common query patterns
-- Run after 003_functions.sql
-- ============================================================

-- ── users ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email     ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role      ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);

-- ── businesses ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses (slug);

-- ── business_users ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_business_users_business ON public.business_users (business_id);
CREATE INDEX IF NOT EXISTS idx_business_users_user     ON public.business_users (user_id);

-- ── categories ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_categories_business    ON public.categories (business_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort        ON public.categories (business_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active   ON public.categories (business_id, is_active);

-- ── products ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_business      ON public.products (business_id);
CREATE INDEX IF NOT EXISTS idx_products_category      ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON public.products (business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku           ON public.products (business_id, sku) WHERE sku IS NOT NULL;

-- ── orders ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_business        ON public.orders (business_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at      ON public.orders (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON public.orders (business_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number    ON public.orders (business_id, order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_by      ON public.orders (created_by);
CREATE INDEX IF NOT EXISTS idx_orders_serial_date     ON public.orders (business_id, serial_date) WHERE serial_date IS NOT NULL;

-- ── canceled_orders ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_canceled_orders_business    ON public.canceled_orders (business_id);
CREATE INDEX IF NOT EXISTS idx_canceled_orders_canceled_at ON public.canceled_orders (business_id, canceled_at DESC);

-- ── modified_orders ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_modified_orders_business    ON public.modified_orders (business_id);
CREATE INDEX IF NOT EXISTS idx_modified_orders_modified_at ON public.modified_orders (business_id, modified_at DESC);

-- ── customers ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_business     ON public.customers (business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone        ON public.customers (business_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_name         ON public.customers (business_id, name);

-- ── eod_reports ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_eod_reports_business      ON public.eod_reports (business_id);
CREATE INDEX IF NOT EXISTS idx_eod_reports_period_start  ON public.eod_reports (business_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_eod_reports_report_number ON public.eod_reports (report_number);

-- ── sales_reports ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sales_reports_business     ON public.sales_reports (business_id);
CREATE INDEX IF NOT EXISTS idx_sales_reports_period_start ON public.sales_reports (business_id, period_start DESC);
