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

// API functions
const fetchMiniPies = async (): Promise<MiniPie[]> => {
  const response = await fetch("/api/mini-pies");
  if (!response.ok) {
    throw new Error("Failed to fetch mini pies");
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch mini pies");
  }
  return data.data;
};

const createMiniPie = async (miniPieData: CreateMiniPieFormData): Promise<MiniPie> => {
  const response = await fetch("/api/mini-pies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(miniPieData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to create mini pie (${response.status})`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to create mini pie');
  }

  return data.data;
};

const updateMiniPie = async ({ id, data }: { id: string; data: EditMiniPieFormData }): Promise<MiniPie> => {
  const response = await fetch(`/api/mini-pies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || `Failed to update mini pie (${response.status})`);
  }

  if (!responseData.success) {
    throw new Error(responseData.error || 'Failed to update mini pie');
  }

  return responseData.data;
};

const deleteMiniPie = async (miniPie: MiniPie): Promise<void> => {
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
};

// Hooks
export function useMiniPies() {
  return useQuery({
    queryKey: miniPieKeys.lists(),
    queryFn: fetchMiniPies,
    staleTime: 5 * 60 * 1000, // 5 minutes - same as pizza
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
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch mini pie");
      }
      return data.data;
    },
    enabled: !!id,
  });
}

export const useCreateMiniPie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMiniPie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
    },
  });
};

export const useUpdateMiniPie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateMiniPie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
    },
  });
};

export const useDeleteMiniPie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMiniPie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
    },
  });
};
