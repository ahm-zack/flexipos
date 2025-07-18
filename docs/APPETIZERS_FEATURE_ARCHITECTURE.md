# Appetizers Feature Architecture

This document describes the full architecture for the Appetizers feature in the POS Dashboard, including database, backend, frontend, storage, and integration details.

---

## 1. Database Layer

- **Table:** `appetizers`
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
  - Images are stored in the `appetizer-images` bucket in Supabase Storage.

---

## 2. Backend/API Layer

- **CRUD Services:** `/lib/supabase-queries/appetizers-client-service.ts`
  - Functions for create, read, update, delete appetizers.
  - Uses Supabase client for DB operations.
- **Image Upload API:** `/app/api/upload-image/route.ts`
  - Handles image uploads for appetizers, stores in correct bucket.
  - Validates file type and size.

---

## 3. Validation Layer

- **Zod Schema:** `/lib/schemas.ts`
  - Ensures data integrity for appetizers before DB operations.

---

## 4. Frontend Layer

- **React Query Hooks:** `/modules/appetizers-feature/hooks/use-appetizers.ts`
  - Fetches and mutates appetizer data from Supabase.
- **UI Components:** `/modules/appetizers-feature/components/`
  - `create-appetizers-form.tsx`: Form for adding new appetizers.
  - `edit-appetizer-form.tsx`: Form for editing appetizers.
  - `appetizer-management-card.tsx`: Card for management view.
  - `appetizer-grid.tsx`: Grid display of appetizers.
  - `appetizer-management-view.tsx`: Management dashboard.
  - `appetizer-cashier-card.tsx`: Card for cashier view.
  - `appetizer-cashier-view.tsx`: Cashier dashboard.

---

## 5. State & Search

- **Search Store:** `/hooks/useSearchStore.ts`
  - Provides filtering for appetizers in both management and cashier views.

---

## 6. Integration Flow

1. **Admin adds/edits appetizers** via management UI.
2. **Form data validated** with Zod, then sent to Supabase via client service.
3. **Image uploads** handled by API route, stored in Supabase Storage.
4. **React Query hooks** fetch updated appetizers for display.
5. **Cashier and management views** render appetizers using grid/card components.
6. **Modifiers** (if any) are managed via ModifierManager and ModifierSelectionDialog components.

---

## 7. Security & Access

- **RLS Policies:** Applied to `appetizer-images` bucket for secure access.
- **Supabase Auth:** Ensures only authorized users can manage appetizers.

---

## 8. Extensibility

- Architecture is modular—other menu items (burgers, beverages, side orders, shawarma) follow the same pattern for easy scaling.

---

## 9. References

- **Schema:** `/lib/db/schema.ts`
- **Zod Validation:** `/lib/schemas.ts`
- **Client Service:** `/lib/supabase-queries/appetizers-client-service.ts`
- **React Query Hooks:** `/modules/appetizers-feature/hooks/use-appetizers.ts`
- **UI Components:** `/modules/appetizers-feature/components/`
- **Image Upload API:** `/app/api/upload-image/route.ts`
- **Search Store:** `/hooks/useSearchStore.ts`

---

For diagrams or further details, request specific sections or visualizations.
