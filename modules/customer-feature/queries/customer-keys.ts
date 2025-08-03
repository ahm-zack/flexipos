// Query keys for customers
export const customerKeys = {
    all: ['customers'] as const,
    lists: () => [...customerKeys.all, 'list'] as const,
    list: (page?: number, limit?: number) =>
        [...customerKeys.lists(), { page, limit }] as const,
    detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
    search: (query: string) => [...customerKeys.all, 'search', query] as const,
    searchByPhone: (phone: string) => [...customerKeys.all, 'searchByPhone', phone] as const,
};
