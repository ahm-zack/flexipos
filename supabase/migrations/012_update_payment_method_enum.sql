-- Migration: Update Payment Method Enum
-- Purpose: Update payment_method enum to only include actual payment methods used in the system
-- Date: 2025-07-06

-- First, drop the existing enum and recreate it with correct values
-- Note: This will only work if no data exists or in development
DROP TYPE IF EXISTS payment_method CASCADE;
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mixed');

-- If you have existing data, you would need to:
-- 1. Add new enum values first
-- 2. Update existing data to use new values  
-- 3. Remove old enum values
-- This is a simplified approach for development

-- Grant usage to authenticated users
GRANT USAGE ON TYPE payment_method TO authenticated;
GRANT USAGE ON TYPE payment_method TO service_role;
