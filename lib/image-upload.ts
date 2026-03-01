// Image Upload Utility for Products
// Use this in your React components to upload images

export async function uploadMenuImage(file: File, _category?: string): Promise<string | null> {
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
    // Extract bucket name and filename from the URL
    // URL pattern: .../storage/v1/object/public/<bucket>/<filename>
    const match = imageUrl.match(/\/public\/([^/]+)\/(.+)$/);
    if (!match) return false;

    const [, bucketName, fileName] = match;
    if (!fileName) return false;

    // Use API route for deletion
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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