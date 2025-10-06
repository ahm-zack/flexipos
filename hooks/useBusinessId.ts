"use client";

import { useBusinessContext } from "@/modules/providers/components/business-provider";

/**
 * Custom hook to get the current business ID
 * This replaces hardcoded business IDs throughout the application
 */
export function useBusinessId() {
    const { businessId, loading, error } = useBusinessContext();

    // Fallback to demo business for development/testing
    const fallbackBusinessId = "b1234567-89ab-cdef-0123-456789abcdef";

    return {
        businessId: businessId || fallbackBusinessId,
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
        // Provide fallback for demo purposes
        businessId: context.businessId || "b1234567-89ab-cdef-0123-456789abcdef",
    };
}