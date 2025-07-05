-- Production Storage Policies Fix
-- Run this in your Supabase SQL Editor with service role privileges

-- First, let's check current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- Create comprehensive storage policies for all buckets
-- This ensures uploads work in production

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Pie images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pie images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their pie images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete pie images" ON storage.objects;

DROP POLICY IF EXISTS "Pizza images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pizza images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their pizza images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete pizza images" ON storage.objects;

DROP POLICY IF EXISTS "Sandwich images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload sandwich images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their sandwich images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete sandwich images" ON storage.objects;

DROP POLICY IF EXISTS "Mini pie images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload mini pie images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their mini pie images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete mini pie images" ON storage.objects;

-- Create new policies for all buckets
-- PIE IMAGES
CREATE POLICY "Pie images are publicly accessible" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'pie-images');

CREATE POLICY "Authenticated users can upload pie images" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'pie-images');

CREATE POLICY "Authenticated users can update pie images" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'pie-images');

CREATE POLICY "Authenticated users can delete pie images" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'pie-images');

-- PIZZA IMAGES
CREATE POLICY "Pizza images are publicly accessible" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'pizza-images');

CREATE POLICY "Authenticated users can upload pizza images" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'pizza-images');

CREATE POLICY "Authenticated users can update pizza images" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'pizza-images');

CREATE POLICY "Authenticated users can delete pizza images" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'pizza-images');

-- SANDWICH IMAGES
CREATE POLICY "Sandwich images are publicly accessible" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'sandwich-images');

CREATE POLICY "Authenticated users can upload sandwich images" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'sandwich-images');

CREATE POLICY "Authenticated users can update sandwich images" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'sandwich-images');

CREATE POLICY "Authenticated users can delete sandwich images" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'sandwich-images');

-- MINI PIE IMAGES
CREATE POLICY "Mini pie images are publicly accessible" 
ON storage.objects FOR SELECT TO public 
USING (bucket_id = 'mini-pie-images');

CREATE POLICY "Authenticated users can upload mini pie images" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'mini-pie-images');

CREATE POLICY "Authenticated users can update mini pie images" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'mini-pie-images');

CREATE POLICY "Authenticated users can delete mini pie images" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'mini-pie-images');

-- Verify policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
