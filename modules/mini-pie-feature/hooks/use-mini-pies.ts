"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MiniPie } from '@/lib/db/schema';
import type { CreateMiniPie, UpdateMiniPie } from '@/lib/schemas';
import { miniPieClientService } from '@/lib/supabase-queries/mini-pie-client-service';
import { miniPieKeys } from '../queries/mini-pie-keys';

// Cache strategies for different contexts
const CACHE_STRATEGIES = {
  ADMIN: {
    staleTime: 10 * 60 * 1000, // 10 minutes - longer for persistence
    gcTime: 30 * 60 * 1000, // 30 minutes - keep data longer
    refetchOnWindowFocus: false, // Don't refetch when returning to page
    refetchOnMount: false, // Don't refetch if data exists and not stale
  },
  CASHIER: {
    staleTime: 10 * 60 * 1000, // 10 minutes (less frequent changes)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Menu is more stable
    refetchOnMount: false, // Don't refetch if data exists
  },
  CUSTOMER: {
    staleTime: 15 * 60 * 1000, // 15 minutes (very stable)
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Customer doesn't need real-time
    refetchOnMount: false, // Don't refetch if data exists
  },
} as const;

// Enhanced fetch function with better error handling
export const fetchMiniPies = async (): Promise<MiniPie[]> => {
  try {
    const miniPies = await miniPieClientService.getMiniPies();
    return miniPies;
  } catch (error) {
    console.error('Error fetching mini pies:', error);
    throw new Error('Failed to load mini pies. Please try again.');
  }
};

const createMiniPie = async (miniPieData: CreateMiniPie): Promise<MiniPie> => {
  try {
    const processedData = {
      ...miniPieData,
      priceWithVat: String(miniPieData.priceWithVat),
      modifiers: miniPieData.modifiers || [],
    };
    return await miniPieClientService.createMiniPie(processedData);
  } catch (error) {
    console.error('Error creating mini pie:', error);
    throw new Error('Failed to create mini pie. Please try again.');
  }
};

const updateMiniPie = async ({ id, data }: { id: string; data: UpdateMiniPie }): Promise<MiniPie> => {
  try {
    const processedData = {
      ...data,
      priceWithVat: data.priceWithVat ? String(data.priceWithVat) : undefined,
      modifiers: data.modifiers || [],
    };
    return await miniPieClientService.updateMiniPie(id, processedData);
  } catch (error) {
    console.error('Error updating mini pie:', error);
    throw new Error('Failed to update mini pie. Please try again.');
  }
};

const deleteMiniPie = async (id: string): Promise<void> => {
  try {
    await miniPieClientService.deleteMiniPie(id);
  } catch (error) {
    console.error('Error deleting mini pie:', error);
    throw new Error('Failed to delete mini pie. Please try again.');
  }
};

// Context-aware mini pie fetching hook
export function useMiniPies(context: 'admin' | 'cashier' | 'customer' = 'admin') {
  const strategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];
  
  return useQuery({
    queryKey: miniPieKeys.lists(),
    queryFn: fetchMiniPies,
    staleTime: strategy.staleTime,
    gcTime: strategy.gcTime,
    refetchOnWindowFocus: strategy.refetchOnWindowFocus,
    refetchOnMount: strategy.refetchOnMount,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx), but retry on server errors (5xx)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Manual refresh hook
export function useRefreshMiniPies() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
  };
}

// Get mini pie by ID hook
export function useMiniPie(id: string) {
  return useQuery({
    queryKey: miniPieKeys.detail(id),
    queryFn: async () => {
      const miniPie = await miniPieClientService.getMiniPieById(id);
      if (!miniPie) {
        throw new Error('Mini pie not found');
      }
      return miniPie;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual items
  });
}

// Create mini pie mutation
export function useCreateMiniPie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMiniPie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
      toast.success('Mini pie created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update mini pie mutation  
export function useUpdateMiniPie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateMiniPie,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
      queryClient.invalidateQueries({ queryKey: miniPieKeys.detail(id) });
      toast.success('Mini pie updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete mini pie mutation
export function useDeleteMiniPie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMiniPie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miniPieKeys.lists() });
      toast.success('Mini pie deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
