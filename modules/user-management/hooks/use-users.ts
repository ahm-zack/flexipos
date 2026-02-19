'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BusinessUserWithDetails } from '@/lib/user-service-drizzle';

// API function types
interface CreateUserData {
  email: string;
  name: string;
  role: string;
  password: string;
  permissions?: Record<string, unknown>;
}

interface UpdateUserData {
  fullName?: string;
  name?: string;
  role?: string;
  permissions?: Record<string, unknown>;
  isActive?: boolean;
  phone?: string;
  avatarUrl?: string;
}

// API functions
const userAPI = {
  getUsers: async (): Promise<BusinessUserWithDetails[]> => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  createUser: async (userData: CreateUserData): Promise<BusinessUserWithDetails> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  updateUser: async ({ id, data }: { id: string; data: UpdateUserData }): Promise<BusinessUserWithDetails> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
  },
};

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userAPI.getUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
