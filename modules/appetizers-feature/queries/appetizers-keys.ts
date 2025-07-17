export const appetizersKeys = {
    all: ['appetizers'] as const,
    lists: () => [...appetizersKeys.all, 'list'] as const,
    list: (filters: string) => [...appetizersKeys.lists(), { filters }] as const,
    details: () => [...appetizersKeys.all, 'detail'] as const,
    detail: (id: string) => [...appetizersKeys.details(), id] as const,
};
