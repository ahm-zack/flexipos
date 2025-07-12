"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Sandwich } from '@/lib/db/schema';
import type { CreateSandwich, UpdateSandwich } from '@/lib/schemas';
import { sandwichClientService } from '@/lib/supabase-queries/sandwich-client-service';
import { sandwichKeys } from '../queries/sandwich-keys';

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
export const fetchSandwiches = async (): Promise<Sandwich[]> => {
  try {
    const sandwiches = await sandwichClientService.getSandwiches();
    return sandwiches;
  } catch (error) {
    console.error('Error fetching sandwiches:', error);
    throw new Error('Failed to load sandwiches. Please try again.');
  }
};

const createSandwich = async (sandwichData: CreateSandwich): Promise<Sandwich> => {
  try {
    const processedData = {
      ...sandwichData,
      priceWithVat: String(sandwichData.priceWithVat),
      modifiers: sandwichData.modifiers || [],
    };
    return await sandwichClientService.createSandwich(processedData);
  } catch (error) {
    console.error('Error creating sandwich:', error);
    throw new Error('Failed to create sandwich. Please try again.');
  }
};

const updateSandwich = async ({ id, data }: { id: string; data: UpdateSandwich }): Promise<Sandwich> => {
  try {
    const processedData = {
      ...data,
      priceWithVat: data.priceWithVat ? String(data.priceWithVat) : undefined,
      modifiers: data.modifiers || [],
    };
    return await sandwichClientService.updateSandwich(id, processedData);
  } catch (error) {
    console.error('Error updating sandwich:', error);
    throw new Error('Failed to update sandwich. Please try again.');
  }
};

const deleteSandwich = async (id: string): Promise<void> => {
  try {
    await sandwichClientService.deleteSandwich(id);
  } catch (error) {
    console.error('Error deleting sandwich:', error);
    throw new Error('Failed to delete sandwich. Please try again.');
  }
};

// Context-aware sandwich fetching hook
export function useSandwiches(context: 'admin' | 'cashier' | 'customer' = 'admin') {
  const strategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];
  
  return useQuery({
    queryKey: sandwichKeys.lists(),
    queryFn: fetchSandwiches,
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
export function useRefreshSandwiches() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: sandwichKeys.lists() });
  };
}

// Get sandwich by ID hook
export function useSandwich(id: string) {
  return useQuery({
    queryKey: sandwichKeys.detail(id),
    queryFn: async () => {
      const sandwich = await sandwichClientService.getSandwichById(id);
      if (!sandwich) {
        throw new Error('Sandwich not found');
      }
      return sandwich;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual items
  });
}

// Create sandwich mutation
export function useCreateSandwich() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSandwich,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sandwichKeys.lists() });
      toast.success('Sandwich created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update sandwich mutation  
export function useUpdateSandwich() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSandwich,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sandwichKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sandwichKeys.detail(id) });
      toast.success('Sandwich updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete sandwich mutation
export function useDeleteSandwich() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSandwich,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sandwichKeys.lists() });
      toast.success('Sandwich deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
