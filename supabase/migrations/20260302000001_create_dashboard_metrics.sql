-- ─────────────────────────────────────────────────────────────────────────────
-- dashboard_metrics
-- Pre-aggregated per-business metrics updated on every order creation.
-- Avoids heavy order-table scans on the dashboard.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,

  -- ── All-time totals ────────────────────────────────────────────────────────
  total_revenue           DECIMAL(14,2) NOT NULL DEFAULT 0,
  total_orders            INTEGER        NOT NULL DEFAULT 0,

  -- Payment method totals (all-time)
  cash_total              DECIMAL(14,2) NOT NULL DEFAULT 0,
  card_total              DECIMAL(14,2) NOT NULL DEFAULT 0,
  mixed_cash_total        DECIMAL(14,2) NOT NULL DEFAULT 0,
  mixed_card_total        DECIMAL(14,2) NOT NULL DEFAULT 0,
  delivery_total          DECIMAL(14,2) NOT NULL DEFAULT 0,

  -- Delivery platform totals (all-time)
  delivery_keeta_total        DECIMAL(14,2) NOT NULL DEFAULT 0,
  delivery_hunger_station_total DECIMAL(14,2) NOT NULL DEFAULT 0,
  delivery_jahez_total        DECIMAL(14,2) NOT NULL DEFAULT 0,

  -- ── Daily subtotals (reset when current_day changes) ──────────────────────
  current_day             DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_total             DECIMAL(14,2) NOT NULL DEFAULT 0,
  daily_orders            INTEGER        NOT NULL DEFAULT 0,
  daily_cash              DECIMAL(14,2) NOT NULL DEFAULT 0,
  daily_card              DECIMAL(14,2) NOT NULL DEFAULT 0,
  daily_mixed             DECIMAL(14,2) NOT NULL DEFAULT 0,
  daily_keeta             DECIMAL(14,2) NOT NULL DEFAULT 0,
  daily_hunger_station    DECIMAL(14,2) NOT NULL DEFAULT 0,
  daily_jahez             DECIMAL(14,2) NOT NULL DEFAULT 0,

  -- ── Weekly subtotals (reset when week changes) ────────────────────────────
  current_week_start      DATE NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::DATE,
  weekly_total            DECIMAL(14,2) NOT NULL DEFAULT 0,
  weekly_orders           INTEGER        NOT NULL DEFAULT 0,
  weekly_cash             DECIMAL(14,2) NOT NULL DEFAULT 0,
  weekly_card             DECIMAL(14,2) NOT NULL DEFAULT 0,
  weekly_mixed            DECIMAL(14,2) NOT NULL DEFAULT 0,
  weekly_keeta            DECIMAL(14,2) NOT NULL DEFAULT 0,
  weekly_hunger_station   DECIMAL(14,2) NOT NULL DEFAULT 0,
  weekly_jahez            DECIMAL(14,2) NOT NULL DEFAULT 0,

  -- ── Monthly subtotals (reset when month changes) ──────────────────────────
  current_month_start     DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::DATE,
  monthly_total           DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_orders          INTEGER        NOT NULL DEFAULT 0,
  monthly_cash            DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_card            DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_mixed           DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_keeta           DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_hunger_station  DECIMAL(14,2) NOT NULL DEFAULT 0,
  monthly_jahez           DECIMAL(14,2) NOT NULL DEFAULT 0,

  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup by business
CREATE INDEX IF NOT EXISTS dashboard_metrics_business_id_idx
  ON dashboard_metrics (business_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: increment_dashboard_metrics
-- Called after every successful order creation.
-- Handles period resets (daily/weekly/monthly) atomically.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_dashboard_metrics(
  p_business_id        UUID,
  p_total              DECIMAL,
  p_payment_method     TEXT,           -- 'cash' | 'card' | 'mixed' | 'delivery'
  p_delivery_platform  TEXT  DEFAULT NULL, -- 'keeta' | 'hunger_station' | 'jahez'
  p_cash_amount        DECIMAL DEFAULT 0,
  p_card_amount        DECIMAL DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_today        DATE := CURRENT_DATE;
  v_week_start   DATE := date_trunc('week', CURRENT_DATE)::DATE;
  v_month_start  DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_row          dashboard_metrics%ROWTYPE;
  v_needs_daily_reset   BOOLEAN;
  v_needs_weekly_reset  BOOLEAN;
  v_needs_monthly_reset BOOLEAN;
BEGIN
  -- ── Upsert a row for this business (no-lock on insert path) ────────────────
  INSERT INTO dashboard_metrics (business_id, current_day, current_week_start, current_month_start)
  VALUES (p_business_id, v_today, v_week_start, v_month_start)
  ON CONFLICT (business_id) DO NOTHING;

  -- ── Lock and read the row ──────────────────────────────────────────────────
  SELECT * INTO v_row FROM dashboard_metrics
  WHERE business_id = p_business_id
  FOR UPDATE;

  -- ── Determine which periods need resetting ─────────────────────────────────
  v_needs_daily_reset   := v_row.current_day        <> v_today;
  v_needs_weekly_reset  := v_row.current_week_start <> v_week_start;
  v_needs_monthly_reset := v_row.current_month_start <> v_month_start;

  -- ── Build and execute a single UPDATE ─────────────────────────────────────
  UPDATE dashboard_metrics SET
    -- All-time
    total_revenue  = total_revenue  + p_total,
    total_orders   = total_orders   + 1,
    cash_total     = cash_total     + CASE WHEN p_payment_method = 'cash'     THEN p_total ELSE 0 END,
    card_total     = card_total     + CASE WHEN p_payment_method = 'card'     THEN p_total ELSE 0 END,
    mixed_cash_total = mixed_cash_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_cash_amount, 0) ELSE 0 END,
    mixed_card_total = mixed_card_total + CASE WHEN p_payment_method = 'mixed' THEN COALESCE(p_card_amount, 0) ELSE 0 END,
    delivery_total = delivery_total + CASE WHEN p_payment_method = 'delivery' THEN p_total ELSE 0 END,
    delivery_keeta_total         = delivery_keeta_total         + CASE WHEN p_delivery_platform = 'keeta'          THEN p_total ELSE 0 END,
    delivery_hunger_station_total = delivery_hunger_station_total + CASE WHEN p_delivery_platform = 'hunger_station' THEN p_total ELSE 0 END,
    delivery_jahez_total         = delivery_jahez_total         + CASE WHEN p_delivery_platform = 'jahez'          THEN p_total ELSE 0 END,

    -- Daily (reset if new day)
    current_day  = v_today,
    daily_total  = CASE WHEN v_needs_daily_reset THEN p_total ELSE daily_total + p_total END,
    daily_orders = CASE WHEN v_needs_daily_reset THEN 1       ELSE daily_orders + 1 END,
    daily_cash   = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='cash'     THEN p_total ELSE 0 END ELSE daily_cash   + CASE WHEN p_payment_method='cash'     THEN p_total ELSE 0 END END,
    daily_card   = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='card'     THEN p_total ELSE 0 END ELSE daily_card   + CASE WHEN p_payment_method='card'     THEN p_total ELSE 0 END END,
    daily_mixed  = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_payment_method='mixed'    THEN p_total ELSE 0 END ELSE daily_mixed  + CASE WHEN p_payment_method='mixed'    THEN p_total ELSE 0 END END,
    daily_keeta  = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END ELSE daily_keeta  + CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END END,
    daily_hunger_station = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE daily_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    daily_jahez  = CASE WHEN v_needs_daily_reset THEN CASE WHEN p_delivery_platform='jahez'          THEN p_total ELSE 0 END ELSE daily_jahez  + CASE WHEN p_delivery_platform='jahez'          THEN p_total ELSE 0 END END,

    -- Weekly (reset if new week)
    current_week_start = v_week_start,
    weekly_total  = CASE WHEN v_needs_weekly_reset THEN p_total ELSE weekly_total + p_total END,
    weekly_orders = CASE WHEN v_needs_weekly_reset THEN 1       ELSE weekly_orders + 1 END,
    weekly_cash   = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END ELSE weekly_cash  + CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END END,
    weekly_card   = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END ELSE weekly_card  + CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END END,
    weekly_mixed  = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE weekly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    weekly_keeta  = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END ELSE weekly_keeta  + CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END END,
    weekly_hunger_station = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE weekly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    weekly_jahez  = CASE WHEN v_needs_weekly_reset THEN CASE WHEN p_delivery_platform='jahez'          THEN p_total ELSE 0 END ELSE weekly_jahez  + CASE WHEN p_delivery_platform='jahez'          THEN p_total ELSE 0 END END,

    -- Monthly (reset if new month)
    current_month_start = v_month_start,
    monthly_total  = CASE WHEN v_needs_monthly_reset THEN p_total ELSE monthly_total + p_total END,
    monthly_orders = CASE WHEN v_needs_monthly_reset THEN 1       ELSE monthly_orders + 1 END,
    monthly_cash   = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END ELSE monthly_cash  + CASE WHEN p_payment_method='cash'  THEN p_total ELSE 0 END END,
    monthly_card   = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END ELSE monthly_card  + CASE WHEN p_payment_method='card'  THEN p_total ELSE 0 END END,
    monthly_mixed  = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END ELSE monthly_mixed + CASE WHEN p_payment_method='mixed' THEN p_total ELSE 0 END END,
    monthly_keeta  = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END ELSE monthly_keeta  + CASE WHEN p_delivery_platform='keeta'          THEN p_total ELSE 0 END END,
    monthly_hunger_station = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END ELSE monthly_hunger_station + CASE WHEN p_delivery_platform='hunger_station' THEN p_total ELSE 0 END END,
    monthly_jahez  = CASE WHEN v_needs_monthly_reset THEN CASE WHEN p_delivery_platform='jahez'          THEN p_total ELSE 0 END ELSE monthly_jahez  + CASE WHEN p_delivery_platform='jahez'          THEN p_total ELSE 0 END END,

    updated_at = now()
  WHERE business_id = p_business_id;
END;
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Tenant isolation: users can only read their own business metrics
CREATE POLICY "dashboard_metrics_select"
  ON dashboard_metrics FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM business_users WHERE user_id = auth.uid()
    )
  );

-- Only service role / authenticated users of the business can update
CREATE POLICY "dashboard_metrics_update"
  ON dashboard_metrics FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM business_users WHERE user_id = auth.uid()
    )
  );
