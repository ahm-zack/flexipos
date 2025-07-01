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

    // Determine bucket name based on category
    const bucketName = category === 'pies' ? 'pie-images' : 
                      category === 'pizzas' ? 'pizza-images' :
                      category === 'sandwiches' ? 'sandwich-images' :
                      category === 'mini-pies' ? 'mini-pie-images' :
                      'menu-items-images';

    // First, check if bucket exists and create if needed
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (bucketError) {
        console.error('Failed to create bucket:', bucketError);
        return null;
      }
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Upload the file
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Upload error details:', JSON.stringify(error, null, 2));
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

export async function deleteMenuImage(imageUrl: string): Promise<boolean> {
  try {
    // Determine bucket from URL and extract filename
    let bucketName = 'menu-items-images';
    let fileName = '';
    
    if (imageUrl.includes('/pie-images/')) {
      bucketName = 'pie-images';
      fileName = imageUrl.split('/pie-images/').pop() || '';
    } else if (imageUrl.includes('/pizza-images/')) {
      bucketName = 'pizza-images';
      fileName = imageUrl.split('/pizza-images/').pop() || '';
    } else if (imageUrl.includes('/sandwich-images/')) {
      bucketName = 'sandwich-images';
      fileName = imageUrl.split('/sandwich-images/').pop() || '';
    } else if (imageUrl.includes('/mini-pie-images/')) {
      bucketName = 'mini-pie-images';
      fileName = imageUrl.split('/mini-pie-images/').pop() || '';
    } else {
      fileName = imageUrl.split('/menu-items-images/').pop() || '';
    }
    
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from(bucketName)
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
