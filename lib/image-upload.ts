// Image Upload Utility for Menu Items
// Use this in your React components to upload images

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

    // Create FormData to send to API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    // Upload via API route
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload failed:', errorData.error);
      return null;
    }

    const { imageUrl } = await response.json();
    return imageUrl;

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

    // Use API route for deletion as well
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bucketName, fileName }),
    });

    if (!response.ok) {
      console.error('Delete failed:', await response.text());
      return false;
    }

    return true;
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
