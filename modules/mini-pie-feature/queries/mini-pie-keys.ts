// Mini pie query keys for TanStack Query
// Can be used in both client and server contexts
export const miniPieKeys = {
    all: ['miniPies'] as const,
    lists: () => [...miniPieKeys.all, 'list'] as const,
    list: (filters: string) => [...miniPieKeys.lists(), { filters }] as const,
    details: () => [...miniPieKeys.all, 'detail'] as const,
    detail: (id: string) => [...miniPieKeys.details(), id] as const,
};
