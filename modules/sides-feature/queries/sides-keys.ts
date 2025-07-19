export const sidesKeys = {
    all: ['sides'] as const,
    lists: () => [...sidesKeys.all, 'list'] as const,
    list: (filters: string) => [...sidesKeys.lists(), { filters }] as const,
    details: () => [...sidesKeys.all, 'detail'] as const,
    detail: (id: string) => [...sidesKeys.details(), id] as const,
};
