-- Migration: Add payment_method column to orders table
-- Run this script to add the payment_method column with enum values

-- Create the payment_method enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the payment_method column to the orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method payment_method NOT NULL DEFAULT 'cash';

-- Add index for better query performance on payment method
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Update any existing orders to have 'cash' as default payment method (if needed)
-- This is already handled by the DEFAULT 'cash' constraint above

-- Verify the column was added
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name = 'payment_method';
