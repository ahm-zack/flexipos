"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/modules/product-feature/hooks/useProducts';
import { categorySupabaseService, type Category } from '@/modules/product-feature/services/category-supabase-service';

// Hook to prefetch menu data for instant navigation using dynamic categories
export const useMenuPrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchDynamicMenus = async (businessId: string) => {
        try {
            // First, prefetch categories
            await queryClient.prefetchQuery({
                queryKey: ['categories', businessId],
                queryFn: () => categorySupabaseService.getCategories(businessId),
                staleTime: 10 * 60 * 1000, // 10 minutes
            });

            // Get categories to prefetch products for each
            const categories = await categorySupabaseService.getCategories(businessId);

            // Prefetch products for each category
            const prefetchPromises = categories.map(category =>
                queryClient.prefetchQuery({
                    queryKey: productKeys.listByCategory(businessId, category.id),
                    queryFn: () => import('@/modules/product-feature/services/product-supabase-service')
                        .then(service => service.productSupabaseService.getProductsByCategory(businessId, category.id)),
                    staleTime: 10 * 60 * 1000, // 10 minutes
                })
            );

            await Promise.all(prefetchPromises);
        } catch (error) {
            console.error('Error prefetching dynamic menu data:', error);
        }
    };

    return {
        prefetchDynamicMenus,
    };
};

// Hook for cache warming on app initialization
export const useMenuCacheWarming = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Warm cache on first app load with dynamic categories
        const warmCache = async () => {
            const businessId = "b1234567-89ab-cdef-0123-456789abcdef"; // TODO: Get from auth context

            try {
                // Set optimized defaults for dynamic queries
                queryClient.setQueryDefaults(['categories'], {
                    staleTime: 10 * 60 * 1000, // 10 minutes
                    gcTime: 30 * 60 * 1000, // 30 minutes
                    refetchOnWindowFocus: false,
                    refetchOnMount: false,
                });

                queryClient.setQueryDefaults(productKeys.lists(), {
                    staleTime: 10 * 60 * 1000, // 10 minutes
                    gcTime: 30 * 60 * 1000, // 30 minutes
                    refetchOnWindowFocus: false,
                    refetchOnMount: false,
                });

                // Prefetch categories
                const categoriesQueryKey = ['categories', businessId];
                const categoryState = queryClient.getQueryState(categoriesQueryKey);

                if (!categoryState || categoryState.isInvalidated) {
                    await queryClient.prefetchQuery({
                        queryKey: categoriesQueryKey,
                        queryFn: () => categorySupabaseService.getCategories(businessId),
                    });
                }

                // Prefetch products for all categories
                const cachedCategories = queryClient.getQueryData<Category[]>(categoriesQueryKey);
                const categories = cachedCategories || await categorySupabaseService.getCategories(businessId);

                const productPrefetchPromises = categories.map((category: Category) => {
                    const productQueryKey = productKeys.listByCategory(businessId, category.id);
                    const productState = queryClient.getQueryState(productQueryKey);

                    if (!productState || productState.isInvalidated) {
                        return queryClient.prefetchQuery({
                            queryKey: productQueryKey,
                            queryFn: () => import('@/modules/product-feature/services/product-supabase-service')
                                .then(service => service.productSupabaseService.getProductsByCategory(businessId, category.id)),
                        });
                    }
                    return Promise.resolve();
                });

                await Promise.all(productPrefetchPromises);
            } catch (error) {
                console.error('Error warming dynamic menu cache:', error);
            }
        };

        // Run cache warming after a short delay to avoid blocking initial render
        const timer = setTimeout(warmCache, 100);
        return () => clearTimeout(timer);
    }, [queryClient]);
};