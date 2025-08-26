-- Disable RLS on mini_pies table for consistency with other menu item tables
-- This migration removes RLS policies and disables RLS to match pies, sandwiches, and pizzas tables

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read mini pies" ON mini_pies;
DROP POLICY IF EXISTS "Allow admin users to insert mini pies" ON mini_pies;
DROP POLICY IF EXISTS "Allow admin users to update mini pies" ON mini_pies;
DROP POLICY IF EXISTS "Allow admin users to delete mini pies" ON mini_pies;

-- Disable RLS on mini_pies table
ALTER TABLE mini_pies DISABLE ROW LEVEL SECURITY;

-- Notify completion
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Disabled RLS on mini_pies table for consistency!';
  RAISE NOTICE 'Mini pies table now matches the security model of other menu item tables';
END $$;
