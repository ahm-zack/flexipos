-- Migration: Create order number sequence and function
-- This creates auto-generating order numbers in format ORD-0001, ORD-0002, etc.

-- Step 1: Create sequence for order numbers
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

-- Step 3: Update existing orders to follow new format (if any exist)
-- First, let's check if there are existing orders and update them
DO $$
DECLARE
    order_record RECORD;
    counter INTEGER := 1;
BEGIN
    -- Update existing orders to new format based on creation order
    FOR order_record IN 
        SELECT id FROM orders ORDER BY created_at ASC
    LOOP
        UPDATE orders 
        SET order_number = 'ORD-' || LPAD(counter::TEXT, 4, '0')
        WHERE id = order_record.id;
        
        counter := counter + 1;
    END LOOP;
    
    -- Set the sequence to start after existing orders
    IF counter > 1 THEN
        PERFORM setval('order_number_seq', counter - 1);
    END IF;
END;
$$;

-- Step 4: Set default value for order_number column to use the function
-- Note: We'll handle this in the application layer to maintain consistency with Drizzle ORM

-- Step 5: Create index on order_number for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Verify the setup
SELECT 
    'Sequence created successfully' as status,
    currval('order_number_seq') as current_value,
    generate_order_number() as sample_order_number;
