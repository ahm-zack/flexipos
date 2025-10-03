"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CacheContext } from '../types';
import { categoryClientService, type Category, type NewCategory } from '../services/category-client-service';
import { categoryKeys } from '../queries/product-keys';

// Cache strategies for different contexts
const CACHE_STRATEGIES = {
    ADMIN: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    },
    CASHIER: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    },
    CUSTOMER: {
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    },
} as const;

// Fetch functions with enhanced error handling
const fetchCategories = async (businessId: string): Promise<Category[]> => {
    try {
        const categories = await categoryClientService.getCategories(businessId);
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to load categories. Please try again.');
    }
};

const fetchCategoryBySlug = async (businessId: string, slug: string): Promise<Category | null> => {
    try {
        const category = await categoryClientService.getCategoryBySlug(businessId, slug);
        return category;
    } catch (error) {
        console.error('Error fetching category by slug:', error);
        throw new Error('Failed to load category. Please try again.');
    }
};

const createCategory = async (categoryData: NewCategory): Promise<Category> => {
    try {
        const newCategory = await categoryClientService.createCategory(categoryData);
        return newCategory;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error instanceof Error ? error : new Error('Failed to create category');
    }
};

const updateCategory = async (id: string, categoryData: Partial<NewCategory>): Promise<Category> => {
    try {
        const updatedCategory = await categoryClientService.updateCategory(id, categoryData);
        return updatedCategory;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error instanceof Error ? error : new Error('Failed to update category');
    }
};

const deleteCategory = async (id: string): Promise<void> => {
    try {
        await categoryClientService.deleteCategory(id);
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error instanceof Error ? error : new Error('Failed to delete category');
    }
};

// Main hooks following pizza-feature pattern

/**
 * Get all categories for a business
 */
export function useCategories(businessId: string, context: CacheContext = 'admin') {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: categoryKeys.list(businessId),
        queryFn: () => fetchCategories(businessId),
        ...cacheStrategy,
        enabled: !!businessId,
    });
}

/**
 * Get single category by ID
 */
export function useCategory(id: string, context: CacheContext = 'admin') {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => categoryClientService.getCategoryById(id),
        ...cacheStrategy,
        enabled: !!id,
    });
}

/**
 * Get category by slug - Main hook for menu pages
 */
export function useCategoryBySlug(businessId: string, slug: string, context: CacheContext = 'admin') {
    const cacheStrategy = CACHE_STRATEGIES[context.toUpperCase() as keyof typeof CACHE_STRATEGIES];

    return useQuery({
        queryKey: categoryKeys.bySlug(businessId, slug),
        queryFn: () => fetchCategoryBySlug(businessId, slug),
        ...cacheStrategy,
        enabled: !!businessId && !!slug,
    });
}

// Mutation hooks

/**
 * Create category mutation
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: (newCategory, variables) => {
            // Invalidate categories list for the business
            queryClient.invalidateQueries({
                queryKey: categoryKeys.list(variables.businessId),
            });

            // Add the new category to cache
            queryClient.setQueryData(
                categoryKeys.detail(newCategory.id),
                newCategory
            );

            toast.success(`Category "${newCategory.name}" created successfully`);
            console.log(`✅ Category "${newCategory.name}" created successfully`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to create category';
            toast.error(message);
            console.error('❌ Failed to create category:', error);
        },
    });
}

/**
 * Update category mutation
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<NewCategory> & { id: string }) => updateCategory(data.id, data),
        onSuccess: (updatedCategory, variables) => {
            // Update the specific category in cache
            queryClient.setQueryData(
                categoryKeys.detail(variables.id),
                updatedCategory
            );

            // Invalidate categories lists to reflect changes
            queryClient.invalidateQueries({
                queryKey: categoryKeys.lists(),
            });

            toast.success(`Category "${updatedCategory.name}" updated successfully`);
            console.log(`✅ Category "${updatedCategory.name}" updated successfully`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to update category';
            toast.error(message);
            console.error('❌ Failed to update category:', error);
        },
    });
}

/**
 * Delete category mutation
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({
                queryKey: categoryKeys.detail(deletedId),
            });

            // Invalidate categories lists to reflect deletion
            queryClient.invalidateQueries({
                queryKey: categoryKeys.lists(),
            });

            toast.success('Category deleted successfully');
            console.log(`✅ Category deleted successfully`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to delete category';
            toast.error(message);
            console.error('❌ Failed to delete category:', error);
        },
    });
}