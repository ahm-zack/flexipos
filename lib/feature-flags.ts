/**
 * Feature Flags for Dynamic POS Conversion
 * 
 * This system allows gradual rollout of dynamic features while maintaining
 * backward compatibility with the existing restaurant-specific functionality.
 */

export interface FeatureFlags {
    // Core Infrastructure Flags
    MULTI_TENANT: boolean;
    DYNAMIC_CATEGORIES: boolean;
    UNIFIED_MENU_ITEMS: boolean;

    // Business Template Flags
    BUSINESS_TEMPLATES: boolean;
    ONBOARDING_WIZARD: boolean;

    // Advanced Feature Flags
    INVENTORY_TRACKING: boolean;
    ADVANCED_REPORTING: boolean;
    CUSTOM_BRANDING: boolean;

    // UI Enhancement Flags
    MODERN_ADMIN_LAYOUT: boolean;
    DYNAMIC_NAVIGATION: boolean;
    THEME_CUSTOMIZATION: boolean;
}

/**
 * Default feature flag values
 * In development, more features are enabled by default
 * In production, features are disabled by default for safety
 */
const defaultFlags: FeatureFlags = {
    // Phase 1: Core Infrastructure (Enabled for development)
    MULTI_TENANT: process.env.NODE_ENV === 'development',
    DYNAMIC_CATEGORIES: process.env.NODE_ENV === 'development',
    UNIFIED_MENU_ITEMS: false, // Disabled until migration is ready

    // Phase 2: Business Templates (Disabled until Phase 1 complete)
    BUSINESS_TEMPLATES: false,
    ONBOARDING_WIZARD: false,

    // Phase 3: Advanced Features (Disabled until later phases)
    INVENTORY_TRACKING: false,
    ADVANCED_REPORTING: false,
    CUSTOM_BRANDING: false,

    // UI Enhancements (Can be enabled independently)
    MODERN_ADMIN_LAYOUT: true, // Already implemented
    DYNAMIC_NAVIGATION: false, // Depends on DYNAMIC_CATEGORIES
    THEME_CUSTOMIZATION: false,
};

/**
 * Get feature flag value from environment or default
 */
function getFeatureFlag(flag: keyof FeatureFlags): boolean {
    const envValue = process.env[`FEATURE_${flag}`];

    if (envValue !== undefined) {
        return envValue === 'true' || envValue === '1';
    }

    return defaultFlags[flag];
}

/**
 * Feature flags singleton
 */
export const featureFlags: FeatureFlags = {
    MULTI_TENANT: getFeatureFlag('MULTI_TENANT'),
    DYNAMIC_CATEGORIES: getFeatureFlag('DYNAMIC_CATEGORIES'),
    UNIFIED_MENU_ITEMS: getFeatureFlag('UNIFIED_MENU_ITEMS'),
    BUSINESS_TEMPLATES: getFeatureFlag('BUSINESS_TEMPLATES'),
    ONBOARDING_WIZARD: getFeatureFlag('ONBOARDING_WIZARD'),
    INVENTORY_TRACKING: getFeatureFlag('INVENTORY_TRACKING'),
    ADVANCED_REPORTING: getFeatureFlag('ADVANCED_REPORTING'),
    CUSTOM_BRANDING: getFeatureFlag('CUSTOM_BRANDING'),
    MODERN_ADMIN_LAYOUT: getFeatureFlag('MODERN_ADMIN_LAYOUT'),
    DYNAMIC_NAVIGATION: getFeatureFlag('DYNAMIC_NAVIGATION'),
    THEME_CUSTOMIZATION: getFeatureFlag('THEME_CUSTOMIZATION'),
};

/**
 * Type-safe feature flag checker
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
    return featureFlags[flag];
}

/**
 * Check if multiple features are enabled (all must be true)
 */
export function areAllFeaturesEnabled(...flags: (keyof FeatureFlags)[]): boolean {
    return flags.every(flag => featureFlags[flag]);
}

/**
 * Check if any of multiple features are enabled (at least one must be true)
 */
export function isAnyFeatureEnabled(...flags: (keyof FeatureFlags)[]): boolean {
    return flags.some(flag => featureFlags[flag]);
}

/**
 * Development helper to log current feature flag status
 */
export function logFeatureFlags(): void {
    if (process.env.NODE_ENV === 'development') {
        console.log('🚩 Feature Flags Status:');
        Object.entries(featureFlags).forEach(([flag, enabled]) => {
            console.log(`  ${flag}: ${enabled ? '✅' : '❌'}`);
        });
    }
}

/**
 * React hook for using feature flags in components
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
    return featureFlags[flag];
}

/**
 * Get all enabled features (useful for debugging)
 */
export function getEnabledFeatures(): string[] {
    return Object.entries(featureFlags)
        .filter(([, enabled]) => enabled)
        .map(([flag]) => flag);
}

/**
 * Get all disabled features (useful for debugging)
 */
export function getDisabledFeatures(): string[] {
    return Object.entries(featureFlags)
        .filter(([, enabled]) => !enabled)
        .map(([flag]) => flag);
}

/**
 * Environment-specific feature flag configurations
 */
export const environmentConfigs = {
    development: {
        description: 'Development environment with most dynamic features enabled for testing',
        enabledByDefault: [
            'MULTI_TENANT',
            'DYNAMIC_CATEGORIES',
            'MODERN_ADMIN_LAYOUT'
        ]
    },

    staging: {
        description: 'Staging environment for testing complete features before production',
        enabledByDefault: [
            'MODERN_ADMIN_LAYOUT'
        ]
    },

    production: {
        description: 'Production environment with conservative feature rollout',
        enabledByDefault: [
            'MODERN_ADMIN_LAYOUT'
        ]
    }
};

// Log feature flags on module load in development
if (process.env.NODE_ENV === 'development') {
    logFeatureFlags();
}