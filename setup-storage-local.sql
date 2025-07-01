-- Setup script for local Supabase storage
-- Run this in the SQL editor at http://127.0.0.1:54323

-- 1. Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-items-images', 
  'menu-items-images', 
  TRUE, 
  5242880, -- 5MB limit
  '{"image/jpeg", "image/png", "image/webp", "image/gif"}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policies for the bucket
-- Allow anyone to view images (since bucket is public)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-items-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'menu-items-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'menu-items-images' 
  AND auth.role() = 'authenticated'
);

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE row_level_security;
