-- Complete Setup: Storage Bucket Policies + User Setup
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- Make sure you're using the "postgres" role (superuser)

-- =====================================================
-- PART 1: CREATE YOUR USER AND SET SUPERADMIN ROLE
-- =====================================================

-- Insert your user into auth.users (if not exists)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'ahm.zack@dev@gmail.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Ahmad Zack"}'
) ON CONFLICT (email) DO NOTHING;

-- Update JWT custom claims for your user
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'),
  '{user_role}',
  '"superadmin"'
)
WHERE email = 'ahm.zack@dev@gmail.com';

-- Insert into your users table (if you have one)
INSERT INTO users (
  id,
  email,
  name,
  role,
  created_at,
  updated_at
) 
SELECT 
  id,
  email,
  'Ahmad Zack',
  'superadmin',
  now(),
  now()
FROM auth.users 
WHERE email = 'ahm.zack@dev@gmail.com'
ON CONFLICT (email) DO UPDATE SET role = 'superadmin';

-- =====================================================
-- PART 2: STORAGE BUCKET POLICIES
-- =====================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-items-images', 'menu-items-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing policies for this bucket
DROP POLICY IF EXISTS "menu_images_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "menu_images_select_public" ON storage.objects;
DROP POLICY IF EXISTS "menu_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "menu_images_update" ON storage.objects;
DROP POLICY IF EXISTS "menu_images_delete" ON storage.objects;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to VIEW images (for public menu display)
CREATE POLICY "menu_images_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-items-images');

-- Policy 2: Allow authenticated users to VIEW images
CREATE POLICY "menu_images_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'menu-items-images');

-- Policy 3: Allow authorized roles to UPLOAD images
CREATE POLICY "menu_images_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (
    (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
    OR auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid -- service role fallback
  )
);

-- Policy 4: Allow authorized roles to UPDATE images
CREATE POLICY "menu_images_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (
    (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
    OR auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid -- service role fallback
  )
)
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (
    (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
    OR auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid -- service role fallback
  )
);

-- Policy 5: Allow authorized roles to DELETE images
CREATE POLICY "menu_images_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (
    (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
    OR auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid -- service role fallback
  )
);

-- =====================================================
-- PART 3: VERIFICATION
-- =====================================================

-- Check your user was created properly
SELECT 
  id, 
  email, 
  raw_app_meta_data ->> 'user_role' as user_role,
  created_at
FROM auth.users 
WHERE email = 'ahm.zack@dev@gmail.com';

-- Check storage policies were created
SELECT 
  policyname, 
  cmd, 
  roles
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE 'menu_images%'
ORDER BY policyname;

-- Check bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'menu-items-images';

-- Success message
SELECT 'Setup completed successfully! You can now upload images to the menu-items-images bucket.' as status;
