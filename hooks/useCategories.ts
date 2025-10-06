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
        queryKey: categoryKeys.list(businessId),
        queryFn: () => categorySupabaseService.getCategories(businessId),
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
        queryKey: [...categoryKeys.list(businessId), 'slug', slug],
        queryFn: async () => {
            const categories = await categorySupabaseService.getCategories(businessId);
            return categories.find(cat => cat.slug === slug) || null;
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
        mutationFn: (data: NewCategory) => categorySupabaseService.createCategory(data),
        onSuccess: (newCategory) => {
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
    const fallbackBusinessId = "b1234567-89ab-cdef-0123-456789abcdef";
    const finalBusinessId = businessId || fallbackBusinessId;
    await queryClient.prefetchQuery({
        queryKey: categoryKeys.list(finalBusinessId),
        queryFn: () => categorySupabaseService.getCategories(finalBusinessId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}