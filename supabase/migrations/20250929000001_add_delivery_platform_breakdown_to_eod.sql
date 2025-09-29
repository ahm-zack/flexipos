-- Migration: Add Delivery Platform Breakdown to EOD Reports
-- Purpose: Enhance EOD reports to track delivery orders by platform (Keeta, Hunger Station, Jahez)
-- Date: 2025-09-29

-- Add delivery platform breakdown column to eod_reports table
ALTER TABLE eod_reports 
ADD COLUMN IF NOT EXISTS delivery_platform_breakdown JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance when querying delivery platform data
CREATE INDEX IF NOT EXISTS idx_eod_reports_delivery_platform_breakdown 
ON eod_reports USING GIN (delivery_platform_breakdown);

-- Update existing reports to have empty delivery platform breakdown array
UPDATE eod_reports 
SET delivery_platform_breakdown = '[]'::jsonb 
WHERE delivery_platform_breakdown IS NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN eod_reports.delivery_platform_breakdown IS 'JSON array containing delivery platform breakdown with platform, orderCount, totalAmount, and percentage for each delivery platform (keeta, hunger_station, jahez)';

-- Notification
DO $$
BEGIN
    RAISE NOTICE '✅ EOD Reports table updated successfully!';
    RAISE NOTICE 'Added delivery_platform_breakdown column to track deliveries by platform';
    RAISE NOTICE 'Updated existing reports with empty arrays';
END $$;