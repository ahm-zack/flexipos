-- Add cash received and change given tracking to EOD reports
-- This migration adds detailed cash flow tracking to End of Day reports

ALTER TABLE eod_reports 
ADD COLUMN total_cash_received DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN total_change_given DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- Add comment to explain the new columns
COMMENT ON COLUMN eod_reports.total_cash_received IS 'Total cash received from customers (includes cash for mixed payments)';
COMMENT ON COLUMN eod_reports.total_change_given IS 'Total change given back to customers';