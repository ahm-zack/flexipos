-- Test script to verify daily serial system
-- Run this in the Supabase database to test functionality

-- 1. Check current daily serial info
SELECT 'Current Daily Serial Info:' as test_step;
SELECT * FROM get_daily_serial_info();

-- 2. Get next daily serial (should be 001 for first order today)
SELECT 'Getting Next Daily Serial:' as test_step;
SELECT * FROM get_next_daily_serial();

-- 3. Check if we can create a test order
SELECT 'Creating Test Order:' as test_step;
INSERT INTO orders (
    order_number, 
    daily_serial, 
    serial_date, 
    customer_name, 
    items, 
    total_amount, 
    payment_method, 
    created_by
) VALUES (
    'ORD-TEST1',
    '001',
    CURRENT_DATE,
    'Test Customer',
    '[{"id":"test-item","name":"Test Item","nameAr":"صنف تجريبي","quantity":1,"unitPrice":10.00,"totalPrice":10.00,"type":"pizza"}]'::jsonb,
    10.00,
    'cash',
    (SELECT id FROM users LIMIT 1)
) RETURNING order_number, daily_serial, serial_date;

-- 4. Get next serial after creating one order (should be 002)
SELECT 'Getting Next Daily Serial After First Order:' as test_step;
SELECT * FROM get_next_daily_serial();

-- 5. Check today's orders
SELECT 'Today''s Orders:' as test_step;
SELECT order_number, daily_serial, serial_date, customer_name, created_at 
FROM orders 
WHERE serial_date = CURRENT_DATE 
ORDER BY daily_serial;

-- 6. Test reset function
SELECT 'Testing Reset Function:' as test_step;
SELECT reset_daily_serial_sequence();

-- 7. Get serial after reset (should be 001 again)
SELECT 'Getting Serial After Reset:' as test_step;
SELECT * FROM get_next_daily_serial();

-- 8. Final status check
SELECT 'Final Status Check:' as test_step;
SELECT * FROM get_daily_serial_info();
