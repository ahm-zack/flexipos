"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Pizza, Modifier } from '@/lib/db/schema';
import type { CreatePizza, UpdatePizza } from '@/lib/schemas';
import { pizzaClientService } from '@/lib/supabase-queries/pizza-client-service';
import { pizzaKeys } from '../queries/pizza-keys';

// Cache strategies for different contexts
const CACHE_STRATEGIES = {
  ADMIN: {
    staleTime: 2 * 60 * 1000, // 2 minutes (frequent changes)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Admin needs fresh data
  },
  CASHIER: {
    staleTime: 10 * 60 * 1000, // 10 minutes (less frequent changes)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Menu is more stable
  },
  CUSTOMER: {
    staleTime: 15 * 60 * 1000, // 15 minutes (very stable)
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Customer doesn't need real-time
  },
} as const;

// Enhanced fetch function with better error handling
const fetchPizzas = async (): Promise<Pizza[]> => {
  try {
    const pizzas = await pizzaClientService.getPizzas();
    return pizzas;
  } catch (error) {
    console.error('Error fetching pizzas:', error);
    throw new Error('Failed to load pizzas. Please try again.');
  }
};

const createPizza = async (pizzaData: CreatePizza): Promise<Pizza> => {
  try {
    const processedData = {
      ...pizzaData,
      priceWithVat: typeof pizzaData.priceWithVat === 'string' 
        ? pizzaData.priceWithVat 
        : pizzaData.priceWithVat.toString(),
    };
    const pizza = await pizzaClientService.createPizza(processedData);
    return pizza;
  } catch (error) {
    console.error('Error creating pizza:', error);
    throw new Error('Failed to create pizza. Please try again.');
  }
};

const updatePizza = async ({ id, data }: { id: string; data: UpdatePizza }): Promise<Pizza> => {
  try {
    const processedData: Partial<{
      type?: Pizza['type'];
      nameAr?: string;
      nameEn?: string;
      crust?: Pizza['crust'];
      imageUrl?: string;
      extras?: Pizza['extras'];
      priceWithVat?: string;
      modifiers?: Modifier[];
    }> = {};
    
    if (data.type !== undefined) processedData.type = data.type;
    if (data.nameAr !== undefined) processedData.nameAr = data.nameAr;
    if (data.nameEn !== undefined) processedData.nameEn = data.nameEn;
    if (data.crust !== undefined) processedData.crust = data.crust;
    if (data.imageUrl !== undefined) processedData.imageUrl = data.imageUrl;
    if (data.extras !== undefined) processedData.extras = data.extras;
    if (data.modifiers !== undefined) processedData.modifiers = data.modifiers;
    
    if (data.priceWithVat !== undefined) {
      processedData.priceWithVat = typeof data.priceWithVat === 'string' 
        ? data.priceWithVat 
        : data.priceWithVat.toString();
    }
    
    const pizza = await pizzaClientService.updatePizza(id, processedData);
    return pizza;
  } catch (error) {
    console.error('Error updating pizza:', error);
    throw new Error('Failed to update pizza. Please try again.');
  }
};

const deletePizza = async (id: string): Promise<void> => {
  try {
    await pizzaClientService.deletePizza(id);
  } catch (error) {
    console.error('Error deleting pizza:', error);
    throw new Error('Failed to delete pizza. Please try again.');
  }
};

// Context-aware pizza query hook
export const usePizzas = (context: 'admin' | 'cashier' | 'customer' = 'admin') => {
  const config = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];
  
  return useQuery({
    queryKey: pizzaKeys.lists(),
    queryFn: fetchPizzas,
    ...config,
    retry: 2,
  });
};

export const useCreatePizza = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPizza,
    onSuccess: (newPizza) => {
      // Manual cache update for immediate feedback
      queryClient.setQueryData<Pizza[]>(pizzaKeys.lists(), (old) => {
        if (!old) return [newPizza];
        return [newPizza, ...old];
      });
      
      // Also invalidate to ensure server consistency
      queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
      
      toast.success(`"${newPizza.nameEn}" created successfully! 🍕`);
    },
    onError: (error) => {
      toast.error(`Failed to create pizza: ${error.message}`);
    },
  });
};

export const useUpdatePizza = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePizza,
    onSuccess: (updatedPizza) => {
      // Manual cache update for immediate feedback
      queryClient.setQueryData<Pizza[]>(pizzaKeys.lists(), (old) => {
        if (!old) return [updatedPizza];
        return old.map(pizza => 
          pizza.id === updatedPizza.id ? updatedPizza : pizza
        );
      });
      
      queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
      toast.success(`"${updatedPizza.nameEn}" updated successfully! 🍕`);
    },
    onError: (error) => {
      toast.error(`Failed to update pizza: ${error.message}`);
    },
  });
};

export const useDeletePizza = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePizza,
    onSuccess: (_, deletedId) => {
      // Manual cache update for immediate feedback
      queryClient.setQueryData<Pizza[]>(pizzaKeys.lists(), (old) => {
        if (!old) return [];
        return old.filter(pizza => pizza.id !== deletedId);
      });
      
      queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
      toast.success('Pizza deleted successfully! 🗑️');
    },
    onError: (error) => {
      toast.error(`Failed to delete pizza: ${error.message}`);
    },
  });
};

// Manual refresh capability
export const useRefreshPizzas = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
    toast.info('Refreshing pizza data...');
  };
};

// Smart prefetching for better UX
export const usePizzaPrefetch = () => {
  const queryClient = useQueryClient();
  
  const prefetchPizza = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: pizzaKeys.detail(id),
      queryFn: () => pizzaClientService.getPizzaById(id), 
      staleTime: 5 * 60 * 1000,
    });
  };
  
  return { prefetchPizza };
};
