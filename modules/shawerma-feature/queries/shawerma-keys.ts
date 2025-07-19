
export const shawermaKeys = {
    all: ['shawermas'] as const,
    lists: () => [...shawermaKeys.all, 'list'] as const,
    list: (filters: string) => [...shawermaKeys.lists(), { filters }] as const,
    details: () => [...shawermaKeys.all, 'detail'] as const,
    detail: (id: string) => [...shawermaKeys.details(), id] as const,
};
