# React Duplicate Keys Error - FIXED

## Issue Summary

When creating a pizza, the following React error occurred:

```
Encountered two children with the same key, `25ed1c65-61b8-493f-9a5e-19cfdc91ec8a`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
```

## Root Cause

The error was caused by having **both optimistic updates and real-time updates** enabled simultaneously:

1. **Optimistic Updates**: The form was using `usePizzasWithOptimisticUpdates()` which immediately adds the pizza to the cache
2. **Real-time Updates**: The view had `usePizzasRealtime()` enabled which also adds the same pizza when it receives the database change event
3. **Result**: The same pizza was added twice to the React component list, causing duplicate keys

## Architecture Decision

We chose to **prioritize real-time updates** over optimistic updates because:

- ✅ Real-time updates provide better multi-user experience
- ✅ Changes are synchronized across all users instantly
- ✅ More robust - reflects actual database state
- ✅ Eliminates race conditions between optimistic and real state

## Files Fixed

### 1. `/modules/pizza-feature/hooks/use-pizzas.ts`

**Changes**: Removed optimistic cache updates from mutations since real-time handles it

```tsx
// Before (❌ Conflicting with real-time):
export const useCreatePizza = () => {
  return useMutation({
    mutationFn: createPizza,
    onSuccess: (newPizza) => {
      // Optimistically update the cache
      queryClient.setQueryData<Pizza[]>(pizzaKeys.lists(), (old) => {
        if (!old) return [newPizza];
        return [newPizza, ...old]; // Duplicate when real-time also adds
      });
    },
  });
};

// After (✅ Real-time only):
export const useCreatePizza = () => {
  return useMutation({
    mutationFn: createPizza,
    onSuccess: () => {
      // Real-time updates will handle the cache update
      queryClient.invalidateQueries({ queryKey: pizzaKeys.lists() });
    },
  });
};
```

### 2. `/modules/pizza-feature/components/create-pizza-form-client-example.tsx`

**Changes**: Switched from optimistic updates to regular mutations

```tsx
// Before (❌ Using optimistic updates):
import { usePizzasWithOptimisticUpdates } from "../hooks/use-pizzas";
const { optimisticCreate, isCreating } = usePizzasWithOptimisticUpdates();
await optimisticCreate(pizzaData);

// After (✅ Using regular mutations):
import { useCreatePizza } from "../hooks/use-pizzas";
const createPizzaMutation = useCreatePizza();
await createPizzaMutation.mutateAsync(pizzaData);
```

## How It Works Now

### Data Flow:

1. **User creates pizza** → Form calls `createPizzaMutation.mutateAsync()`
2. **Database updated** → Supabase stores the new pizza
3. **Real-time event** → `usePizzasRealtime()` receives INSERT event
4. **Cache updated** → Real-time subscription updates TanStack Query cache
5. **UI updates** → React re-renders with new pizza (single source of truth)

### Benefits:

- ✅ **No duplicate keys** - Only one source of cache updates
- ✅ **Multi-user sync** - All users see changes instantly
- ✅ **Consistent state** - UI always reflects database reality
- ✅ **Error resilience** - If creation fails, no orphaned optimistic state

## Testing Results

- ✅ Build passes successfully with no errors
- ✅ Pizza creation works without duplicate key errors
- ✅ Real-time updates work across multiple browser tabs
- ✅ All CRUD operations (create, update, delete) work correctly

## Architecture Pattern

This establishes a clean pattern for other features:

- Use **TanStack Query mutations** for API calls
- Use **real-time subscriptions** for cache synchronization
- Avoid mixing optimistic updates with real-time updates
- Let database events drive UI updates for consistency

The pizza feature now serves as a template for migrating other features to the same real-time client-side architecture.
