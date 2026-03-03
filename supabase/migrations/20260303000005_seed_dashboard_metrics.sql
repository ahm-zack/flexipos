-- Seed initial dashboard_metrics rows for businesses that don't have one yet
-- This ensures the dashboard shows zeros instead of the empty "No data yet" state

INSERT INTO public.dashboard_metrics (business_id, current_day, current_week_start, current_month_start)
SELECT
  b.id,
  CURRENT_DATE,
  date_trunc('week',  CURRENT_DATE)::DATE,
  date_trunc('month', CURRENT_DATE)::DATE
FROM public.businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM public.dashboard_metrics dm WHERE dm.business_id = b.id
)
ON CONFLICT (business_id) DO NOTHING;

-- ── Trigger: auto-create a dashboard_metrics row whenever a business is inserted ──

CREATE OR REPLACE FUNCTION public.create_dashboard_metrics_for_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.dashboard_metrics (business_id, current_day, current_week_start, current_month_start)
  VALUES (
    NEW.id,
    CURRENT_DATE,
    date_trunc('week',  CURRENT_DATE)::DATE,
    date_trunc('month', CURRENT_DATE)::DATE
  )
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_dashboard_metrics ON public.businesses;

CREATE TRIGGER trg_create_dashboard_metrics
  AFTER INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_dashboard_metrics_for_business();
