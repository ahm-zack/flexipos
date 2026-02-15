import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { categorySupabaseService } from "@/modules/product-feature";
import { categoryKeys } from "@/lib/query-keys/categoryKeys";
import type { Category, NewCategory } from "@/modules/product-feature/services/category-supabase-service";
import { useBusinessId } from "@/hooks/useBusinessId";

/**
 * Hook to get all categories with caching
 * Uses dynamic business ID from authentication context
 */
export function useCategories(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;

    return useQuery({
        queryKey: categoryKeys.list(businessId || 'no-business'),
        queryFn: () => {
            if (!businessId) {
                throw new Error('Business ID is required to fetch categories');
            }
            return categorySupabaseService.getCategories(businessId);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        enabled: !!businessId,
    });
}

/**
 * Hook to get a single category by slug
 */
export function useCategoryBySlug(slug: string, overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;

    return useQuery({
        queryKey: [...categoryKeys.list(businessId || 'no-business'), 'slug', slug],
        queryFn: () => {
            if (!businessId) {
                throw new Error('Business ID is required to fetch category');
            }
            return categorySupabaseService.getCategoryBySlug(businessId, slug);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        enabled: !!slug && !!businessId,
    });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NewCategory) => {
            console.log('Creating category with data:', data);
            return categorySupabaseService.createCategory(data);
        },
        onSuccess: (newCategory) => {
            console.log('Category created successfully, updating cache:', newCategory);
            if (!businessId) return;
            // Update the cache with the new category
            queryClient.setQueryData<Category[]>(
                categoryKeys.list(businessId),
                (old) => {
                    if (!old) return [newCategory];
                    return [...old, newCategory].sort((a, b) => a.displayOrder - b.displayOrder);
                }
            );

            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: categoryKeys.list(businessId) });
        },
        onError: (error) => {
            console.error('Error creating category:', error);
        },
    });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<NewCategory> }) =>
            categorySupabaseService.updateCategory(id, data),
        onSuccess: (updatedCategory) => {
            if (!businessId) return;
            // Update the cache with the updated category
            queryClient.setQueryData<Category[]>(
                categoryKeys.list(businessId),
                (old) => {
                    if (!old) return [updatedCategory];
                    return old
                        .map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
                        .sort((a, b) => a.displayOrder - b.displayOrder);
                }
            );

            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: categoryKeys.list(businessId) });
        },
    });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categorySupabaseService.deleteCategory(id),
        onSuccess: (_, deletedId) => {
            if (!businessId) return;
            // Remove the category from cache
            queryClient.setQueryData<Category[]>(
                categoryKeys.list(businessId),
                (old) => {
                    if (!old) return [];
                    return old.filter(cat => cat.id !== deletedId);
                }
            );

            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: categoryKeys.list(businessId) });
        },
    });
}

/**
 * Prefetch categories for SSG (for use in getStaticProps)
 */
export async function prefetchCategories(queryClient: QueryClient, businessId?: string) {
    if (!businessId) {
        console.warn('Cannot prefetch categories without businessId');
        return;
    }
    await queryClient.prefetchQuery({
        queryKey: categoryKeys.list(businessId),
        queryFn: () => categorySupabaseService.getCategories(businessId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}