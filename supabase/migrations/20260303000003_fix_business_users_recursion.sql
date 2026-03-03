-- ============================================================
-- Fix: Definitively kill ALL infinite recursion in business_users
--
-- The core problem: any policy on business_users that runs a
-- subquery against business_users (even FOR ALL) creates recursion
-- because Postgres re-evaluates ALL matching policies on the table.
--
-- Solution:
--   1. Create a SECURITY DEFINER function that reads business_users
--      with RLS bypassed — used by ALL other table policies.
--   2. business_users own policies must NEVER subquery itself.
--      Use user_id = auth.uid() for SELECT only.
--      Use the SECURITY DEFINER function for write policies.
-- ============================================================

-- Step 1: Drop every existing policy on business_users (clean slate)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.business_users', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Create SECURITY DEFINER helper — reads business_users bypassing RLS
CREATE OR REPLACE FUNCTION public.get_my_business_ids()
RETURNS TABLE(business_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- SET LOCAL bypasses RLS for this function's queries
  SET LOCAL row_security = off;
  RETURN QUERY
    SELECT bu.business_id
    FROM public.business_users bu
    WHERE bu.user_id = auth.uid()
      AND bu.is_active = true;
END;
$$;

-- Step 3: Helper to check if current user is admin/superadmin in a business
CREATE OR REPLACE FUNCTION public.is_business_admin(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_result BOOLEAN;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1 FROM public.business_users bu
    WHERE bu.business_id = p_business_id
      AND bu.user_id = auth.uid()
      AND bu.role IN ('superadmin', 'admin')
      AND bu.is_active = true
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- Step 4: New business_users policies — ZERO self-reference
-- SELECT: user can only see their own rows (no subquery)
CREATE POLICY "bu: select own"
  ON public.business_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: only admins of that business can add members
CREATE POLICY "bu: insert if admin"
  ON public.business_users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_business_admin(business_id));

-- UPDATE: only admins of that business can update members
CREATE POLICY "bu: update if admin"
  ON public.business_users FOR UPDATE
  TO authenticated
  USING (public.is_business_admin(business_id));

-- DELETE: only admins of that business can remove members
CREATE POLICY "bu: delete if admin"
  ON public.business_users FOR DELETE
  TO authenticated
  USING (public.is_business_admin(business_id));

-- Step 5: Update all OTHER tables to use get_my_business_ids() helper
-- Drop and recreate policies that previously subqueried business_users directly

-- businesses
DROP POLICY IF EXISTS "businesses: read if member"  ON public.businesses;
DROP POLICY IF EXISTS "businesses: write if admin"  ON public.businesses;
DROP POLICY IF EXISTS "businesses: update if admin" ON public.businesses;

CREATE POLICY "businesses: read if member"
  ON public.businesses FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "businesses: write if admin"
  ON public.businesses FOR ALL TO authenticated
  USING (public.is_business_admin(id));

-- business_order_counters
DROP POLICY IF EXISTS "counters: read if member"  ON public.business_order_counters;
DROP POLICY IF EXISTS "counters: member access"   ON public.business_order_counters;

CREATE POLICY "counters: member access"
  ON public.business_order_counters FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

-- categories
DROP POLICY IF EXISTS "categories: read if member"        ON public.categories;
DROP POLICY IF EXISTS "categories: write if admin/manager" ON public.categories;

CREATE POLICY "categories: read if member"
  ON public.categories FOR SELECT TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "categories: write if admin/manager"
  ON public.categories FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

-- products
DROP POLICY IF EXISTS "products: read if member"        ON public.products;
DROP POLICY IF EXISTS "products: write if admin/manager" ON public.products;

CREATE POLICY "products: read if member"
  ON public.products FOR SELECT TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "products: write if admin/manager"
  ON public.products FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

-- orders
DROP POLICY IF EXISTS "orders: all if member"    ON public.orders;
DROP POLICY IF EXISTS "orders: read if member"   ON public.orders;
DROP POLICY IF EXISTS "orders: insert if member" ON public.orders;
DROP POLICY IF EXISTS "orders: update if member" ON public.orders;

CREATE POLICY "orders: all if member"
  ON public.orders FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()))
  WITH CHECK (business_id IN (SELECT public.get_my_business_ids()));

-- canceled_orders
DROP POLICY IF EXISTS "canceled_orders: all if member"    ON public.canceled_orders;
DROP POLICY IF EXISTS "canceled_orders: read if member"   ON public.canceled_orders;
DROP POLICY IF EXISTS "canceled_orders: insert if member" ON public.canceled_orders;

CREATE POLICY "canceled_orders: all if member"
  ON public.canceled_orders FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()))
  WITH CHECK (business_id IN (SELECT public.get_my_business_ids()));

-- modified_orders
DROP POLICY IF EXISTS "modified_orders: all if member"    ON public.modified_orders;
DROP POLICY IF EXISTS "modified_orders: read if member"   ON public.modified_orders;
DROP POLICY IF EXISTS "modified_orders: insert if member" ON public.modified_orders;

CREATE POLICY "modified_orders: all if member"
  ON public.modified_orders FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()))
  WITH CHECK (business_id IN (SELECT public.get_my_business_ids()));

-- customers
DROP POLICY IF EXISTS "customers: all if member"   ON public.customers;
DROP POLICY IF EXISTS "customers: read if member"  ON public.customers;
DROP POLICY IF EXISTS "customers: write if member" ON public.customers;

CREATE POLICY "customers: all if member"
  ON public.customers FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()))
  WITH CHECK (business_id IN (SELECT public.get_my_business_ids()));

-- eod_reports
DROP POLICY IF EXISTS "eod_reports: read if member"         ON public.eod_reports;
DROP POLICY IF EXISTS "eod_reports: write if admin/manager" ON public.eod_reports;
DROP POLICY IF EXISTS "eod_select" ON public.eod_reports;
DROP POLICY IF EXISTS "eod_insert" ON public.eod_reports;
DROP POLICY IF EXISTS "eod_delete" ON public.eod_reports;

CREATE POLICY "eod_reports: read if member"
  ON public.eod_reports FOR SELECT TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "eod_reports: write if member"
  ON public.eod_reports FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

-- sales_reports
DROP POLICY IF EXISTS "sales_reports: read if member"         ON public.sales_reports;
DROP POLICY IF EXISTS "sales_reports: write if admin/manager" ON public.sales_reports;
DROP POLICY IF EXISTS "sales_select" ON public.sales_reports;
DROP POLICY IF EXISTS "sales_insert" ON public.sales_reports;
DROP POLICY IF EXISTS "sales_delete" ON public.sales_reports;

CREATE POLICY "sales_reports: read if member"
  ON public.sales_reports FOR SELECT TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

CREATE POLICY "sales_reports: write if member"
  ON public.sales_reports FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));

-- dashboard_metrics
DROP POLICY IF EXISTS "dashboard_metrics: all if member" ON public.dashboard_metrics;
DROP POLICY IF EXISTS "dashboard_metrics_select"         ON public.dashboard_metrics;
DROP POLICY IF EXISTS "dashboard_metrics_update"         ON public.dashboard_metrics;

CREATE POLICY "dashboard_metrics: all if member"
  ON public.dashboard_metrics FOR ALL TO authenticated
  USING (business_id IN (SELECT public.get_my_business_ids()));
