-- Migration: Add delivery payment method and platform tracking
-- Purpose: Add 'delivery' option to payment_method enum and delivery platform tracking
-- Date: 2025-09-29

-- Add delivery to payment_method enum
ALTER TYPE payment_method ADD VALUE 'delivery';

-- Create delivery platform enum
CREATE TYPE delivery_platform AS ENUM ('keeta', 'hunger_station', 'jahez');

-- Add delivery_platform column to orders table
ALTER TABLE orders ADD COLUMN delivery_platform delivery_platform;

-- Create index for delivery platform filtering
CREATE INDEX idx_orders_delivery_platform ON orders(delivery_platform) WHERE delivery_platform IS NOT NULL;

-- Verification queries
DO $$
DECLARE
    r RECORD;  -- Declare the record variable
BEGIN
    RAISE NOTICE '✅ Delivery payment system updated successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Available payment methods:';
    
    -- Get payment method enum values
    FOR r IN
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method')
        ORDER BY enumsortorder
    LOOP
        RAISE NOTICE '  - %', r.enumlabel;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Available delivery platforms:';
    
    -- Get delivery platform enum values
    FOR r IN
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'delivery_platform')
        ORDER BY enumsortorder
    LOOP
        RAISE NOTICE '  - %', r.enumlabel;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Orders table updated with delivery_platform column';
END $$;