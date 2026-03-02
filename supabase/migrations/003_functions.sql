-- ============================================================
-- 003_functions.sql
-- Database functions used by the application
-- Run after 002_tables.sql
-- ============================================================

-- ── Sequences for number generation ─────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.eod_report_number_seq START 1;


-- ── generate_order_number() ──────────────────────────────────
-- Returns the next order number in format 'ORD-0001'
-- Called by: lib/orders/server-utils.ts
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


-- ── generate_eod_report_number() ─────────────────────────────
-- Returns the next EOD report number in format 'EOD-0001'
-- Called by: lib/eod-report/server-utils.ts
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


-- ── get_next_eod_report_number() ─────────────────────────────
-- Peeks at next EOD number WITHOUT incrementing the sequence
-- Called by: lib/eod-report/server-utils.ts (preview only)
CREATE OR REPLACE FUNCTION public.get_next_eod_report_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  curr_val BIGINT;
BEGIN
  -- currval errors if the sequence hasn't been called yet in this session,
  -- so we peek via the sequence catalog instead
  SELECT last_value + 1
    INTO curr_val
    FROM public.eod_report_number_seq;
  RETURN 'EOD-' || LPAD(curr_val::TEXT, 4, '0');
END;
$$;


-- ── get_next_order_serial(p_business_id) ─────────────────────
-- Atomically increments and returns the daily order serial per business.
-- Used to generate serials like "001", "002" that reset each day.
-- Called by: modules/orders-feature (via business_order_counters table)
CREATE OR REPLACE FUNCTION public.get_next_order_serial(p_business_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_serial INTEGER;
BEGIN
  INSERT INTO public.business_order_counters (business_id, last_serial)
  VALUES (p_business_id, 1)
  ON CONFLICT (business_id) DO UPDATE
    SET last_serial = business_order_counters.last_serial + 1
  RETURNING last_serial INTO v_serial;

  RETURN v_serial;
END;
$$;


-- ── reset_daily_serial_sequence() ────────────────────────────
-- Resets all business order counters to 0 (run at end of day / midnight).
-- Called by: lib/eod-report-service.ts after generating EOD report
CREATE OR REPLACE FUNCTION public.reset_daily_serial_sequence()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.business_order_counters SET last_serial = 0;
END;
$$;


-- ── increment_dashboard_metrics(...) ─────────────────────────
-- Called on every completed order to keep dashboard_metrics up to date.
-- Uses UPSERT so the first order for a business auto-creates the row.
-- Called by: modules/orders-feature/index.ts
CREATE OR REPLACE FUNCTION public.increment_dashboard_metrics(
  p_business_id    UUID,
  p_total          NUMERIC,
  p_payment_method TEXT,
  p_cash_amount    NUMERIC  DEFAULT 0,
  p_card_amount    NUMERIC  DEFAULT 0,
  p_delivery_platform TEXT  DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_now           DATE := CURRENT_DATE;
  v_week_start    DATE := date_trunc('week', CURRENT_DATE)::DATE;
  v_month_start   DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_is_new_day    BOOLEAN;
  v_is_new_week   BOOLEAN;
  v_is_new_month  BOOLEAN;
BEGIN
  -- Ensure row exists
  INSERT INTO public.dashboard_metrics (business_id)
  VALUES (p_business_id)
  ON CONFLICT (business_id) DO NOTHING;

  -- Detect period rollovers
  SELECT
    (current_day       < v_now),
    (current_week_start < v_week_start),
    (current_month_start < v_month_start)
  INTO v_is_new_day, v_is_new_week, v_is_new_month
  FROM public.dashboard_metrics
  WHERE business_id = p_business_id;

  -- Reset daily counters if day changed
  IF v_is_new_day THEN
    UPDATE public.dashboard_metrics SET
      current_day          = v_now,
      daily_orders         = 0,
      daily_total          = 0,
      daily_cash           = 0,
      daily_card           = 0,
      daily_mixed          = 0,
      daily_keeta          = 0,
      daily_hunger_station = 0,
      daily_jahez          = 0
    WHERE business_id = p_business_id;
  END IF;

  -- Reset weekly counters if week changed
  IF v_is_new_week THEN
    UPDATE public.dashboard_metrics SET
      current_week_start    = v_week_start,
      weekly_orders         = 0,
      weekly_total          = 0,
      weekly_cash           = 0,
      weekly_card           = 0,
      weekly_mixed          = 0,
      weekly_keeta          = 0,
      weekly_hunger_station = 0,
      weekly_jahez          = 0
    WHERE business_id = p_business_id;
  END IF;

  -- Reset monthly counters if month changed
  IF v_is_new_month THEN
    UPDATE public.dashboard_metrics SET
      current_month_start    = v_month_start,
      monthly_orders         = 0,
      monthly_total          = 0,
      monthly_cash           = 0,
      monthly_card           = 0,
      monthly_mixed          = 0,
      monthly_keeta          = 0,
      monthly_hunger_station = 0,
      monthly_jahez          = 0
    WHERE business_id = p_business_id;
  END IF;

  -- Increment all-time + period totals
  UPDATE public.dashboard_metrics SET
    updated_at    = now(),
    total_orders  = total_orders + 1,
    total_revenue = total_revenue + p_total,

    -- Payment method totals (all-time)
    cash_total    = cash_total  + CASE WHEN p_payment_method = 'cash'     THEN p_total ELSE 0 END,
    card_total    = card_total  + CASE WHEN p_payment_method = 'card'     THEN p_total ELSE 0 END,
    delivery_total= delivery_total + CASE WHEN p_payment_method = 'delivery' THEN p_total ELSE 0 END,
    mixed_cash_total = mixed_cash_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_cash_amount, 0) ELSE 0 END,
    mixed_card_total = mixed_card_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_card_amount, 0) ELSE 0 END,

    -- Delivery platform totals (all-time)
    delivery_keeta_total          = delivery_keeta_total          + CASE WHEN p_delivery_platform = 'keeta'          THEN p_total ELSE 0 END,
    delivery_hunger_station_total = delivery_hunger_station_total + CASE WHEN p_delivery_platform = 'hunger_station' THEN p_total ELSE 0 END,
    delivery_jahez_total          = delivery_jahez_total          + CASE WHEN p_delivery_platform = 'jahez'          THEN p_total ELSE 0 END,

    -- Daily
    daily_orders         = daily_orders + 1,
    daily_total          = daily_total  + p_total,
    daily_cash           = daily_cash   + CASE WHEN p_payment_method = 'cash'     THEN p_total ELSE 0 END,
    daily_card           = daily_card   + CASE WHEN p_payment_method = 'card'     THEN p_total ELSE 0 END,
    daily_mixed          = daily_mixed  + CASE WHEN p_payment_method = 'mixed'    THEN p_total ELSE 0 END,
    daily_keeta          = daily_keeta  + CASE WHEN p_delivery_platform = 'keeta'          THEN p_total ELSE 0 END,
    daily_hunger_station = daily_hunger_station + CASE WHEN p_delivery_platform = 'hunger_station' THEN p_total ELSE 0 END,
    daily_jahez          = daily_jahez  + CASE WHEN p_delivery_platform = 'jahez'          THEN p_total ELSE 0 END,

    -- Weekly
    weekly_orders         = weekly_orders + 1,
    weekly_total          = weekly_total  + p_total,
    weekly_cash           = weekly_cash   + CASE WHEN p_payment_method = 'cash'     THEN p_total ELSE 0 END,
    weekly_card           = weekly_card   + CASE WHEN p_payment_method = 'card'     THEN p_total ELSE 0 END,
    weekly_mixed          = weekly_mixed  + CASE WHEN p_payment_method = 'mixed'    THEN p_total ELSE 0 END,
    weekly_keeta          = weekly_keeta  + CASE WHEN p_delivery_platform = 'keeta'          THEN p_total ELSE 0 END,
    weekly_hunger_station = weekly_hunger_station + CASE WHEN p_delivery_platform = 'hunger_station' THEN p_total ELSE 0 END,
    weekly_jahez          = weekly_jahez  + CASE WHEN p_delivery_platform = 'jahez'          THEN p_total ELSE 0 END,

    -- Monthly
    monthly_orders         = monthly_orders + 1,
    monthly_total          = monthly_total  + p_total,
    monthly_cash           = monthly_cash   + CASE WHEN p_payment_method = 'cash'     THEN p_total ELSE 0 END,
    monthly_card           = monthly_card   + CASE WHEN p_payment_method = 'card'     THEN p_total ELSE 0 END,
    monthly_mixed          = monthly_mixed  + CASE WHEN p_payment_method = 'mixed'    THEN p_total ELSE 0 END,
    monthly_keeta          = monthly_keeta  + CASE WHEN p_delivery_platform = 'keeta'          THEN p_total ELSE 0 END,
    monthly_hunger_station = monthly_hunger_station + CASE WHEN p_delivery_platform = 'hunger_station' THEN p_total ELSE 0 END,
    monthly_jahez          = monthly_jahez  + CASE WHEN p_delivery_platform = 'jahez'          THEN p_total ELSE 0 END

  WHERE business_id = p_business_id;
END;
$$;


-- ── Auto-update updated_at trigger ───────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach trigger to tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','businesses','business_users','categories','products','orders','customers'] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;
      CREATE TRIGGER trg_set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;
