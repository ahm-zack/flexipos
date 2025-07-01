-- Create mini-pie-images storage bucket and policies

-- Create mini-pie-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mini-pie-images',
  'mini-pie-images',
  true, 
  5242880, -- 5MB in bytes
  '{"image/png","image/jpeg","image/jpg","image/webp"}'
) ON CONFLICT (id) DO NOTHING;

-- Create policy for mini-pie-images bucket (allow public read, authenticated upload)
CREATE POLICY "Mini pie images are publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'mini-pie-images');

CREATE POLICY "Authenticated users can upload mini pie images" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'mini-pie-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their mini pie images" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'mini-pie-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete mini pie images" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'mini-pie-images' AND auth.role() = 'authenticated');
