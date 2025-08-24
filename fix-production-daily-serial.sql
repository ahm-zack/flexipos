-- =============================================================================
-- PRODUCTION FIX: Daily Serial Reset After EOD Report
-- =============================================================================
-- This script creates a proper daily serial system that resets when EOD is generated
-- =============================================================================

-- Step 1: Create a table to track EOD report generations
CREATE TABLE IF NOT EXISTS eod_serial_resets (
    id SERIAL PRIMARY KEY,
    reset_date DATE NOT NULL UNIQUE,
    reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    eod_report_id VARCHAR(50)
);

-- Step 2: Update the get_next_daily_serial function to consider EOD resets
CREATE OR REPLACE FUNCTION get_next_daily_serial()
RETURNS TABLE(serial VARCHAR(3), serial_date DATE) AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    next_serial INTEGER;
    last_reset_date DATE;
BEGIN
    -- Check if EOD report was generated today
    SELECT reset_date INTO last_reset_date
    FROM eod_serial_resets 
    WHERE reset_date = current_date
    ORDER BY reset_at DESC 
    LIMIT 1;

    -- If EOD was generated today, count orders AFTER the reset
    IF last_reset_date IS NOT NULL THEN
        SELECT COUNT(*) + 1 
        INTO next_serial
        FROM orders 
        WHERE DATE(created_at) = current_date
        AND created_at > (
            SELECT reset_at 
            FROM eod_serial_resets 
            WHERE reset_date = current_date 
            ORDER BY reset_at DESC 
            LIMIT 1
        );
    ELSE
        -- No EOD generated today, count all orders for today
        SELECT COUNT(*) + 1 
        INTO next_serial
        FROM orders 
        WHERE DATE(created_at) = current_date;
    END IF;
    
    -- Format as 3-digit string with leading zeros
    RETURN QUERY SELECT 
        LPAD(next_serial::TEXT, 3, '0')::VARCHAR(3) as serial,
        current_date as serial_date;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create function to reset daily serial when EOD is generated
CREATE OR REPLACE FUNCTION reset_daily_serial_on_eod(eod_report_number VARCHAR(50) DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Insert a reset record for today
    INSERT INTO eod_serial_resets (reset_date, eod_report_id)
    VALUES (CURRENT_DATE, eod_report_number)
    ON CONFLICT (reset_date) 
    DO UPDATE SET 
        reset_at = NOW(),
        eod_report_id = COALESCE(EXCLUDED.eod_report_id, eod_serial_resets.eod_report_id);
    
    RAISE NOTICE 'Daily serial reset for date: % at % for EOD report: %', 
        CURRENT_DATE, NOW(), eod_report_number;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Test the functions
SELECT * FROM get_next_daily_serial();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check if the table was created
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'eod_serial_resets';

-- Check if functions were created
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('get_next_daily_serial', 'reset_daily_serial_on_eod');
