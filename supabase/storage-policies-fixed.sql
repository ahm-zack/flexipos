-- Row Level Security Policies for menu-items-images Storage Bucket
-- IMPORTANT: Run this in Supabase SQL Editor with "Use service role" enabled
-- OR as a database superuser

-- First, ensure we have the right permissions
-- This should be run by a superuser or service role

-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view menu item images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to view menu item images" ON storage.objects;
DROP POLICY IF EXISTS "Allow superadmin to upload menu item images" ON storage.objects;
DROP POLICY IF EXISTS "Allow superadmin to update menu item images" ON storage.objects;
DROP POLICY IF EXISTS "Allow superadmin to delete menu item images" ON storage.objects;

-- 1. Allow authenticated users to SELECT (view/download) images from menu-items-images bucket
CREATE POLICY "Allow authenticated users to view menu item images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'menu-items-images');

-- 2. Allow public access to SELECT (view/download) images from menu-items-images bucket
-- This is needed if you want to display images to non-authenticated users (like customers viewing menu)
-- CREATE POLICY "Allow public access to view menu item images"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'menu-items-images');

-- 3. Allow authorized users to INSERT (upload) images to menu-items-images bucket
CREATE POLICY "Allow authorized users to upload menu item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- 4. Allow authorized users to UPDATE images in menu-items-images bucket
CREATE POLICY "Allow authorized users to update menu item images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
)
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- 5. Allow authorized users to DELETE images from menu-items-images bucket
CREATE POLICY "Allow authorized users to delete menu item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%menu item%';
