-- Supabase Custom Claims and RBAC Implementation
-- This follows the official Supabase guide for custom claims and RBAC

-- First, let's create a function to get the user's role from the custom claims
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (auth.jwt() ->> 'user_role')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN get_user_role(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has required role or higher
CREATE OR REPLACE FUNCTION has_role_or_higher(required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_hierarchy JSONB;
BEGIN
  user_role := get_current_user_role();
  
  -- Define role hierarchy (higher numbers = more permissions)
  role_hierarchy := '{
    "cashier": 1,
    "kitchen": 1,
    "manager": 2,
    "admin": 3,
    "superadmin": 4
  }';
  
  -- Check if user has required role or higher
  RETURN (role_hierarchy ->> user_role)::INT >= (role_hierarchy ->> required_role)::INT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set custom claims (this will be called by our application)
CREATE OR REPLACE FUNCTION set_user_role_claim(user_id UUID, role TEXT)
RETURNS VOID AS $$
BEGIN
  -- This function will be used by the application layer with service role
  -- For now, we'll just log the action
  RAISE NOTICE 'Setting role % for user %', role, user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync role between users table and auth.users metadata
-- Note: This will be handled by the application layer instead
CREATE OR REPLACE FUNCTION sync_user_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Application will handle syncing to auth.users via service role
  RAISE NOTICE 'Role change detected for user %, new role: %', NEW.id, NEW.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role sync
DROP TRIGGER IF EXISTS sync_user_role_trigger ON users;
CREATE TRIGGER sync_user_role_trigger
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role_to_auth();

-- Now let's implement proper RLS policies based on roles

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert users" ON users;
DROP POLICY IF EXISTS "Users can update users" ON users;
DROP POLICY IF EXISTS "Users can delete users" ON users;

-- Create proper role-based policies

-- 1. SELECT: Admins and above can view all users, others can only view themselves
CREATE POLICY "Role-based user viewing" ON users
  FOR SELECT USING (
    has_role_or_higher('admin') OR 
    auth.uid() = id
  );

-- 2. INSERT: Only super admins can create users
CREATE POLICY "Only super admins can create users" ON users
  FOR INSERT WITH CHECK (
    has_role_or_higher('superadmin')
  );

-- 3. UPDATE: Super admins can update anyone, users can update themselves (except role)
CREATE POLICY "Role-based user updates" ON users
  FOR UPDATE 
  USING (
    has_role_or_higher('superadmin') OR 
    auth.uid() = id
  )
  WITH CHECK (
    has_role_or_higher('superadmin') OR 
    (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()))
  );

-- 4. DELETE: Only super admins can delete users
CREATE POLICY "Only super admins can delete users" ON users
  FOR DELETE USING (
    has_role_or_higher('superadmin')
  );

-- Initial sync will be handled by the application layer
-- using the service role to update auth.users metadata
SELECT 'RBAC migration completed. Custom claims sync will be handled by application.' as message;
