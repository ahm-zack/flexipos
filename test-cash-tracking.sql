-- Test the cash tracking functionality in EOD reports
-- This script creates test orders with different payment types and checks if the cash tracking works

-- Test data for orders with cash payments
INSERT INTO orders (
    order_number, 
    daily_serial,
    serial_date,
    customer_name, 
    items, 
    total_amount, 
    payment_method,
    cash_amount,
    cash_received,
    change_amount,
    created_by
) VALUES 
-- Cash order example
('TEST-001', '001', '2025-09-28', 'Test Customer 1', 
 '[{"id":"pizza-1","type":"pizza","name":"Margherita Pizza","nameAr":"بيتزا مارجاريتا","quantity":1,"unitPrice":25.00,"totalPrice":25.00}]'::jsonb,
 25.00, 'cash', 25.00, 30.00, 5.00, 
 (SELECT id FROM auth.users WHERE email LIKE '%test%' LIMIT 1)),

-- Card order example 
('TEST-002', '002', '2025-09-28', 'Test Customer 2', 
 '[{"id":"pie-1","type":"pie","name":"Apple Pie","nameAr":"فطيرة التفاح","quantity":1,"unitPrice":15.00,"totalPrice":15.00}]'::jsonb,
 15.00, 'card', NULL, NULL, NULL,
 (SELECT id FROM auth.users WHERE email LIKE '%test%' LIMIT 1)),

-- Mixed payment order example
('TEST-003', '003', '2025-09-28', 'Test Customer 3', 
 '[{"id":"sandwich-1","type":"sandwich","name":"Club Sandwich","nameAr":"ساندويش كلوب","quantity":2,"unitPrice":12.00,"totalPrice":24.00}]'::jsonb,
 24.00, 'mixed', 14.00, 20.00, 6.00,
 (SELECT id FROM auth.users WHERE email LIKE '%test%' LIMIT 1));

-- Add corresponding card amounts for mixed payment
UPDATE orders 
SET card_amount = 10.00 
WHERE order_number = 'TEST-003';

-- Check the test data
SELECT 
    order_number,
    payment_method,
    total_amount,
    cash_amount,
    card_amount,
    cash_received,
    change_amount,
    created_at
FROM orders 
WHERE order_number LIKE 'TEST-%'
ORDER BY order_number;