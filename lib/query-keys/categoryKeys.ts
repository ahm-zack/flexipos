// Query keys for TanStack Query caching
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (businessId: string) => [...categoryKeys.lists(), businessId] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,
};