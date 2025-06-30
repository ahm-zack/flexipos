import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Pizza } from '@/lib/db/schema';
import type { CreatePizza, UpdatePizza } from '@/lib/schemas';

// Query keys
export const pizzaKeys = {
  all: ['pizzas'] as const,
  lists: () => [...pizzaKeys.all, 'list'] as const,
  list: (filters: string) => [...pizzaKeys.lists(), { filters }] as const,
};

// API functions
const fetchPizzas = async (): Promise<Pizza[]> => {
  const response = await fetch('/api/pizzas');
  if (!response.ok) {
    throw new Error('Failed to fetch pizzas');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch pizzas');
  }
  return data.data;
};



const createPizza = async (pizzaData: CreatePizza): Promise<Pizza> => {
  const response = await fetch('/api/pizzas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pizzaData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Failed to create pizza (${response.status})`);
  }
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create pizza');
  }
  
  return data.data;
};

const updatePizza = async ({ id, data }: { id: string; data: UpdatePizza }): Promise<Pizza> => {
  const response = await fetch(`/api/pizzas/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update pizza');
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to update pizza');
  }
  
  return result.data;
};

const deletePizza = async (id: string): Promise<void> => {
  const response = await fetch(`/api/pizzas/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete pizza');
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete pizza');
  }
};

// Hooks
export const usePizzas = () => {
  return useQuery({
    queryKey: pizzaKeys.lists(),
    queryFn: fetchPizzas,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};



export const useCreatePizza = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPizza,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
    },
  });
};

export const useUpdatePizza = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePizza,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
    },
  });
};

export const useDeletePizza = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePizza,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
    },
  });
};
