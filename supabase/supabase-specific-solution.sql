-- Supabase-specific solution
-- The storage.objects table is likely owned by supabase_storage_admin

-- Check who you are currently
SELECT current_user, session_user;

-- Switch to the storage admin role
SET ROLE supabase_storage_admin;

-- Now try to enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create your policies
CREATE POLICY "Allow authenticated users to view menu item images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'menu-items-images');

CREATE POLICY "Allow authorized users to upload menu item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

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

CREATE POLICY "Allow authorized users to delete menu item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-items-images' 
  AND (auth.jwt() ->> 'user_role') IN ('admin', 'superadmin', 'manager', 'cashier')
);

-- Reset back to original role
RESET ROLE;

-- Verify policies were created
SELECT policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%menu item%';
