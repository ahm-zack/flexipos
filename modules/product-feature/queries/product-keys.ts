// Product query keys for TanStack Query
// Following pizza-feature pattern but for dynamic products
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (businessId: string, filters?: string) =>
        [...productKeys.lists(), { businessId, filters }] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,

    // Category-specific product keys
    byCategory: (businessId: string, categoryId: string) =>
        [...productKeys.all, 'category', businessId, categoryId] as const,
    byCategorySlug: (businessId: string, categorySlug: string) =>
        [...productKeys.all, 'categorySlug', businessId, categorySlug] as const,

    // Search keys
    search: (businessId: string, query: string) =>
        [...productKeys.all, 'search', businessId, query] as const,

    // Stats keys
    stats: (businessId: string, categoryId?: string) =>
        [...productKeys.all, 'stats', businessId, categoryId] as const,
};

// Category query keys for TanStack Query
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (businessId: string, filters?: string) =>
        [...categoryKeys.lists(), { businessId, filters }] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,

    // Business-specific category keys
    byBusiness: (businessId: string) =>
        [...categoryKeys.all, 'business', businessId] as const,

    // Slug-based keys
    bySlug: (businessId: string, slug: string) =>
        [...categoryKeys.all, 'slug', businessId, slug] as const,
};

// Combined keys for operations that involve both
export const productCategoryKeys = {
    all: ['product-categories'] as const,
    categoryWithProducts: (businessId: string, categorySlug: string) =>
        [...productCategoryKeys.all, 'with-products', businessId, categorySlug] as const,
};