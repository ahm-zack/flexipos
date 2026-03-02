-- ============================================================
-- 006_triggers.sql
-- Database triggers to keep auth.users and public.users in sync
-- Run after 005_rls.sql
--
-- Trigger 1: auth.users INSERT  → public.users INSERT (upsert)
--   When Supabase creates an auth user (signup, admin create),
--   automatically mirror the row into public.users.
--
-- Trigger 2: public.users DELETE → auth.users DELETE
--   When a public.users row is deleted (e.g. from the admin panel),
--   also delete the auth user so there is no orphaned auth entry.
--   Note: deleting auth.users directly already cascades to public.users
--   via the FK, so there is no infinite loop here.
-- ============================================================


-- ── Trigger 1: auth → public.users ──────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as DB owner, can write public.users
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_app_meta_data->>'user_role', 'staff'),
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;   -- code already inserted the row → skip silently

  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();


-- ── Trigger 2: public.users DELETE → auth.users DELETE ──────

CREATE OR REPLACE FUNCTION public.handle_public_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as DB owner, can delete from auth.users
SET search_path = public
AS $$
BEGIN
  -- Delete the auth user. If it no longer exists, do nothing.
  -- Deleting auth.users would normally cascade-delete public.users,
  -- but since this trigger fires AFTER the public.users row is already
  -- gone, there is nothing to cascade — no infinite loop.
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_public_user_deleted ON public.users;

CREATE TRIGGER on_public_user_deleted
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_public_user_deleted();
