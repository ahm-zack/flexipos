import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMenuImage, deleteMenuImage } from '@/lib/image-upload';
import type { CreateSandwichFormData, EditSandwichFormData } from '@/lib/schemas';
import type { Sandwich } from '@/lib/db/schema';

// Query key factory
export const sandwichKeys = {
  all: ['sandwiches'] as const,
  lists: () => [...sandwichKeys.all, 'list'] as const,
  list: (filters: string) => [...sandwichKeys.lists(), { filters }] as const,
  details: () => [...sandwichKeys.all, 'detail'] as const,
  detail: (id: string) => [...sandwichKeys.details(), id] as const,
};

// Get all sandwiches
export function useSandwiches() {
  return useQuery({
    queryKey: sandwichKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/sandwiches");
      if (!response.ok) {
        throw new Error("Failed to fetch sandwiches");
      }
      return response.json();
    },
  });
}

// Get sandwich by ID
export function useSandwich(id: string) {
  return useQuery({
    queryKey: sandwichKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/sandwiches/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sandwich");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create sandwich mutation
export function useCreateSandwich() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSandwichFormData) => {
      let imageUrl = '';
      
      // Upload image if provided
      if (data.image) {
        const uploadedUrl = await uploadMenuImage(data.image, 'sandwiches');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // If no image uploaded, use placeholder
      if (!imageUrl) {
        const sandwichType = data.type.toLowerCase().replace(/\s+/g, '+');
        imageUrl = `https://via.placeholder.com/300x200/8B4513/FFFFFF?text=${sandwichType}`;
      }

      const sandwichData = {
        type: data.type,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        size: data.size,
        imageUrl,
        priceWithVat: data.priceWithVat.toString(),
        modifiers: data.modifiers || [],
      };

      const response = await fetch("/api/sandwiches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sandwichData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create sandwich");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sandwichKeys.lists() });
    },
  });
}

// Update sandwich mutation
export function useUpdateSandwich() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EditSandwichFormData) => {
      let imageUrl = data.imageUrl;
      
      // Upload new image if provided
      if (data.image) {
        // Delete old image if it exists and is not a placeholder
        if (imageUrl && !imageUrl.includes('placeholder')) {
          await deleteMenuImage(imageUrl);
        }
        
        const uploadedUrl = await uploadMenuImage(data.image, 'sandwiches');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const updateData = {
        type: data.type,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        size: data.size,
        imageUrl,
        priceWithVat: data.priceWithVat.toString(),
        modifiers: data.modifiers || [],
      };

      const response = await fetch(`/api/sandwiches/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update sandwich");
      }

      return response.json();
    },
    onSuccess: (updatedSandwich) => {
      queryClient.invalidateQueries({ queryKey: sandwichKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sandwichKeys.detail(updatedSandwich.id) });
    },
  });
}

// Delete sandwich mutation
export function useDeleteSandwich() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sandwich: Sandwich) => {
      // Delete image if it's not a placeholder
      if (sandwich.imageUrl && !sandwich.imageUrl.includes('placeholder')) {
        await deleteMenuImage(sandwich.imageUrl);
      }
      
      const response = await fetch(`/api/sandwiches/${sandwich.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete sandwich");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sandwichKeys.lists() });
    },
  });
}
