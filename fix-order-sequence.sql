-- Fix order number sequence to prevent duplicate key errors
-- This script synchronizes the sequence with existing orders

-- Step 1: Find the highest existing order number
DO $$
DECLARE
    max_order_num INTEGER := 0;
    current_order TEXT;
BEGIN
    -- Get the highest order number from existing orders
    SELECT order_number INTO current_order
    FROM orders 
    WHERE order_number ~ '^ORD-[0-9]+$'
    ORDER BY 
        CAST(SUBSTRING(order_number FROM 'ORD-([0-9]+)') AS INTEGER) DESC
    LIMIT 1;
    
    -- Extract the number part
    IF current_order IS NOT NULL THEN
        max_order_num := CAST(SUBSTRING(current_order FROM 'ORD-([0-9]+)') AS INTEGER);
        RAISE NOTICE 'Found highest order number: %, extracted number: %', current_order, max_order_num;
    ELSE
        RAISE NOTICE 'No existing orders found, starting from 1';
    END IF;
    
    -- Reset the sequence to start from the next number
    PERFORM setval('order_number_seq', max_order_num + 1, false);
    
    RAISE NOTICE 'Set sequence to start from: %', max_order_num + 1;
END $$;
