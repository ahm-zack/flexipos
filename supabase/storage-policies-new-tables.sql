-- Row Level Security Policies for new menu item storage buckets
-- IMPORTANT: Run this in Supabase SQL Editor with "Use service role" enabled
-- OR as a database superuser

-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for new buckets if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view burger images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view beverage images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view side order images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view appetizer images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view shawarma images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to upload burger images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to upload beverage images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to upload side order images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to upload appetizer images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to upload shawarma images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to update burger images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to update beverage images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to update side order images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to update appetizer images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to update shawarma images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete burger images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete beverage images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete side order images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete appetizer images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authorized users to delete shawarma images" ON storage.objects;

-- 1. Allow authenticated users to SELECT (view/download) images from each bucket
CREATE POLICY "Allow authenticated users to view burger images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'burgers-images');

CREATE POLICY "Allow authenticated users to view beverage images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'beverages-images');

CREATE POLICY "Allow authenticated users to view side order images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'side-orders-images');

CREATE POLICY "Allow authenticated users to view appetizer images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'appetizers-images');

CREATE POLICY "Allow authenticated users to view shawarma images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'shawarmas-images');

-- 2. Allow authorized users to INSERT (upload) images to each bucket
CREATE POLICY "Allow authorized users to upload burger images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'burgers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to upload beverage images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'beverages-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to upload side order images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'side-orders-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to upload appetizer images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'appetizers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to upload shawarma images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shawarmas-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- 3. Allow authorized users to UPDATE images in each bucket
CREATE POLICY "Allow authorized users to update burger images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'burgers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
)
WITH CHECK (
  bucket_id = 'burgers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to update beverage images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'beverages-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
)
WITH CHECK (
  bucket_id = 'beverages-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to update side order images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'side-orders-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
)
WITH CHECK (
  bucket_id = 'side-orders-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to update appetizer images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'appetizers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
)
WITH CHECK (
  bucket_id = 'appetizers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to update shawarma images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shawarmas-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
)
WITH CHECK (
  bucket_id = 'shawarmas-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- 4. Allow authorized users to DELETE images from each bucket
CREATE POLICY "Allow authorized users to delete burger images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'burgers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to delete beverage images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'beverages-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to delete side order images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'side-orders-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to delete appetizer images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'appetizers-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

CREATE POLICY "Allow authorized users to delete shawarma images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'shawarmas-images'
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%images';
