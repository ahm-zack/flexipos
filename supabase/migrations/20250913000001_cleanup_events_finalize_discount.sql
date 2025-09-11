-- Remove events table and ensure event discount columns are correct
-- Migration: Clean up events table and finalize event discount columns
-- Created: 2025-09-12

-- Drop events table if it exists (we're using simple approach)
DROP TABLE IF EXISTS events CASCADE;

-- Ensure event discount columns exist in orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS event_discount_name TEXT,
ADD COLUMN IF NOT EXISTS event_discount_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS event_discount_amount DECIMAL(10,2) DEFAULT 0;

-- Remove event_id column if it exists (not needed for simple approach)
ALTER TABLE orders DROP COLUMN IF EXISTS event_id;

-- Add comments for documentation
COMMENT ON COLUMN orders.event_discount_name IS 'Name of the event discount (e.g., Grand Opening, Black Friday)';
COMMENT ON COLUMN orders.event_discount_percentage IS 'Percentage of the event discount applied';
COMMENT ON COLUMN orders.event_discount_amount IS 'Amount of event discount applied to this order';
