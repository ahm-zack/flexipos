// Pie query keys for TanStack Query
// Can be used in both client and server contexts
export const pieKeys = {
  all: ['pies'] as const,
  lists: () => [...pieKeys.all, 'list'] as const,
  list: (filters: string) => [...pieKeys.lists(), { filters }] as const,
  details: () => [...pieKeys.all, 'detail'] as const,
  detail: (id: string) => [...pieKeys.details(), id] as const,
};
