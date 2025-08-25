-- =============================================================================
-- PRODUCTION FIX: Remove Pending Status from Orders
-- =============================================================================
-- This script removes the 'pending' status from production database
-- Run this in your production database console
-- =============================================================================

-- Step 1: Update any existing pending orders to completed
UPDATE orders 
SET status = 'completed' 
WHERE status = 'pending';

-- Step 2: Remove 'pending' from the orders_status enum
-- First, drop the existing default constraint
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

-- Create a new enum without 'pending'
CREATE TYPE orders_status_new AS ENUM ('completed', 'canceled', 'modified');

-- Step 3: Update the orders table to use the new enum
ALTER TABLE orders 
ALTER COLUMN status TYPE orders_status_new 
USING status::text::orders_status_new;

-- Step 4: Drop the old enum and rename the new one
DROP TYPE orders_status;
ALTER TYPE orders_status_new RENAME TO orders_status;

-- Step 5: Update the default value to 'completed'
ALTER TABLE orders 
ALTER COLUMN status SET DEFAULT 'completed';

-- Verify the changes
SELECT unnest(enum_range(NULL::orders_status)) AS status_values;
