// Pizza query keys for TanStack Query
// Can be used in both client and server contexts
export const pizzaKeys = {
  all: ['pizzas'] as const,
  lists: () => [...pizzaKeys.all, 'list'] as const,
  list: (filters: string) => [...pizzaKeys.lists(), { filters }] as const,
  details: () => [...pizzaKeys.all, 'detail'] as const,
  detail: (id: string) => [...pizzaKeys.details(), id] as const,
};
