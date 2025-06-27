# How to Add a New Feature: Example – Product Management

This guide will walk you through adding a new feature (e.g., a `product` table) to your POS Dashboard, covering database, API, RBAC, server/client data fetching, and UI. Follow these steps for any future feature!

---

## 1. Database: Add the `product` Table

- **Edit `/lib/db/schema.ts`**:
  - Define the `product` table using Drizzle ORM.
  - Example:
    ```typescript
    // ...existing code...
    export const products = pgTable("products", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: text("name").notNull(),
      price: numeric("price", { precision: 10, scale: 2 }).notNull(),
      createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    });
    // ...existing code...
    ```
- **Run migration**:
  - Update your migration files and run Drizzle Kit to apply the schema.

---

## 2. Drizzle Service: Add Product Service

- **Create `/lib/product-service-drizzle.ts`**:
  - Implement CRUD functions for products, using Drizzle ORM.
  - Example:
    ```typescript
    import { db } from "./db";
    import { products } from "./db/schema";
    // ...
    export const productService = {
      async createProduct(data) {
        /* ... */
      },
      async getProducts() {
        /* ... */
      },
      async updateProduct(id, data) {
        /* ... */
      },
      async deleteProduct(id) {
        /* ... */
      },
    };
    ```

---

## 3. API Routes: Add Product Endpoints

- **Create `/app/api/products/route.ts`** (GET, POST)
- **Create `/app/api/products/[id]/route.ts`** (GET, PATCH, DELETE)
- Use the product service for all DB operations.
- **Role-based checks**: In each handler, check the user's role (from Supabase Auth or session). Only allow `superadmin`, `admin`, or `manager` to create/delete. All roles can read and edit (with logic as needed).
  - Example:
    ```typescript
    // ...existing code...
    if (!["superadmin", "admin", "manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // ...existing code...
    ```

---

## 4. React Query Hooks: Data Fetching & Mutations

- **Create `/modules/product-management/hooks/use-products.ts`**
  - Use TanStack Query for fetching, creating, updating, deleting products.
  - Example:
    ```typescript
    export function useProducts() {
      /* ... */
    }
    export function useCreateProduct() {
      /* ... */
    }
    export function useUpdateProduct() {
      /* ... */
    }
    export function useDeleteProduct() {
      /* ... */
    }
    ```

---

## 5. UI: Modular Components

- **Create `/modules/product-management/components/`**
  - `products-table.tsx`: List all products (all roles can view)
  - `create-product-form.tsx`: Only visible to allowed roles
  - `edit-product-dialog.tsx`: All roles can edit (or restrict as needed)
- **Page**: `/app/admin/products/page.tsx` (or `/app/products/page.tsx`)
  - Use SSR to check role and render the correct UI.

---

## 6. Role-Based UI & Access

- **Navbar**: Show "Products" link only to roles allowed to manage products.
- **Forms/Buttons**: Conditionally render create/delete/edit buttons based on user role.
- **API**: Always enforce RBAC on the server, not just in the UI!

---

## 7. Example: Role-Based Product Creation

- **UI**: Only `superadmin`, `admin`, `manager` see the "Add Product" button.
- **API**: Only those roles can POST to `/api/products`.
- **Other roles**: Can view and edit (if allowed), but not create/delete.

---

## 8. Fetching Products (Server & Client)

- **Server**: Use Drizzle service in SSR/Server Components for initial data.
- **Client**: Use TanStack Query hooks for fetching, caching, and mutations.
- **SSR Hydration**: Pass initial data from server to client for fast load.

---

## 9. Summary Checklist

- [ ] Add table to Drizzle schema & migrate
- [ ] Add Drizzle service for CRUD
- [ ] Add API routes with RBAC
- [ ] Add React Query hooks
- [ ] Add modular UI components
- [ ] Add/adjust navigation
- [ ] Enforce RBAC in both UI and API

---

## 10. Tips for Future Features

- Always use feature modules (`/modules/feature-management/`)
- Use TanStack Query for all data fetching/mutations
- Use Drizzle ORM for all DB access
- Enforce RBAC in API routes, not just UI
- Keep UI modular and role-aware
- Document your new feature in `/docs/`

---

_Follow this guide for any new feature: just swap `product` for your new entity!_
