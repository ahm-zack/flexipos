"use client";

import { QueryClient } from '@tanstack/react-query';
import { sandwichKeys } from '@/modules/sandwich-feature/queries/sandwich-keys';
import { pizzaKeys } from '@/modules/pizza-feature/queries/pizza-keys';
import { pieKeys } from '@/modules/pie-feature/queries/pie-keys';
import { miniPieKeys } from '@/modules/mini-pie-feature/queries/mini-pie-keys';

// Prefetch all menu data for instant navigation
export const prefetchMenuData = async (queryClient: QueryClient) => {
    const prefetchOptions = {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    };

    // Get the current data in cache if it exists, or trigger background fetch
    const categories = [
        sandwichKeys.lists(),
        pizzaKeys.lists(),
        pieKeys.lists(),
        miniPieKeys.lists(),
    ];

    categories.forEach(queryKey => {
        // Ensure queries for these keys will be cached longer
        queryClient.setQueryDefaults(queryKey, prefetchOptions);
    });

    console.log('✅ Menu cache policies optimized');
};

// Warm up cache by triggering background fetches
export const warmMenuCache = (queryClient: QueryClient) => {
    const categories = [
        sandwichKeys.lists(),
        pizzaKeys.lists(),
        pieKeys.lists(),
        miniPieKeys.lists(),
    ];

    // Trigger background invalidation to refresh stale data
    categories.forEach(queryKey => {
        const cachedData = queryClient.getQueryData(queryKey);
        if (!cachedData) {
            // Only prefetch if no data exists
            queryClient.prefetchQuery({ queryKey });
        }
    });
};
