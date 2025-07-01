// Image Upload Utility for Menu Items
// Use this in your React components to upload images

import { createClient } from '@supabase/supabase-js';

// Use service role key for uploads to bypass RLS in development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Use service role for uploads (development only)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadMenuImage(file: File, category: string): Promise<string | null> {
  try {
    console.log('Starting upload:', { fileName: file.name, size: file.size, type: file.type });
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return null;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return null;
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    console.log('Uploading to:', fileName);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('menu-items-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    console.log('Upload response:', { data, error });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('menu-items-images')
      .getPublicUrl(fileName);

    console.log('Public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

export async function deleteMenuImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract filename from URL
    const fileName = imageUrl.split('/menu-items-images/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from('menu-items-images')
      .remove([fileName]);

    return !error;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}

// Example usage in your pizza form:
/*
import { uploadMenuImage } from '@/lib/image-upload';

const handleImageUpload = async (file: File) => {
  const imageUrl = await uploadMenuImage(file, 'pizzas');
  if (imageUrl) {
    setFormData(prev => ({ ...prev, imageUrl }));
  }
};
*/
