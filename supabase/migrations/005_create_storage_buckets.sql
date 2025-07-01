-- Create Storage Buckets and Policies Migration
-- This migration sets up the required storage buckets for pie and pizza images

-- Create pie-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pie-images',
  'pie-images', 
  true,
  5242880, -- 5MB in bytes
  '{"image/png","image/jpeg","image/jpg","image/webp"}'
) ON CONFLICT (id) DO NOTHING;

-- Create pizza-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pizza-images',
  'pizza-images',
  true, 
  5242880, -- 5MB in bytes
  '{"image/png","image/jpeg","image/jpg","image/webp"}'
) ON CONFLICT (id) DO NOTHING;

-- Create policy for pie-images bucket (allow public read, authenticated upload)
CREATE POLICY "Pie images are publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'pie-images');

CREATE POLICY "Authenticated users can upload pie images" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'pie-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their pie images" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'pie-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete pie images" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'pie-images' AND auth.role() = 'authenticated');

-- Create policy for pizza-images bucket (allow public read, authenticated upload)
CREATE POLICY "Pizza images are publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'pizza-images');

CREATE POLICY "Authenticated users can upload pizza images" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'pizza-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their pizza images" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'pizza-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete pizza images" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'pizza-images' AND auth.role() = 'authenticated');
