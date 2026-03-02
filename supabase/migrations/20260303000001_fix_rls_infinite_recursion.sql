-- ============================================================
-- Fix: Infinite recursion in business_users RLS policy
--
-- Root cause:
--   - get_my_business_ids() queries business_users
--   - business_users SELECT policy calls get_my_business_ids()
--   → infinite recursion
--
-- Fix:
--   1. Add SET row_security = off to get_my_business_ids() so it
--      always bypasses RLS when called from other policies.
--   2. Replace the recursive business_users SELECT policy with a
--      non-recursive one (user sees their own membership rows only).
-- ============================================================

-- 1. Fix get_my_business_ids() to bypass RLS explicitly
CREATE OR REPLACE FUNCTION public.get_my_business_ids()
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Must bypass RLS or we get infinite recursion when called from
  -- RLS policies on business_users itself.
  SET LOCAL row_security = off;
  RETURN QUERY
    SELECT business_id
    FROM public.business_users
    WHERE user_id = auth.uid()
      AND is_active = true;
END;
$$;

-- 2. Drop all existing business_users policies and replace with non-recursive ones
DROP POLICY IF EXISTS "business_users: read if same business" ON public.business_users;
DROP POLICY IF EXISTS "business_users: manage if admin"       ON public.business_users;

-- Simple non-recursive SELECT: a user can see their own membership rows.
-- This is all that's needed: each user only cares about their own businesses.
CREATE POLICY "business_users: read own memberships"
  ON public.business_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- For admins managing other users in their businesses, do a direct non-recursive check
CREATE POLICY "business_users: manage if admin"
  ON public.business_users FOR ALL
  TO authenticated
  USING (
    business_id IN (
      SELECT bu.business_id
      FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin')
        AND bu.is_active = true
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT bu.business_id
      FROM public.business_users bu
      WHERE bu.user_id = auth.uid()
        AND bu.role IN ('superadmin', 'admin')
        AND bu.is_active = true
    )
  );

-- 3. Drop and re-add the users SELECT policy which also had a recursive sub-call
DROP POLICY IF EXISTS "users: read own or same business" ON public.users;

CREATE POLICY "users: read own or same business"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR id IN (
      SELECT bu.user_id
      FROM public.business_users bu
      WHERE bu.business_id IN (SELECT public.get_my_business_ids())
    )
  );

-- 4. Drop duplicate policies created by earlier migration (20251004000001)
--    that conflict with the policies above on the users table
DROP POLICY IF EXISTS "Users can view own profile"   ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
