-- Row Level Security Policies for menu-items-images Storage Bucket
-- Run these SQL commands in your Supabase SQL Editor

-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to SELECT (view/download) images from menu-items-images bucket
CREATE POLICY "Allow authenticated users to view menu item images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'menu-items-images');

-- 2. Allow public authinticated to SELECT (view/download) images from menu-items-images bucket
-- This is needed if you want to display images to non-authenticated users (like customers viewing menu)
-- CREATE POLICY "Allow public access to view menu item images"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'menu-items-images');

-- 3. Allow superadmin users to INSERT (upload) images to menu-items-images bucket
CREATE POLICY "Allow superadmin to upload menu item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- 4. Allow superadmin users to UPDATE images in menu-items-images bucket
CREATE POLICY "Allow superadmin to update menu item images"
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

-- 5. Allow superadmin users to DELETE images from menu-items-images bucket
CREATE POLICY "Allow superadmin to delete menu item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- Optional: If you want to allow admin users (not just superadmin) to manage images
-- Uncomment the policies below if you want admin users to also have access

/*
-- Allow admin users to INSERT (upload) images
CREATE POLICY "Allow admin to upload menu item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin')
);

-- Allow admin users to UPDATE images
CREATE POLICY "Allow admin to update menu item images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin')
)
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin')
);

-- Allow admin users to DELETE images
CREATE POLICY "Allow admin to delete menu item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin')
);
*/

-- Verify the policies are created correctly
-- You can run this to see all policies for the storage.objects table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
