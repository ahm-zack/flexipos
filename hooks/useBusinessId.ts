"use client";

import { useBusinessContext } from "@/modules/providers/components/business-provider";

/**
 * Custom hook to get the current business ID
 * This replaces hardcoded business IDs throughout the application
 * Returns null if no business is found - components should handle this appropriately
 */
export function useBusinessId() {
    const { businessId, loading, error } = useBusinessContext();

    return {
        businessId: businessId || null,
        isLoading: loading,
        error,
        hasDynamicBusinessId: !!businessId,
    };
}

/**
 * Custom hook to get the full business context
 */
export function useBusiness() {
    const context = useBusinessContext();

    return {
        ...context,
        businessId: context.businessId || null,
    };
}