import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { categoryClientService } from "@/modules/product-feature";
import { categoryKeys } from "@/lib/query-keys/categoryKeys";
import type { Category, NewCategory } from "@/modules/product-feature/services/category-client-service";

// Default business ID for now - in real multi-tenant app this would come from auth
const DEFAULT_BUSINESS_ID = "default-business-id";

/**
 * Hook to get all categories with caching
 */
export function useCategories(businessId: string = DEFAULT_BUSINESS_ID) {
    return useQuery({
        queryKey: categoryKeys.list(businessId),
        queryFn: () => categoryClientService.getCategories(businessId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to get a single category by slug
 */
export function useCategoryBySlug(slug: string, businessId: string = DEFAULT_BUSINESS_ID) {
    return useQuery({
        queryKey: [...categoryKeys.list(businessId), 'slug', slug],
        queryFn: async () => {
            const categories = await categoryClientService.getCategories(businessId);
            return categories.find(cat => cat.slug === slug) || null;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!slug,
    });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory(businessId: string = DEFAULT_BUSINESS_ID) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NewCategory) => categoryClientService.createCategory(data),
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
export function useUpdateCategory(businessId: string = DEFAULT_BUSINESS_ID) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<NewCategory> }) =>
            categoryClientService.updateCategory(id, data),
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
export function useDeleteCategory(businessId: string = DEFAULT_BUSINESS_ID) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoryClientService.deleteCategory(id),
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
export async function prefetchCategories(queryClient: QueryClient, businessId: string = DEFAULT_BUSINESS_ID) {
    await queryClient.prefetchQuery({
        queryKey: categoryKeys.list(businessId),
        queryFn: () => categoryClientService.getCategories(businessId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}