-- Fix: STABLE functions cannot use SET LOCAL — must be VOLATILE

CREATE OR REPLACE FUNCTION public.get_my_business_ids()
RETURNS TABLE(business_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
SET search_path = public
AS $$
BEGIN
  SET LOCAL row_security = off;
  RETURN QUERY
    SELECT bu.business_id
    FROM public.business_users bu
    WHERE bu.user_id = auth.uid()
      AND bu.is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_business_admin(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
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
