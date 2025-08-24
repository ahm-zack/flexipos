-- =============================================================================
-- PRODUCTION MIGRATION: Add Daily Serial Functionality
-- =============================================================================
-- This script safely adds daily serial columns and functions to production
-- without affecting existing orders or disrupting the application.
-- 
-- IMPORTANT: Run this during low-traffic hours and backup your database first!
-- =============================================================================

-- Step 1: Add daily_serial and serial_date columns to orders table
-- These columns are nullable, so existing orders won't be affected
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS daily_serial VARCHAR(3),
ADD COLUMN IF NOT EXISTS serial_date DATE;

-- Step 2: Create index for better performance on serial_date queries
CREATE INDEX IF NOT EXISTS idx_orders_serial_date ON orders(serial_date);

-- Step 3: Create the daily serial sequence function
-- This function generates the next daily serial number and resets daily
CREATE OR REPLACE FUNCTION get_next_daily_serial()
RETURNS TABLE(serial VARCHAR(3), serial_date DATE) AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    next_serial INTEGER;
BEGIN
    -- Get the count of orders for today
    SELECT COUNT(*) + 1 
    INTO next_serial
    FROM orders 
    WHERE DATE(created_at) = current_date;
    
    -- Format as 3-digit string with leading zeros
    RETURN QUERY SELECT 
        LPAD(next_serial::TEXT, 3, '0')::VARCHAR(3) as serial,
        current_date as serial_date;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the reset daily serial function (called by EOD report)
-- This function resets the daily serial sequence when EOD report is generated
CREATE OR REPLACE FUNCTION reset_daily_serial()
RETURNS VOID AS $$
BEGIN
    -- This function doesn't need to do anything specific since we calculate
    -- the serial based on the current date's order count each time.
    -- The reset happens naturally when the date changes.
    -- 
    -- If needed in the future, you could add logic here to:
    -- - Archive old serials
    -- - Log the reset event
    -- - Clean up any cached sequences
    
    -- For now, just log that the reset was called
    RAISE NOTICE 'Daily serial reset called for date: %', CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Test the function to ensure it works
-- This should return '001' for today if no orders exist yet today
SELECT * FROM get_next_daily_serial();

-- Step 6: Optional - Backfill existing orders with daily serials
-- WARNING: Only run this if you want to assign daily serials to existing orders
-- This will assign serial numbers based on creation date order
/*
WITH ordered_orders AS (
    SELECT 
        id,
        DATE(created_at) as order_date,
        ROW_NUMBER() OVER (
            PARTITION BY DATE(created_at) 
            ORDER BY created_at ASC
        ) as daily_sequence
    FROM orders 
    WHERE daily_serial IS NULL
)
UPDATE orders 
SET 
    daily_serial = LPAD(ordered_orders.daily_sequence::TEXT, 3, '0'),
    serial_date = ordered_orders.order_date
FROM ordered_orders 
WHERE orders.id = ordered_orders.id;
*/

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if columns were added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('daily_serial', 'serial_date');

-- Check if functions were created successfully
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('get_next_daily_serial', 'reset_daily_serial');

-- Test the daily serial generation
SELECT * FROM get_next_daily_serial();

-- Check current orders table structure
\d orders;

-- =============================================================================
-- ROLLBACK PLAN (in case something goes wrong)
-- =============================================================================
/*
-- To rollback this migration (USE WITH CAUTION):

-- Remove the columns (this will lose daily serial data!)
ALTER TABLE orders DROP COLUMN IF EXISTS daily_serial;
ALTER TABLE orders DROP COLUMN IF EXISTS serial_date;

-- Remove the functions
DROP FUNCTION IF EXISTS get_next_daily_serial();
DROP FUNCTION IF EXISTS reset_daily_serial();

-- Remove the index
DROP INDEX IF EXISTS idx_orders_serial_date;
*/
