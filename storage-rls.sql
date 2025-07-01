-- RLS Policies for Storage
-- Run this in the SQL Editor at http://127.0.0.1:54323

-- Allow authenticated users to upload files
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('menu-items-images', '.emptyFolderPlaceholder', null, '{}') ON CONFLICT DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE row_level_security;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Allow anyone to view public images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-items-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'menu-items-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to update their own images (for admins)
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'menu-items-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow authenticated users to delete their own images (for admins)
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'menu-items-images' 
  AND auth.uid() IS NOT NULL
);
