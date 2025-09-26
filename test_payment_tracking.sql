-- Test payment tracking columns by inserting a sample order with payment data
INSERT INTO public.orders (
    order_number,
    customer_name,
    items,
    total_amount,
    payment_method,
    status,
    -- Payment tracking fields
    cash_amount,
    card_amount,
    cash_received,
    change_amount,
    created_by
) VALUES (
    'TEST-001',
    'Test Customer',
    '[{"id":"test-item","type":"pizza","name":"Test Pizza","nameAr":"بيتزا تجريبية","quantity":1,"unitPrice":25.00,"totalPrice":25.00}]'::jsonb,
    25.00,
    'cash',
    'completed',
    -- Payment tracking data
    25.00,  -- cash_amount
    NULL,   -- card_amount
    30.00,  -- cash_received
    5.00,   -- change_amount
    '550e8400-e29b-41d4-a716-446655440000'  -- dummy user ID
);