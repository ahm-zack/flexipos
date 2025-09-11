-- Add event discount columns to orders table
-- Migration: Add event discount tracking to orders
-- Created: 2025-09-11

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS event_discount_name TEXT,
ADD COLUMN IF NOT EXISTS event_discount_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS event_discount_amount DECIMAL(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN orders.event_discount_name IS 'Name of the event discount (e.g., Grand Opening, Black Friday)';
COMMENT ON COLUMN orders.event_discount_percentage IS 'Percentage of the event discount applied';
COMMENT ON COLUMN orders.event_discount_amount IS 'Amount of event discount applied to this order';
