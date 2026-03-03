-- Fix: increment_dashboard_metrics must be SECURITY DEFINER so it can
-- reliably UPDATE the dashboard_metrics row regardless of RLS policies.
-- Without SECURITY DEFINER, the function runs as the calling user and the
-- RLS policy on dashboard_metrics (which calls get_my_business_ids()) can
-- silently filter out the UPDATE — orders get counted but totals stay at 0.

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
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today       DATE := CURRENT_DATE;
  v_week_start  DATE := date_trunc('week',  CURRENT_DATE)::DATE;
  v_month_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_row         dashboard_metrics%ROWTYPE;
  v_needs_daily_reset   BOOLEAN;
  v_needs_weekly_reset  BOOLEAN;
  v_needs_monthly_reset BOOLEAN;
BEGIN
  -- Bypass RLS so this function always works regardless of caller policies
  SET LOCAL row_security = off;

  -- Ensure a metrics row exists for this business
  INSERT INTO public.dashboard_metrics (business_id, current_day, current_week_start, current_month_start)
  VALUES (p_business_id, v_today, v_week_start, v_month_start)
  ON CONFLICT (business_id) DO NOTHING;

  -- Lock the row and read current period timestamps
  SELECT * INTO v_row
  FROM public.dashboard_metrics
  WHERE business_id = p_business_id
  FOR UPDATE;

  v_needs_daily_reset   := v_row.current_day        <> v_today;
  v_needs_weekly_reset  := v_row.current_week_start  <> v_week_start;
  v_needs_monthly_reset := v_row.current_month_start <> v_month_start;

  UPDATE public.dashboard_metrics SET
    -- All-time totals
    total_revenue = total_revenue + p_total,
    total_orders  = total_orders  + 1,
    cash_total    = cash_total  + CASE WHEN p_payment_method = 'cash'     THEN p_total ELSE 0 END,
    card_total    = card_total  + CASE WHEN p_payment_method = 'card'     THEN p_total ELSE 0 END,
    mixed_cash_total = mixed_cash_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_cash_amount, 0) ELSE 0 END,
    mixed_card_total = mixed_card_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_card_amount, 0) ELSE 0 END,
    delivery_total = delivery_total + CASE WHEN p_payment_method = 'delivery' THEN p_total ELSE 0 END,
    delivery_keeta_total          = delivery_keeta_total          + CASE WHEN p_delivery_platform = 'keeta'          THEN p_total ELSE 0 END,
    delivery_hunger_station_total = delivery_hunger_station_total + CASE WHEN p_delivery_platform = 'hunger_station' THEN p_total ELSE 0 END,
    delivery_jahez_total          = delivery_jahez_total          + CASE WHEN p_delivery_platform = 'jahez'          THEN p_total ELSE 0 END,

    -- Daily (reset if new day)
    current_day  = v_today,
    daily_total  = CASE WHEN v_needs_daily_reset THEN p_total ELSE daily_total + p_total END,
    daily_orders = CASE WHEN v_needs_daily_reset THEN 1        ELSE daily_orders + 1    END,
    daily_cash   = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END ELSE daily_cash  + CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END END,
    daily_card   = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END ELSE daily_card  + CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END END,
    daily_mixed  = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE daily_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    daily_keeta  = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END ELSE daily_keeta + CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END END,
    daily_hunger_station = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE daily_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    daily_jahez  = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE daily_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,

    -- Weekly (reset if new week)
    current_week_start = v_week_start,
    weekly_total  = CASE WHEN v_needs_weekly_reset THEN p_total ELSE weekly_total + p_total END,
    weekly_orders = CASE WHEN v_needs_weekly_reset THEN 1        ELSE weekly_orders + 1    END,
    weekly_cash   = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END ELSE weekly_cash  + CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END END,
    weekly_card   = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END ELSE weekly_card  + CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END END,
    weekly_mixed  = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE weekly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    weekly_keeta  = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END ELSE weekly_keeta + CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END END,
    weekly_hunger_station = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE weekly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    weekly_jahez  = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE weekly_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,

    -- Monthly (reset if new month)
    current_month_start = v_month_start,
    monthly_total  = CASE WHEN v_needs_monthly_reset THEN p_total ELSE monthly_total + p_total END,
    monthly_orders = CASE WHEN v_needs_monthly_reset THEN 1        ELSE monthly_orders + 1    END,
    monthly_cash   = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END ELSE monthly_cash  + CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END END,
    monthly_card   = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END ELSE monthly_card  + CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END END,
    monthly_mixed  = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE monthly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    monthly_keeta  = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END ELSE monthly_keeta + CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END END,
    monthly_hunger_station = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE monthly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    monthly_jahez  = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END ELSE monthly_jahez + CASE WHEN p_delivery_platform='jahez' THEN p_total ELSE 0 END END,

    updated_at = now()
  WHERE business_id = p_business_id;
END;
$$;
