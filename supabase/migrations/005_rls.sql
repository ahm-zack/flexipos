-- ============================================================
-- 005_rls.sql
-- Row Level Security policies
-- Run after 004_indexes.sql
--
-- Security model:
--   • Server-side routes use createAdminClient() (service_role key)
--     → bypasses RLS entirely — no policy needed for those calls
--   • Client-side / SSR calls use the anon/user JWT
--     → RLS applies and scopes data to the user's business
-- ============================================================

-- ── Helper: get current user's business IDs ──────────────────
-- Used inside policies so each policy stays readable
CREATE OR REPLACE FUNCTION public.get_my_business_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT business_id
  FROM public.business_users
  WHERE user_id = auth.uid()
    AND is_active = true;
$$;


-- ── Enable RLS on all tables ─────────────────────────────────
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_order_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canceled_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modified_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eod_reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics   ENABLE ROW LEVEL SECURITY;


-- ── users ────────────────────────────────────────────────────
-- Users can see their own profile, and other users in shared businesses
CREATE POLICY "users: read own or same business"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR id IN (
      SELECT bu.user_id FROM public.business_users bu
      WHERE bu.business_id IN (SELECT public.get_my_business_ids())
    )
  );

CREATE POLICY "users: update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());


-- ── businesses ───────────────────────────────────────────────
CREATE POLICY "businesses: read if member"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "businesses: update if admin"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT bu.business_id FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin')
        AND bu.is_active = true
    )
  );


-- ── business_users ───────────────────────────────────────────
CREATE POLICY "business_users: read if same business"
  ON public.business_users FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "business_users: manage if admin"
  ON public.business_users FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bu.business_id FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin')
        AND bu.is_active = true
    )
  );


-- ── business_order_counters ──────────────────────────────────
CREATE POLICY "counters: read if member"
  ON public.business_order_counters FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));


-- ── categories ───────────────────────────────────────────────
CREATE POLICY "categories: read if member"
  ON public.categories FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "categories: write if admin/manager"
  ON public.categories FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bu.business_id FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin', 'manager')
        AND bu.is_active = true
    )
  );


-- ── products ─────────────────────────────────────────────────
CREATE POLICY "products: read if member"
  ON public.products FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "products: write if admin/manager"
  ON public.products FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bu.business_id FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin', 'manager')
        AND bu.is_active = true
    )
  );


-- ── orders ───────────────────────────────────────────────────
CREATE POLICY "orders: read if member"
  ON public.orders FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "orders: insert if member"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "orders: update if member"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));


-- ── canceled_orders ──────────────────────────────────────────
CREATE POLICY "canceled_orders: read if member"
  ON public.canceled_orders FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "canceled_orders: insert if member"
  ON public.canceled_orders FOR INSERT
  TO authenticated
  WITH CHECK (business_id IN (SELECT public.get_my_business_ids()));


-- ── modified_orders ──────────────────────────────────────────
CREATE POLICY "modified_orders: read if member"
  ON public.modified_orders FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "modified_orders: insert if member"
  ON public.modified_orders FOR INSERT
  TO authenticated
  WITH CHECK (business_id IN (SELECT public.get_my_business_ids()));


-- ── customers ────────────────────────────────────────────────
CREATE POLICY "customers: read if member"
  ON public.customers FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "customers: write if member"
  ON public.customers FOR ALL
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));


-- ── eod_reports ──────────────────────────────────────────────
CREATE POLICY "eod_reports: read if member"
  ON public.eod_reports FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "eod_reports: write if admin/manager"
  ON public.eod_reports FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bu.business_id FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin', 'manager')
        AND bu.is_active = true
    )
  );


-- ── sales_reports ────────────────────────────────────────────
CREATE POLICY "sales_reports: read if member"
  ON public.sales_reports FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "sales_reports: write if admin/manager"
  ON public.sales_reports FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bu.business_id FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin', 'manager')
        AND bu.is_active = true
    )
  );


-- ── dashboard_metrics ────────────────────────────────────────
CREATE POLICY "dashboard_metrics: read if member"
  ON public.dashboard_metrics FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));
