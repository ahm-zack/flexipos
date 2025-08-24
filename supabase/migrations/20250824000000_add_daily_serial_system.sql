-- Migration: Add Daily Serial Number System
-- This adds dual numbering: global orderNumber + daily resetting serial

-- Step 1: Add new columns to orders table
DO $$
BEGIN
    -- Add daily_serial column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'daily_serial'
    ) THEN
        ALTER TABLE orders ADD COLUMN daily_serial VARCHAR(10);
        RAISE NOTICE 'Added daily_serial column to orders table';
    END IF;

    -- Add serial_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'serial_date'
    ) THEN
        ALTER TABLE orders ADD COLUMN serial_date DATE;
        RAISE NOTICE 'Added serial_date column to orders table';
    END IF;
END $$;

-- Step 2: Create daily serial sequence
CREATE SEQUENCE IF NOT EXISTS daily_order_serial_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Step 3: Create function to get next daily serial
CREATE OR REPLACE FUNCTION get_next_daily_serial()
RETURNS TABLE(serial VARCHAR(10), serial_date DATE) AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    next_serial INTEGER;
    last_serial_date DATE;
BEGIN
    -- Check the last serial date in the orders table
    SELECT MAX(o.serial_date) INTO last_serial_date 
    FROM orders o 
    WHERE o.serial_date IS NOT NULL;
    
    -- If it's a new day or no serials exist yet, reset sequence
    IF last_serial_date IS NULL OR last_serial_date < current_date THEN
        PERFORM setval('daily_order_serial_seq', 1, false);
        RAISE NOTICE 'Reset daily serial sequence for new day: %', current_date;
    END IF;
    
    -- Get next serial number
    SELECT nextval('daily_order_serial_seq') INTO next_serial;
    
    -- Return formatted serial and current date
    RETURN QUERY SELECT 
        LPAD(next_serial::TEXT, 3, '0')::VARCHAR(10) as serial,
        current_date as serial_date;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create function to reset daily serial sequence (for EOD)
CREATE OR REPLACE FUNCTION reset_daily_serial_sequence()
RETURNS VOID AS $$
BEGIN
    PERFORM setval('daily_order_serial_seq', 1, false);
    RAISE NOTICE 'Daily serial sequence reset manually';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create function to get current daily serial info
CREATE OR REPLACE FUNCTION get_daily_serial_info()
RETURNS TABLE(
    current_serial INTEGER,
    today_count INTEGER,
    last_reset_date DATE
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        COALESCE(last_value, 0)::INTEGER as current_serial,
        COUNT(*)::INTEGER as today_count,
        MAX(o.serial_date) as last_reset_date
    FROM daily_order_serial_seq seq
    CROSS JOIN orders o
    WHERE o.serial_date = CURRENT_DATE
       OR o.serial_date IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Grant permissions
GRANT USAGE ON SEQUENCE daily_order_serial_seq TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_daily_serial() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_daily_serial_sequence() TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_serial_info() TO authenticated;

-- Step 7: Backfill existing orders with daily serials
-- This will assign daily serials to existing orders based on their creation date
WITH daily_orders AS (
    SELECT 
        id,
        created_at::date as order_date,
        ROW_NUMBER() OVER (PARTITION BY created_at::date ORDER BY created_at) as daily_seq
    FROM orders 
    WHERE daily_serial IS NULL
),
updated_orders AS (
    UPDATE orders 
    SET 
        daily_serial = LPAD(daily_orders.daily_seq::TEXT, 3, '0'),
        serial_date = daily_orders.order_date
    FROM daily_orders 
    WHERE orders.id = daily_orders.id
    RETURNING orders.id
)
SELECT COUNT(*) FROM updated_orders;

-- Step 8: Update sequence to continue from the highest daily serial for today
DO $$
DECLARE
    max_today_serial INTEGER;
BEGIN
    -- Get the highest serial number for today
    SELECT COALESCE(MAX(daily_serial::INTEGER), 0) INTO max_today_serial
    FROM orders 
    WHERE serial_date = CURRENT_DATE
      AND daily_serial ~ '^[0-9]+$'; -- Only numeric serials
    
    -- Set sequence to continue from there
    IF max_today_serial > 0 THEN
        PERFORM setval('daily_order_serial_seq', max_today_serial, true);
        RAISE NOTICE 'Set daily serial sequence to continue from: %', max_today_serial;
    END IF;
END $$;

-- Step 9: Add index for performance
CREATE INDEX IF NOT EXISTS idx_orders_serial_date ON orders(serial_date);
CREATE INDEX IF NOT EXISTS idx_orders_daily_serial ON orders(daily_serial);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Daily serial system migration completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update application code to use daily serials';
    RAISE NOTICE '2. Test order creation';
    RAISE NOTICE '3. Test EOD reset functionality';
END $$;
