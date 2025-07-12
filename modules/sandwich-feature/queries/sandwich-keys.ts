// Sandwich query keys for TanStack Query
// Can be used in both client and server contexts
export const sandwichKeys = {
  all: ['sandwiches'] as const,
  lists: () => [...sandwichKeys.all, 'list'] as const,
  list: (filters: string) => [...sandwichKeys.lists(), { filters }] as const,
  details: () => [...sandwichKeys.all, 'detail'] as const,
  detail: (id: string) => [...sandwichKeys.details(), id] as const,
};
