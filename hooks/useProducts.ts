import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { productSupabaseService } from "@/modules/product-feature/services/product-supabase-service";
import { categorySupabaseService } from "@/modules/product-feature/services/category-supabase-service";
import type { Product, NewProduct } from "@/modules/product-feature/services/product-supabase-service";
import { useBusinessId } from "@/hooks/useBusinessId";

// Query Keys for consistent caching
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (businessId: string) => [...productKeys.lists(), businessId] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

/**
 * Hook to get all products with caching
 * Uses dynamic business ID from authentication context
 */
export function useProducts(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;

    return useQuery({
        queryKey: productKeys.list(businessId),
        queryFn: () => productSupabaseService.getProducts(businessId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        enabled: !!businessId,
    });
}

/**
 * Hook to get products by category
 */
export function useProductsByCategory(categoryId: string, overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;

    return useQuery({
        queryKey: [...productKeys.list(businessId), 'category', categoryId],
        queryFn: () => productSupabaseService.getProductsByCategory(businessId, categoryId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        enabled: !!businessId && !!categoryId,
    });
}

/**
 * Hook to get a single product by ID
 */
export function useProductById(productId: string) {
    return useQuery({
        queryKey: [...productKeys.all, 'detail', productId],
        queryFn: () => productSupabaseService.getProductById(productId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        enabled: !!productId,
    });
}

/**
 * Hook to create a product
 */
export function useCreateProduct(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productData: Omit<NewProduct, 'businessId'>) =>
            productSupabaseService.createProduct({
                ...productData,
                businessId: businessId,
            }),
        onSuccess: (newProduct) => {
            // Update the cache with the new product
            queryClient.setQueryData<Product[]>(
                productKeys.list(businessId),
                (old) => {
                    if (!old) return [newProduct];
                    return [newProduct, ...old];
                }
            );

            // Also update category-specific cache if available
            if (newProduct.categoryId) {
                queryClient.setQueryData<Product[]>(
                    [...productKeys.list(businessId), 'category', newProduct.categoryId],
                    (old) => {
                        if (!old) return [newProduct];
                        return [newProduct, ...old];
                    }
                );
            }

            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: productKeys.list(businessId) });
        },
    });
}

/**
 * Hook to update a product
 */
export function useUpdateProduct(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<NewProduct> }) =>
            productSupabaseService.updateProduct(id, data),
        onSuccess: (updatedProduct) => {
            // Update the cache with the updated product
            queryClient.setQueryData<Product[]>(
                productKeys.list(businessId),
                (old) => {
                    if (!old) return [updatedProduct];
                    return old.map(product =>
                        product.id === updatedProduct.id ? updatedProduct : product
                    );
                }
            );

            // Also update category-specific cache if available
            if (updatedProduct.categoryId) {
                queryClient.setQueryData<Product[]>(
                    [...productKeys.list(businessId), 'category', updatedProduct.categoryId],
                    (old) => {
                        if (!old) return [updatedProduct];
                        return old.map(product =>
                            product.id === updatedProduct.id ? updatedProduct : product
                        );
                    }
                );
            }

            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: productKeys.list(businessId) });
        },
    });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct(overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => productSupabaseService.deleteProduct(productId),
        onSuccess: (_, productId) => {
            // Remove the product from cache
            queryClient.setQueryData<Product[]>(
                productKeys.list(businessId),
                (old) => {
                    if (!old) return [];
                    return old.filter(product => product.id !== productId);
                }
            );

            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: productKeys.list(businessId) });
        },
    });
}

/**
 * Hook to get products by category slug
 * This gets the category by slug first, then fetches products for that category
 */
export function useProductsByCategorySlug(categorySlug: string, overrideBusinessId?: string) {
    const { businessId: contextBusinessId } = useBusinessId();
    const businessId = overrideBusinessId || contextBusinessId;

    return useQuery({
        queryKey: [...productKeys.list(businessId), 'categorySlug', categorySlug],
        queryFn: async () => {
            // First get the category by slug to get the categoryId
            const category = await categorySupabaseService.getCategoryBySlug(businessId, categorySlug);
            if (!category) {
                return [];
            }
            // Now get products for this category
            return await productSupabaseService.getProductsByCategory(businessId, category.id);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        enabled: !!businessId && !!categorySlug,
    });
}

/**
 * Prefetch products for better performance
 */
export async function prefetchProducts(queryClient: QueryClient, businessId?: string) {
    const fallbackBusinessId = "b1234567-89ab-cdef-0123-456789abcdef";
    const finalBusinessId = businessId || fallbackBusinessId;
    await queryClient.prefetchQuery({
        queryKey: productKeys.list(finalBusinessId),
        queryFn: () => productSupabaseService.getProducts(finalBusinessId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
