-- Migration: Add automatic role sync trigger
-- This ensures that whenever a user's role is updated in the database,
-- it's automatically synced to Supabase Auth custom claims

-- Create a function to sync role to auth metadata
CREATE OR REPLACE FUNCTION sync_user_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called whenever a user row is inserted or updated
  -- The actual sync will be handled by the application layer
  -- We just log the change here and let the app handle the sync
  
  IF TG_OP = 'INSERT' THEN
    -- New user created
    RAISE LOG 'New user created with role: % for user ID: %', NEW.role, NEW.id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    -- Role changed
    RAISE LOG 'User role changed from % to % for user ID: %', OLD.role, NEW.role, NEW.id;
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires on user insert/update
DROP TRIGGER IF EXISTS trigger_sync_user_role ON users;
CREATE TRIGGER trigger_sync_user_role
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role_to_auth();

-- Add comment
COMMENT ON FUNCTION sync_user_role_to_auth() IS 'Logs user role changes for application-level sync to Supabase Auth custom claims';
