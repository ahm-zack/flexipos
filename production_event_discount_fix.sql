-- Production Migration Script - Updated
-- Run this directly in your Supabase SQL Editor or via psql
-- This ensures the orders table has the correct event discount columns and removes old event_id

-- Remove events table if it exists (we're using simple approach)
DROP TABLE IF EXISTS events CASCADE;

-- Ensure event discount columns exist in orders table
DO $$
BEGIN
    -- Add event_discount_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'event_discount_name'
    ) THEN
        ALTER TABLE orders ADD COLUMN event_discount_name TEXT;
    END IF;

    -- Add event_discount_percentage column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'event_discount_percentage'
    ) THEN
        ALTER TABLE orders ADD COLUMN event_discount_percentage DECIMAL(5,2);
    END IF;

    -- Add event_discount_amount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'event_discount_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN event_discount_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
END
$$;

-- IMPORTANT: Remove event_id column if it exists (this was causing the EOD report error)
ALTER TABLE orders DROP COLUMN IF EXISTS event_id;

-- Add comments for documentation
COMMENT ON COLUMN orders.event_discount_name IS 'Name of the event discount (e.g., Grand Opening, Black Friday)';
COMMENT ON COLUMN orders.event_discount_percentage IS 'Percentage of the event discount applied';
COMMENT ON COLUMN orders.event_discount_amount IS 'Amount of event discount applied to this order';

-- Verify the columns exist and event_id is removed
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND (column_name LIKE '%event%' OR column_name LIKE '%discount%')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Production database updated successfully!';
    RAISE NOTICE 'Added event discount columns: event_discount_name, event_discount_percentage, event_discount_amount';
    RAISE NOTICE 'Removed old event_id column that was causing EOD report errors';
    RAISE NOTICE 'EOD reports should now work correctly';
END $$;
