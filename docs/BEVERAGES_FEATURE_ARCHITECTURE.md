# Beverages Feature Architecture

This document describes the full architecture for the Beverages feature in the POS Dashboard, including database, backend, frontend, storage, and integration details.

---

## 1. Database Layer

- **Table:** `beverages`
  - **Columns:**
    - `id`: Primary key
    - `nameEn`: English name
    - `nameAr`: Arabic name
    - `priceWithVat`: Price including VAT
    - `imageUrl`: URL to image in Supabase Storage
    - `modifiers`: Array of modifier objects (optional)
    - ...other relevant fields
- **Migration:**
  - Defined in Drizzle ORM schema and applied via Supabase CLI.
- **Storage:**
  - Images are stored in the `beverage-images` bucket in Supabase Storage.

---

## 2. Backend/API Layer

- **CRUD Services:** `/lib/supabase-queries/beverages-client-service.ts`
  - Functions for create, read, update, delete beverages.
  - Uses Supabase client for DB operations.
- **Image Upload API:** `/app/api/upload-image/route.ts`
  - Handles image uploads for beverages, stores in correct bucket.
  - Validates file type and size.

---

## 3. Validation Layer

- **Zod Schema:** `/lib/schemas.ts`
  - Ensures data integrity for beverages before DB operations.

---

## 4. Frontend Layer

- **React Query Hooks:** `/modules/beverages-feature/hooks/use-beverages.ts`
  - Fetches and mutates beverage data from Supabase.
- **UI Components:** `/modules/beverages-feature/components/`
  - `create-beverages-form.tsx`: Form for adding new beverages.
  - `edit-beverage-form.tsx`: Form for editing beverages.
  - `beverage-management-card.tsx`: Card for management view.
  - `beverage-grid.tsx`: Grid display of beverages.
  - `beverage-management-view.tsx`: Management dashboard.
  - `beverage-cashier-card.tsx`: Card for cashier view.
  - `beverage-cashier-view.tsx`: Cashier dashboard.

---

## 5. State & Search

- **Search Store:** `/hooks/useSearchStore.ts`
  - Provides filtering for beverages in both management and cashier views.

---

## 6. Integration Flow

1. **Admin adds/edits beverages** via management UI.
2. **Form data validated** with Zod, then sent to Supabase via client service.
3. **Image uploads** handled by API route, stored in Supabase Storage.
4. **React Query hooks** fetch updated beverages for display.
5. **Cashier and management views** render beverages using grid/card components.
6. **Modifiers** (if any) are managed via ModifierManager and ModifierSelectionDialog components.

---

## 7. Security & Access

- **RLS Policies:** Applied to `beverage-images` bucket for secure access.
- **Supabase Auth:** Ensures only authorized users can manage beverages.

---

## 8. Extensibility

- Architecture is modular—other menu items (appetizers, burgers, side orders, shawarma) follow the same pattern for easy scaling.

---

## 9. References

- **Schema:** `/lib/db/schema.ts`
- **Zod Validation:** `/lib/schemas.ts`
- **Client Service:** `/lib/supabase-queries/beverages-client-service.ts`
- **React Query Hooks:** `/modules/beverages-feature/hooks/use-beverages.ts`
- **UI Components:** `/modules/beverages-feature/components/`
- **Image Upload API:** `/app/api/upload-image/route.ts`
- **Search Store:** `/hooks/useSearchStore.ts`

---

For diagrams or further details, request specific sections or visualizations.
