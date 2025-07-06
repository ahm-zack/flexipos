-- Migration: Fix order number sequence to use ORD-0001 format
-- This migration sets up the proper order numbering system

-- Step 1: Create sequence for order numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS order_number_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  NO CYCLE;

-- Step 2: Create function to generate formatted order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Step 3: Check current orders and update sequence accordingly
DO $$
DECLARE
    max_order_num INTEGER := 0;
    current_order RECORD;
BEGIN
    -- Find the highest order number currently in use
    FOR current_order IN 
        SELECT order_number FROM orders 
        WHERE order_number ~ '^ORD-[0-9]+$'
        ORDER BY order_number DESC
        LIMIT 1
    LOOP
        -- Extract the number from ORD-XXXX format
        max_order_num := CAST(SUBSTRING(current_order.order_number FROM 'ORD-([0-9]+)') AS INTEGER);
        EXIT;
    END LOOP;
    
    -- If we found existing ORD numbers, set sequence to continue from there
    IF max_order_num > 0 THEN
        PERFORM setval('order_number_seq', max_order_num);
        RAISE NOTICE 'Set sequence to continue from order number: %', max_order_num;
    ELSE
        -- Check if there are any orders at all and convert them
        IF EXISTS (SELECT 1 FROM orders) THEN
            -- Update existing orders to new format based on creation order
            max_order_num := 0;
            FOR current_order IN 
                SELECT id FROM orders ORDER BY created_at ASC
            LOOP
                max_order_num := max_order_num + 1;
                UPDATE orders 
                SET order_number = 'ORD-' || LPAD(max_order_num::TEXT, 4, '0')
                WHERE id = current_order.id;
            END LOOP;
            
            -- Set sequence to continue after existing orders
            PERFORM setval('order_number_seq', max_order_num);
            RAISE NOTICE 'Updated % existing orders to new format', max_order_num;
        END IF;
    END IF;
END;
$$;

-- Step 4: Create index on order_number for performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Step 5: Grant necessary permissions
GRANT USAGE ON SEQUENCE order_number_seq TO authenticated;
GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated;

-- Verification
SELECT 'Migration completed successfully. Next order number will be: ' || generate_order_number() as status;
