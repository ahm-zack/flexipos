import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMenuImage } from '@/lib/image-upload';
import type { CreateMiniPieFormData, EditMiniPieFormData } from '@/lib/schemas';
import type { MiniPie } from '@/lib/db/schema';

// Query key factory
export const miniPieKeys = {
  all: ['miniPies'] as const,
  lists: () => [...miniPieKeys.all, 'list'] as const,
  list: (filters: string) => [...miniPieKeys.lists(), { filters }] as const,
  details: () => [...miniPieKeys.all, 'detail'] as const,
  detail: (id: string) => [...miniPieKeys.details(), id] as const,
};

// Get all mini pies
export function useMiniPies() {
  return useQuery({
    queryKey: miniPieKeys.lists(),
    queryFn: async () => {
      const response = await fetch("/api/mini-pies");
      if (!response.ok) {
        throw new Error("Failed to fetch mini pies");
      }
      return response.json();
    },
  });
}

// Get mini pie by ID
export function useMiniPie(id: string) {
  return useQuery({
    queryKey: miniPieKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/mini-pies/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch mini pie");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Create mini pie mutation
export function useCreateMiniPie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateMiniPieFormData) => {
      const response = await fetch("/api/mini-pies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create mini pie");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
    },
  });
}

// Update mini pie mutation
export function useUpdateMiniPie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: EditMiniPieFormData) => {
      const response = await fetch(`/api/mini-pies/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update mini pie");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
    },
  });
}

// Delete mini pie mutation
export function useDeleteMiniPie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (miniPie: MiniPie) => {
      // Delete image if it's not a placeholder
      if (miniPie.imageUrl && !miniPie.imageUrl.includes('placeholder')) {
        await deleteMenuImage(miniPie.imageUrl);
      }
      
      const response = await fetch(`/api/mini-pies/${miniPie.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete mini pie");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
    },
  });
}
