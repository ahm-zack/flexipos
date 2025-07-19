export const burgerKeys = {
    all: ['burgers'] as const,
    lists: () => [...burgerKeys.all, 'list'] as const,
    list: (filters: string) => [...burgerKeys.lists(), { filters }] as const,
    details: () => [...burgerKeys.all, 'detail'] as const,
    detail: (id: string) => [...burgerKeys.details(), id] as const,
};
