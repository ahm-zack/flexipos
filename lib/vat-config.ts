/**
 * VAT Configuration
 * Controls VAT visibility and calculations across the application
 */

export const VAT_CONFIG = {
    // Main flag to control VAT visibility
    showVAT: false, // Set to false to hide VAT across the application

    // VAT rate (preserved for future use)
    vatRate: 0.15, // 15% VAT rate in Saudi Arabia

    // Whether to include VAT in calculations (when hidden, calculations exclude VAT)
    includeVATInCalculations: false,
} as const;

/**
 * Utility functions for VAT handling
 */
export const vatUtils = {
    /**
     * Calculate VAT amount from total including VAT
     */
    calculateVATFromTotal: (totalWithVAT: number): number => {
        if (!VAT_CONFIG.showVAT || !VAT_CONFIG.includeVATInCalculations) return 0;
        return (totalWithVAT * VAT_CONFIG.vatRate) / (1 + VAT_CONFIG.vatRate);
    },

    /**
     * Calculate total without VAT from total including VAT
     */
    calculateTotalWithoutVAT: (totalWithVAT: number): number => {
        if (!VAT_CONFIG.showVAT || !VAT_CONFIG.includeVATInCalculations) return totalWithVAT;
        const vatAmount = vatUtils.calculateVATFromTotal(totalWithVAT);
        return totalWithVAT - vatAmount;
    },

    /**
     * Calculate total with VAT from total without VAT
     */
    calculateTotalWithVAT: (totalWithoutVAT: number): number => {
        if (!VAT_CONFIG.showVAT || !VAT_CONFIG.includeVATInCalculations) return totalWithoutVAT;
        return totalWithoutVAT * (1 + VAT_CONFIG.vatRate);
    },

    /**
     * Check if VAT should be shown in UI
     */
    shouldShowVAT: (): boolean => {
        return VAT_CONFIG.showVAT;
    },

    /**
     * Get display price (with or without VAT based on configuration)
     */
    getDisplayPrice: (price: number): number => {
        // For now, return price as-is since we're hiding VAT
        // When VAT is re-enabled, this can be adjusted
        return price;
    },
};

export type VATCalculations = {
    subtotal: number;
    vatAmount: number;
    netAmount: number;
    vatRate: number;
    total: number;
};

/**
 * Calculate all VAT-related amounts
 */
export const calculateVATBreakdown = (totalAmount: number): VATCalculations => {
    if (!VAT_CONFIG.showVAT || !VAT_CONFIG.includeVATInCalculations) {
        return {
            subtotal: totalAmount,
            vatAmount: 0,
            netAmount: totalAmount,
            vatRate: 0,
            total: totalAmount,
        };
    }

    const vatAmount = vatUtils.calculateVATFromTotal(totalAmount);
    const netAmount = totalAmount - vatAmount;

    return {
        subtotal: totalAmount,
        vatAmount,
        netAmount,
        vatRate: VAT_CONFIG.vatRate,
        total: totalAmount,
    };
};
