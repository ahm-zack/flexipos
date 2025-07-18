export const beveragesKeys = {
    all: ['beverages'] as const,
    lists: () => [...beveragesKeys.all, 'list'] as const,
    list: (filters: string) => [...beveragesKeys.lists(), { filters }] as const,
    details: () => [...beveragesKeys.all, 'detail'] as const,
    detail: (id: string) => [...beveragesKeys.details(), id] as const,
};
