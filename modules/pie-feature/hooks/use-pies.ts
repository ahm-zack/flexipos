"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Pie } from '@/lib/db/schema';
import type { CreatePie, UpdatePie } from '@/lib/schemas';
import { pieClientService } from '@/lib/supabase/client-db';
import { pieKeys } from '../queries/pie-keys';

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
export const fetchPies = async (): Promise<Pie[]> => {
  try {
    const pies = await pieClientService.getPies();
    return pies;
  } catch (error) {
    console.error('Error fetching pies:', error);
    throw new Error('Failed to load pies. Please try again.');
  }
};

const createPie = async (pieData: CreatePie): Promise<Pie> => {
  try {
    const processedData = {
      ...pieData,
      priceWithVat: String(pieData.priceWithVat),
      modifiers: pieData.modifiers || [],
    };
    return await pieClientService.createPie(processedData);
  } catch (error) {
    console.error('Error creating pie:', error);
    throw new Error('Failed to create pie. Please try again.');
  }
};

const updatePie = async ({ id, data }: { id: string; data: UpdatePie }): Promise<Pie> => {
  try {
    const processedData = {
      ...data,
      priceWithVat: data.priceWithVat ? String(data.priceWithVat) : undefined,
      modifiers: data.modifiers || [],
    };
    return await pieClientService.updatePie(id, processedData);
  } catch (error) {
    console.error('Error updating pie:', error);
    throw new Error('Failed to update pie. Please try again.');
  }
};

const deletePie = async (id: string): Promise<void> => {
  try {
    await pieClientService.deletePie(id);
  } catch (error) {
    console.error('Error deleting pie:', error);
    throw new Error('Failed to delete pie. Please try again.');
  }
};

// Context-aware pie fetching hook
export function usePies(context: 'admin' | 'cashier' | 'customer' = 'admin') {
  const strategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];
  
  return useQuery({
    queryKey: pieKeys.lists(),
    queryFn: fetchPies,
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
export function useRefreshPies() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: pieKeys.all });
  };
}

// Prefetch hook for performance optimization
export function usePiePrefetch() {
  const queryClient = useQueryClient();
  
  const prefetchPies = (context: 'admin' | 'cashier' | 'customer' = 'admin') => {
    const strategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];
    
    return queryClient.prefetchQuery({
      queryKey: pieKeys.lists(),
      queryFn: fetchPies,
      staleTime: strategy.staleTime,
    });
  };
  
  return { prefetchPies };
}

// Create pie mutation
export function useCreatePie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPie,
    onSuccess: (newPie) => {
      // Update the cache immediately
      queryClient.setQueryData<Pie[]>(pieKeys.lists(), (oldPies) => {
        return oldPies ? [newPie, ...oldPies] : [newPie];
      });
      
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: pieKeys.all });
      
      toast.success(`${newPie.nameEn} created successfully! 🥧`);
    },
    onError: (error: Error) => {
      console.error('Create pie error:', error);
      toast.error(error.message || 'Failed to create pie');
    },
  });
}

// Update pie mutation
export function useUpdatePie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePie,
    onSuccess: (updatedPie) => {
      // Update the cache immediately
      queryClient.setQueryData<Pie[]>(pieKeys.lists(), (oldPies) => {
        return oldPies
          ? oldPies.map((pie) => (pie.id === updatedPie.id ? updatedPie : pie))
          : [updatedPie];
      });
      
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: pieKeys.all });
      
      toast.success(`${updatedPie.nameEn} updated successfully!`);
    },
    onError: (error: Error) => {
      console.error('Update pie error:', error);
      toast.error(error.message || 'Failed to update pie');
    },
  });
}

// Delete pie mutation
export function useDeletePie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePie,
    onMutate: async (pieId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: pieKeys.lists() });
      
      // Snapshot the previous value
      const previousPies = queryClient.getQueryData<Pie[]>(pieKeys.lists());
      
      // Optimistically update
      queryClient.setQueryData<Pie[]>(pieKeys.lists(), (oldPies) => {
        return oldPies ? oldPies.filter((pie) => pie.id !== pieId) : [];
      });
      
      return { previousPies };
    },
    onError: (error, pieId, context) => {
      // Rollback on error
      if (context?.previousPies) {
        queryClient.setQueryData(pieKeys.lists(), context.previousPies);
      }
      console.error('Delete pie error:', error);
      toast.error(error.message || 'Failed to delete pie');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: pieKeys.all });
    },
  });
}
