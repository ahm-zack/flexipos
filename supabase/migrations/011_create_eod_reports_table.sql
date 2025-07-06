-- Migration: Create EOD Reports Table
-- Purpose: Add comprehensive End of Day reporting functionality
-- Date: 2025-07-06

-- Create payment method enum
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mixed');

-- Create EOD order status enum
CREATE TYPE eod_order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');

-- Create report type enum
CREATE TYPE report_type AS ENUM ('daily', 'custom', 'weekly', 'monthly');

-- Create EOD reports table
CREATE TABLE eod_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Core order metrics
  total_orders INTEGER NOT NULL DEFAULT 0,
  completed_orders INTEGER NOT NULL DEFAULT 0,
  cancelled_orders INTEGER NOT NULL DEFAULT 0,
  pending_orders INTEGER NOT NULL DEFAULT 0,
  
  -- Financial metrics
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_with_vat DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_without_vat DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  
  -- Payment method breakdown
  total_cash_orders DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_card_orders DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  cash_orders_count INTEGER NOT NULL DEFAULT 0,
  card_orders_count INTEGER NOT NULL DEFAULT 0,
  
  -- Performance metrics
  average_order_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  peak_hour TEXT,
  order_completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  order_cancellation_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  
  -- Complex data stored as JSON
  payment_breakdown JSONB,
  best_selling_items JSONB,
  hourly_sales JSONB,
  
  -- Metadata
  generated_by UUID NOT NULL REFERENCES users(id),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  report_type report_type NOT NULL DEFAULT 'daily',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_eod_reports_report_date ON eod_reports(report_date);
CREATE INDEX idx_eod_reports_date_range ON eod_reports(start_date_time, end_date_time);
CREATE INDEX idx_eod_reports_generated_by ON eod_reports(generated_by);
CREATE INDEX idx_eod_reports_generated_at ON eod_reports(generated_at);
CREATE INDEX idx_eod_reports_type ON eod_reports(report_type);
CREATE INDEX idx_eod_reports_created_at ON eod_reports(created_at);

-- Create composite index for common queries
CREATE INDEX idx_eod_reports_date_user ON eod_reports(report_date, generated_by);

-- Add RLS (Row Level Security) policies
ALTER TABLE eod_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see EOD reports they generated or if they're admin/manager
CREATE POLICY "Users can view their own EOD reports or if admin/manager"
ON eod_reports FOR SELECT
TO authenticated
USING (
  generated_by = auth.uid() OR
  (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager')
);

-- Policy: Only admin/manager can create EOD reports
CREATE POLICY "Only admin/manager can create EOD reports"
ON eod_reports FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager')
);

-- Policy: Only admin/manager can update EOD reports
CREATE POLICY "Only admin/manager can update EOD reports"
ON eod_reports FOR UPDATE
TO authenticated
USING (
  (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager')
);

-- Policy: Only admin/superadmin can delete EOD reports
CREATE POLICY "Only admin/superadmin can delete EOD reports"
ON eod_reports FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin')
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_eod_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER eod_reports_updated_at_trigger
  BEFORE UPDATE ON eod_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_eod_reports_updated_at();

-- Add comments for documentation
COMMENT ON TABLE eod_reports IS 'End of Day reports containing comprehensive business metrics and analytics';
COMMENT ON COLUMN eod_reports.report_date IS 'The business date this report covers';
COMMENT ON COLUMN eod_reports.start_date_time IS 'Start of the reporting period';
COMMENT ON COLUMN eod_reports.end_date_time IS 'End of the reporting period';
COMMENT ON COLUMN eod_reports.total_orders IS 'Total number of orders in the period';
COMMENT ON COLUMN eod_reports.total_revenue IS 'Total revenue including VAT';
COMMENT ON COLUMN eod_reports.total_cash_orders IS 'Total amount from cash payments';
COMMENT ON COLUMN eod_reports.total_card_orders IS 'Total amount from card payments';
COMMENT ON COLUMN eod_reports.payment_breakdown IS 'JSON array of payment method breakdown';
COMMENT ON COLUMN eod_reports.best_selling_items IS 'JSON array of best selling items';
COMMENT ON COLUMN eod_reports.hourly_sales IS 'JSON array of hourly sales data';
COMMENT ON COLUMN eod_reports.peak_hour IS 'Hour with highest sales (e.g., "14:00")';
COMMENT ON COLUMN eod_reports.generated_by IS 'User who generated this report';
COMMENT ON COLUMN eod_reports.report_type IS 'Type of report (daily, custom, weekly, monthly)';

-- Insert sample data validation constraints
ALTER TABLE eod_reports ADD CONSTRAINT chk_eod_reports_date_range 
  CHECK (end_date_time > start_date_time);

ALTER TABLE eod_reports ADD CONSTRAINT chk_eod_reports_completion_rate 
  CHECK (order_completion_rate >= 0 AND order_completion_rate <= 100);

ALTER TABLE eod_reports ADD CONSTRAINT chk_eod_reports_cancellation_rate 
  CHECK (order_cancellation_rate >= 0 AND order_cancellation_rate <= 100);

ALTER TABLE eod_reports ADD CONSTRAINT chk_eod_reports_positive_amounts 
  CHECK (total_revenue >= 0 AND total_with_vat >= 0 AND total_without_vat >= 0);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON eod_reports TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
