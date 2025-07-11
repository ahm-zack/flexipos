# Refactoring Pizza CRUD to Client-Side Queries with TanStack Query & Supabase

## Current State

- **Pizza CRUD operations** are implemented via Next.js API routes:
  - `/app/api/pizzas/route.ts` (GET, POST)
  - `/app/api/pizzas/[id]/route.ts` (PATCH, DELETE)
  - These routes use `pizzaService` (`/lib/pizza-service.ts`) for DB logic, which in turn uses Drizzle ORM and your Drizzle schema files.
- **Drizzle schemas** (`/lib/db/schema.ts` and related) define your database structure and are used by `pizzaService` and backend code.
- **React Query hooks** in `/modules/pizza-feature/hooks/use-pizzas.ts` call these API routes using `fetch`.
- **UI components** (e.g., `pizza-management-view.tsx`, `create-pizza-form.tsx`, `edit-pizza-form.tsx`) use these hooks for all pizza CRUD.
- **Type safety** is provided by local types (`/lib/db/schema.ts`) and generated Supabase types (`/database.types.ts`).
- **Direct Supabase client usage** is demonstrated in `/app/admin/menu/pizza/usePizzas.tsx` (for reading only).

## Refactor Goal

- **Remove all API route usage for pizza CRUD.**
- **Stop using `pizzaService` and Drizzle ORM for pizza CRUD in the app.**
- **Use the Supabase client directly in React Query hooks** for all pizza operations (read, create, update, delete).
- **Preserve type safety** using generated Supabase types.
- **Minimize changes**: Only update hooks and their usages; keep UI logic unchanged.
- **Keep Drizzle schemas and migrations for DB management and any remaining backend/server-side code.**

---

## Step-by-Step Refactor Plan

### 1. Update Pizza Hooks to Use Supabase Client

- Replace all `fetch` calls in `/modules/pizza-feature/hooks/use-pizzas.ts` with direct Supabase client queries/mutations.
- Use the browser client from `/utils/supabase/client.ts`.
- Use types from `/database.types.ts` for type safety (e.g., `Database['public']['Tables']['pizzas']['Row']`).
- **Do not use Drizzle types or `pizzaService` for pizza CRUD in the client.**

#### Example: Fetch Pizzas

```ts
import { createClient } from "@/utils/supabase/client";
const client = createClient();

const fetchPizzas = async (): Promise<
  Database["public"]["Tables"]["pizzas"]["Row"][]
> => {
  const { data, error } = await client.from("pizzas").select();
  if (error) throw new Error(error.message);
  return data;
};
```

#### Example: Create Pizza

```ts
const createPizza = async (
  pizzaData: Database["public"]["Tables"]["pizzas"]["Insert"]
): Promise<Database["public"]["Tables"]["pizzas"]["Row"]> => {
  const { data, error } = await client
    .from("pizzas")
    .insert(pizzaData)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};
```

#### Example: Update Pizza

```ts
const updatePizza = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Database["public"]["Tables"]["pizzas"]["Update"]>;
}): Promise<Database["public"]["Tables"]["pizzas"]["Row"]> => {
  const { data: updated, error } = await client
    .from("pizzas")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return updated;
};
```

#### Example: Delete Pizza

```ts
const deletePizza = async (id: string): Promise<void> => {
  const { error } = await client.from("pizzas").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
```

### 2. Remove API Route and pizzaService Dependencies

- Delete or ignore `/app/api/pizzas/route.ts` and `/app/api/pizzas/[id]/route.ts` for pizza CRUD.
- Remove all `fetch('/api/pizzas...')` from hooks.
- **Deprecate or delete `/lib/pizza-service.ts` if it is only used for pizza CRUD.**
- If `pizzaService` is used for other features, remove pizza-related methods and keep only what’s still needed.

### 3. Update Hook Usages in Components

- No changes needed if hooks' signatures remain the same.
- UI components will continue to use `usePizzas`, `useCreatePizza`, `useUpdatePizza`, `useDeletePizza` as before.

### 4. Ensure Type Safety

- Use types from `/database.types.ts` for all Supabase operations.
- Do not use Drizzle types in client code for pizza CRUD.
- Optionally, add runtime validation if needed (e.g., Zod).

### 5. Test All CRUD Operations

- Verify that all pizza CRUD actions work as expected from the UI.
- Ensure optimistic updates and error handling are preserved.

### 6. What About Drizzle Schemas and Migrations?

- **Keep Drizzle schemas and migration files** for DB management, migrations, and any backend/server-side code (e.g., admin scripts, reports).
- For all client-side CRUD, use only the Supabase client and Supabase types.
- If you have scripts or admin tools that need to run on the server, you can still use Drizzle and your Drizzle schemas for those.

---

## Data Flow: Before and After

| Before (API/Drizzle)                         | After (Supabase Client)   |
| -------------------------------------------- | ------------------------- |
| UI → API Route → pizzaService (Drizzle) → DB | UI → Supabase Client → DB |

---

## Summary Table

| Operation | Old (API Route/Drizzle)                                         | New (Supabase Client)                       |
| --------- | --------------------------------------------------------------- | ------------------------------------------- |
| Read      | fetch('/api/pizzas') → pizzaService.getPizzas()                 | client.from('pizzas').select()              |
| Create    | fetch('/api/pizzas', POST) → pizzaService.createPizza()         | client.from('pizzas').insert()              |
| Update    | fetch(`/api/pizzas/${id}`, PATCH) → pizzaService.updatePizza()  | client.from('pizzas').update().eq('id', id) |
| Delete    | fetch(`/api/pizzas/${id}`, DELETE) → pizzaService.deletePizza() | client.from('pizzas').delete().eq('id', id) |

---

## Minimal Example: New Pizza Hook (usePizzas)

```ts
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
const client = createClient();

export const usePizzas = () => {
  return useQuery({
    queryKey: ["pizzas"],
    queryFn: async () => {
      const { data, error } = await client.from("pizzas").select();
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

---

## What About Type Safety?

- **Before**: Used Drizzle types (`Pizza`, `NewPizza`) from `/lib/db/schema.ts`.
- **After**: Use Supabase-generated types from `/database.types.ts` (e.g., `Database['public']['Tables']['pizzas']['Row']`).
- This ensures your client code always matches your actual DB schema.

---

## What About Server-Side/Batch/Admin Code?

- If you have scripts or admin tools that need to run on the server, you can still use Drizzle and your Drizzle schemas for those.
- For all client-side CRUD, use only the Supabase client and Supabase types.

---

## Conclusion

- All pizza CRUD logic moves to the client using the Supabase client and Supabase types.
- `pizzaService` and Drizzle ORM are no longer used for pizza CRUD in the app.
- Drizzle schemas remain for DB migrations and any backend/server-side code.
- Type safety is preserved by using Supabase-generated types.
- This document is your reference if you lose your way during the refactor—follow it step by step for a smooth migration!
