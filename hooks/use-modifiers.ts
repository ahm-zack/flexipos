"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ApiModifier, CreateModifierRequest, UpdateModifierRequest } from '@/lib/modifiers-service';

export interface UseModifiersOptions {
  menuItemId?: string;
  menuItemType?: string;
  autoFetch?: boolean;
}

export interface UseModifiersResult {
  // Data
  modifiers: ApiModifier[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchModifiers: (menuItemId: string, menuItemType: string) => Promise<void>;
  createModifier: (data: CreateModifierRequest) => Promise<ApiModifier | null>;
  updateModifier: (id: string, data: UpdateModifierRequest) => Promise<ApiModifier | null>;
  deleteModifier: (id: string) => Promise<boolean>;
  reorderModifiers: (modifiers: { id: string; displayOrder: number }[]) => Promise<boolean>;
  
  // Utils
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useModifiers(options: UseModifiersOptions = {}): UseModifiersResult {
  const { menuItemId, menuItemType, autoFetch = true } = options;
  
  const [modifiers, setModifiers] = useState<ApiModifier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch modifiers from API
  const fetchModifiers = useCallback(async (itemId: string, itemType: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/modifiers?menuItemId=${encodeURIComponent(itemId)}&menuItemType=${encodeURIComponent(itemType)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch modifiers');
      }
      
      const data = await response.json();
      setModifiers(data.modifiers || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch modifiers';
      setError(errorMessage);
      console.error('Error fetching modifiers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new modifier
  const createModifier = useCallback(async (data: CreateModifierRequest): Promise<ApiModifier | null> => {
    setError(null);
    
    try {
      const response = await fetch('/api/modifiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create modifier');
      }
      
      const result = await response.json();
      const newModifier = result.modifier;
      
      // Add to local state
      setModifiers(prev => [...prev, newModifier].sort((a, b) => a.displayOrder - b.displayOrder));
      
      return newModifier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create modifier';
      setError(errorMessage);
      console.error('Error creating modifier:', err);
      return null;
    }
  }, []);

  // Update an existing modifier
  const updateModifier = useCallback(async (id: string, data: UpdateModifierRequest): Promise<ApiModifier | null> => {
    setError(null);
    
    try {
      const response = await fetch(`/api/modifiers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update modifier');
      }
      
      const result = await response.json();
      const updatedModifier = result.modifier;
      
      // Update in local state
      setModifiers(prev => 
        prev.map(mod => mod.id === id ? updatedModifier : mod)
          .sort((a, b) => a.displayOrder - b.displayOrder)
      );
      
      return updatedModifier;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update modifier';
      setError(errorMessage);
      console.error('Error updating modifier:', err);
      return null;
    }
  }, []);

  // Delete a modifier
  const deleteModifier = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await fetch(`/api/modifiers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete modifier');
      }
      
      // Remove from local state
      setModifiers(prev => prev.filter(mod => mod.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete modifier';
      setError(errorMessage);
      console.error('Error deleting modifier:', err);
      return false;
    }
  }, []);

  // Reorder modifiers
  const reorderModifiers = useCallback(async (reorderData: { id: string; displayOrder: number }[]): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await fetch('/api/modifiers/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modifiers: reorderData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder modifiers');
      }
      
      // Update local state with new order
      setModifiers(prev => {
        const reorderMap = new Map(reorderData.map(item => [item.id, item.displayOrder]));
        return prev
          .map(mod => ({
            ...mod,
            displayOrder: reorderMap.get(mod.id) ?? mod.displayOrder
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder modifiers';
      setError(errorMessage);
      console.error('Error reordering modifiers:', err);
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh current data
  const refresh = useCallback(async () => {
    if (menuItemId && menuItemType) {
      await fetchModifiers(menuItemId, menuItemType);
    }
  }, [menuItemId, menuItemType, fetchModifiers]);

  // Auto-fetch on mount if menuItemId and menuItemType are provided
  useEffect(() => {
    if (autoFetch && menuItemId && menuItemType) {
      fetchModifiers(menuItemId, menuItemType);
    }
  }, [autoFetch, menuItemId, menuItemType, fetchModifiers]);

  return {
    // Data
    modifiers,
    isLoading,
    error,
    
    // Actions
    fetchModifiers,
    createModifier,
    updateModifier,
    deleteModifier,
    reorderModifiers,
    
    // Utils
    clearError,
    refresh,
  };
}
