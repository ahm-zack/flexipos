"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sandwichKeys } from '@/modules/sandwich-feature/queries/sandwich-keys';
import { pizzaKeys } from '@/modules/pizza-feature/queries/pizza-keys';
import { pieKeys } from '@/modules/pie-feature/queries/pie-keys';
import { miniPieKeys } from '@/modules/mini-pie-feature/queries/mini-pie-keys';

// Hook to prefetch menu data for instant navigation
export const useMenuPrefetch = () => {
    const queryClient = useQueryClient();

    const prefetchAllMenus = () => {
        const menuCategories = [
            sandwichKeys.lists(),
            pizzaKeys.lists(),
            pieKeys.lists(),
            miniPieKeys.lists(),
        ];

        // Set optimized defaults for all menu categories
        menuCategories.forEach(queryKey => {
            queryClient.setQueryDefaults(queryKey, {
                staleTime: 10 * 60 * 1000, // 10 minutes
                gcTime: 30 * 60 * 1000, // 30 minutes
                refetchOnWindowFocus: false,
                refetchOnMount: false,
            });
        });

        // Warm cache for categories that don't have data
        menuCategories.forEach(queryKey => {
            const existingData = queryClient.getQueryData(queryKey);
            if (!existingData) {
                queryClient.prefetchQuery({ queryKey });
            }
        });
    };

    return { prefetchAllMenus };
};

// Hook to prefetch adjacent menu categories for smoother navigation
export const useAdjacentMenuPrefetch = (currentCategory: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const categoryMap: Record<string, string[]> = {
            'sandwich': ['pizza', 'pie'],
            'pizza': ['sandwich', 'mini-pie'],
            'pie': ['sandwich', 'mini-pie'],
            'mini-pie': ['pizza', 'pie'],
        };

        const adjacentCategories = categoryMap[currentCategory] || [];

        // Prefetch adjacent categories in background
        adjacentCategories.forEach(category => {
            const queryKeyMap = {
                'sandwich': sandwichKeys.lists(),
                'pizza': pizzaKeys.lists(),
                'pie': pieKeys.lists(),
                'mini-pie': miniPieKeys.lists(),
            } as const;

            const queryKey = queryKeyMap[category as keyof typeof queryKeyMap];
            if (queryKey) {
                const existingData = queryClient.getQueryData(queryKey);
                if (!existingData) {
                    // Only prefetch if no data exists to avoid unnecessary requests
                    queryClient.prefetchQuery({
                        queryKey,
                        staleTime: 10 * 60 * 1000,
                    });
                }
            }
        });
    }, [currentCategory, queryClient]);
};

// Hook for cache warming on app initialization
export const useMenuCacheWarming = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Warm cache on first app load
        const warmCache = () => {
            const menuQueries = [
                sandwichKeys.lists(),
                pizzaKeys.lists(),
                pieKeys.lists(),
                miniPieKeys.lists(),
            ];

            menuQueries.forEach(queryKey => {
                // Check if data exists and is fresh
                const queryState = queryClient.getQueryState(queryKey);
                if (!queryState || queryState.isInvalidated) {
                    queryClient.prefetchQuery({
                        queryKey,
                        staleTime: 10 * 60 * 1000,
                    });
                }
            });
        };

        // Delay warming to not interfere with initial page load
        const warmupTimer = setTimeout(warmCache, 2000);
        return () => clearTimeout(warmupTimer);
    }, [queryClient]);
};
