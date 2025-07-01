-- Simple Storage Fix for Local Supabase
-- Run this in the SQL Editor step by step

-- Step 1: Check if RLS is supported
SELECT version();

-- Step 2: Try to enable RLS (if supported)
-- If this fails, skip to Step 3
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies (run these one by one)
-- Allow public read access
CREATE OR REPLACE POLICY "Allow public read access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'menu-items-images');

-- Allow authenticated users to insert
CREATE OR REPLACE POLICY "Allow authenticated insert" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'menu-items-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update
CREATE OR REPLACE POLICY "Allow authenticated update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'menu-items-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete
CREATE OR REPLACE POLICY "Allow authenticated delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'menu-items-images' AND auth.uid() IS NOT NULL);
