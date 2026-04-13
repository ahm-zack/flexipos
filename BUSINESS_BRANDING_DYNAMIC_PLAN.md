# Business Branding Dynamic Plan

> **Status:** Plan only — no changes implemented.
> Review and approve the phases before implementation.

---

## Goal

Remove all hardcoded Lazaza branding and business identity from the app, then replace it with business-aware data resolved from the active `business_id`.

This plan covers:

- Visible app branding
- Receipt branding
- ZATCA QR seller identity
- Cart persistence keys
- Settings screens
- Data model and migration requirements
- Rollout and verification

---

## Current Problem Summary

The project has already moved toward a dynamic SaaS architecture, but business identity is still split across two models:

1. **Dynamic business context already exists**
   - The app loads the active business through `BusinessProvider`
   - The active business name is already available in client components

2. **Static restaurant config still exists**
   - Receipts and some branding still read from a single global `RESTAURANT_CONFIG`
   - That config contains Lazaza-specific English name, Arabic name, address, VAT, CR, and phone values

This means the app is partially multi-tenant in navigation and data scoping, but still single-tenant in branding and printed legal identity.

---

## Confirmed Files That Need Attention

### A. Visible hardcoded Lazaza labels

- `components/pos-nav.tsx`
- `components/mobile-admin-navbar.tsx`
- `components/app-sidebar.tsx`
- `app/admin/settings/page.tsx`

### B. Static receipt and business identity flow

- `lib/restaurant-config.ts`
- `components/restaurant-receipt.tsx`
- `hooks/use-receipt-download.ts`
- `modules/cart/components/cart-panel.tsx`
- `modules/orders-feature/components/orders-list.tsx`
- `lib/zatca-qr.ts`

### C. Tenant-specific storage key that should become business-aware

- `modules/cart/store/cart-store.ts`

### D. Optional cleanup items

- `lib/receipt-pdf-service.ts` (commented Lazaza checks)
- `PRODUCTION_DEPLOYMENT_GUIDE.md` (Lazaza-specific operational leftovers)

---

## Existing Infrastructure We Should Reuse

### Business context

The app already has the core client-side source of truth:

- `modules/providers/components/business-provider.tsx`
- `hooks/useBusinessId.ts`

The provider already resolves:

- `businessId`
- `businessName`
- authenticated user context

This means the visible branding fix does **not** need a new architecture from scratch.

### Dynamic business schema

The dynamic schema already has fields suitable for tenant-aware branding and receipt identity:

- `branding`
- `address`
- `contact`
- `vat_settings`
- `settings`

Current migration source:

- `supabase-dynamic/migrations/20251002000001_create_business_infrastructure.sql`

That schema is enough to support a full business-specific receipt configuration, but the app is not reading enough of it yet.

---

## Target Architecture

Use the active `business_id` as the source of truth for all business identity.

### Principle

Every place that displays or prints a business name should get that value from the active business context or a business config fetch.

### Recommended data split

Use these sources consistently:

- `businesses.name`
  - primary English display name
- `businesses.branding`
  - logo, display style, optional brand assets
- `businesses.address`
  - printable and UI address values
- `businesses.contact`
  - phone, email, website
- `businesses.vat_settings`
  - VAT number, CR number, VAT rate, ZATCA-related fields
- `businesses.settings`
  - fallback or miscellaneous POS settings

### Important rule

`lib/restaurant-config.ts` should stop being the primary runtime source of tenant identity.

Instead, it should become one of these:

1. A temporary fallback only
2. A generic default config with no Lazaza-specific content
3. A compatibility layer that merges generic defaults with business-specific runtime data

Option 3 is the safest migration path.

---

## Implementation Plan

## Phase 1 — Replace visible hardcoded branding

### Objective

Remove direct Lazaza labels from visible UI and replace them with the active business name.

### Files

- `components/pos-nav.tsx`
- `components/mobile-admin-navbar.tsx`
- `components/app-sidebar.tsx`
- `app/admin/settings/page.tsx`

### Work

- Use the existing business context in client components
- Show `businessName` instead of hardcoded `Lazaza` or `LAZAZA`
- Add a safe fallback for loading and error cases
  - Example fallback: `FlexiPOS`
- For `app/admin/settings/page.tsx`, fetch the current business server-side or move the business identity portion into a small client component that reads the business context

### Acceptance criteria

- No visible Lazaza label remains in runtime UI
- Changing the authenticated user's business changes the displayed brand name automatically

### Risk

Low

---

## Phase 2 — Introduce a runtime business branding/config model

### Objective

Create one normalized app-level model for business identity so all receipt and branding code reads from the same shape.

### Recommendation

Create a new normalization layer, for example:

- `lib/business-branding.ts`
- or `lib/business-config.ts`

### Suggested normalized shape

```ts
type BusinessBrandingConfig = {
  name: string;
  nameAr?: string;
  address?: string;
  addressAr?: string;
  phone?: string;
  email?: string;
  website?: string;
  vatNumber?: string;
  crNumber?: string;
  vatRate?: number;
  logo?: string;
  thankYouMessage?: {
    en?: string;
    ar?: string;
  };
  businessHours?: {
    en?: string;
    ar?: string;
  };
  zatcaCompliant?: boolean;
};
```

### Work

- Add a mapper that converts the business row into a receipt-safe and UI-safe config object
- Read from `branding`, `address`, `contact`, `vat_settings`, and `settings`
- Provide stable defaults for missing fields
- Keep `RESTAURANT_CONFIG` only as a generic fallback during migration

### Acceptance criteria

- There is one reusable normalized config shape for all business identity needs
- Receipt code no longer needs to know database field structure directly

### Risk

Medium

---

## Phase 3 — Expand business context or provide a dedicated business config fetch

### Objective

Make enough business data available at runtime for receipts, QR generation, settings pages, and UI branding.

### Current limitation

The current provider exposes `businessName`, but not the full printable/legal config.

### Work

Update `BusinessProvider` or add a specialized query hook so the active business exposes more than just name.

### Recommended minimum payload

- `id`
- `name`
- `settings`
- `branding`
- `address`
- `contact`
- `vat_settings`

### Candidate approaches

#### Approach A: Extend `BusinessProvider`

Pros:

- One global source of truth
- Easy for client components

Cons:

- Slightly larger bootstrap fetch

#### Approach B: Keep provider small and add `useCurrentBusinessConfig()`

Pros:

- More explicit dependency usage
- Better if receipt config is heavy or evolves often

Cons:

- More call sites to wire

### Recommendation

Use **Approach B** if you want a cleaner long-term separation.
Use **Approach A** if you want the fastest implementation with minimal new concepts.

### Acceptance criteria

- Receipt and settings code can resolve business-specific identity at runtime
- No runtime path needs Lazaza-specific fallback data except generic defaults

### Risk

Medium

---

## Phase 4 — Refactor receipt rendering to use business-specific config

### Objective

Remove static tenant identity from receipts and PDF generation.

### Files

- `components/restaurant-receipt.tsx`
- `hooks/use-receipt-download.ts`
- `modules/cart/components/cart-panel.tsx`
- `modules/orders-feature/components/orders-list.tsx`
- `lib/restaurant-config.ts`

### Work

- Replace direct dependence on hardcoded `RESTAURANT_CONFIG`
- Make receipt rendering use normalized business config from runtime data
- Pass resolved business config into all receipt entry points
- Ensure PDF downloads use the current business, not a global static fallback
- Change `RESTAURANT_CONFIG` to generic fallback values only

### Specific rule

The receipt component may still merge with defaults, but those defaults must be generic and non-tenant-specific.

### Acceptance criteria

- Receipt header shows the active business name, not Lazaza
- Receipt address, phone, VAT, and CR values resolve per business
- PDF downloads and modal receipts use the same business-specific config

### Risk

High

Reason:

This area touches printed documents and customer-facing exports.

---

## Phase 5 — Refactor ZATCA QR seller identity

### Objective

Ensure ZATCA QR data uses the active business legal identity.

### Files

- `lib/zatca-qr.ts`
- `components/restaurant-receipt.tsx`

### Work

- Remove Lazaza-specific seller default from QR config
- Pass seller name and VAT registration number from normalized business config
- Keep validation strict for missing legal data

### Important behavior

If business VAT data is missing, do not silently fall back to Lazaza-like values.

Use one of these instead:

1. Show a validation state in admin
2. Disable ZATCA QR generation until required fields are present
3. Use explicit placeholder text only in development environments

### Acceptance criteria

- QR seller identity always matches the active business
- Missing business legal data is surfaced clearly

### Risk

High

---

## Phase 6 — Make cart persistence business-aware

### Objective

Prevent cart state from using a tenant-specific storage key.

### File

- `modules/cart/store/cart-store.ts`

### Current problem

The persisted store key is currently `lazaza-cart`.

### Work

Replace it with a business-aware strategy, for example:

- `cart-${businessId}`
- or a generic key with business-scoped payload

### Recommendation

Prefer a business-scoped persistence key if Zustand persistence wiring allows it cleanly.

If not, store a structure like:

```ts
{
  cartsByBusiness: {
    [businessId]: CartState
  }
}
```

### Acceptance criteria

- Cart data does not leak across businesses for the same browser session
- Storage keys no longer contain Lazaza branding

### Risk

Medium

---

## Phase 7 — Update admin settings to show real business data

### Objective

Turn the settings screen from placeholder branding into active business metadata.

### File

- `app/admin/settings/page.tsx`

### Work

- Replace `Lazaza Restaurant` with current business name
- If available, show dynamic address, VAT, phone, or branding fields
- Decide whether this page is read-only for now or the future edit surface for business metadata

### Recommendation

For the first pass, make the page display correct dynamic values.
Editing can be a second milestone.

### Acceptance criteria

- Business settings page reflects the active business
- No hardcoded tenant name remains there

### Risk

Low

---

## Phase 8 — Clean up Lazaza leftovers and dangerous defaults

### Objective

Remove residual Lazaza-specific code/comments/docs that could reintroduce tenant coupling.

### Files

- `lib/receipt-pdf-service.ts`
- `PRODUCTION_DEPLOYMENT_GUIDE.md`
- any remaining `Lazaza` or `LAZAZA` search matches in runtime code

### Work

- Remove commented logic that special-cases LAZAZA
- Replace doc examples and operational leftovers where relevant
- Verify no hardcoded Lazaza remains in runtime app code

### Acceptance criteria

- Runtime code has no tenant-specific Lazaza strings
- Commented and doc leftovers are either removed or clearly marked as examples

### Risk

Low

---

## Data Strategy

## Minimum data required for full fix

To fully support receipts and compliance, the active business should provide at least:

- English business name
- Arabic business name if required for printed receipts
- address
- phone
- VAT registration number
- commercial registration number
- VAT rate if business-specific

## If some of this data is not stored yet

There are two possible paths:

### Path A — Fastest path

Store missing values temporarily inside:

- `businesses.settings`
- or `businesses.vat_settings`

This avoids immediate schema expansion.

### Path B — Cleaner path

Formalize the fields in your business metadata contracts and admin settings UI.

### Recommendation

Use **Path A first** if you want to implement quickly.
Then normalize the storage structure in a follow-up cleanup.

---

## Suggested Execution Order

Implement in this order to reduce risk:

1. Phase 1 — visible branding
2. Phase 2 — normalized business branding/config model
3. Phase 3 — business runtime data access
4. Phase 4 — receipts and PDF flows
5. Phase 5 — ZATCA QR identity
6. Phase 6 — cart persistence
7. Phase 7 — settings page
8. Phase 8 — cleanup sweep

This order ensures visible wins first, then root-cause architectural fixes, then lower-risk cleanup.

---

## Verification Checklist

After implementation, verify all of the following:

- Logging into Business A shows Business A name in nav/sidebar/mobile navbar
- Logging into Business B shows Business B name in the same places
- Printing a receipt for Business A shows Business A identity
- Printing a receipt for Business B shows Business B identity
- Downloaded PDFs use the correct business identity
- ZATCA QR seller name and VAT number match the active business
- Cart data is isolated per business
- Settings page shows the active business name
- Searching the runtime codebase for `Lazaza` and `LAZAZA` returns no active branding logic

---

## Testing Plan

### Manual testing

- Test with at least two businesses under separate users or business assignments
- Validate both screen UI and printed receipt output
- Validate Arabic and English receipt header rendering

### Automated testing candidates

- Unit test for business row to branding-config mapper
- Component test for receipt header rendering with dynamic config
- Component test for nav/sidebar branding fallback behavior
- Store test for business-aware cart persistence behavior

---

## Risks and Watchouts

### 1. Hidden fallback leakage

If `RESTAURANT_CONFIG` keeps real Lazaza values as fallback data, the app can still silently print wrong business identity when runtime business fields are missing.

### 2. Server/client mismatch

Some places are client components and can use business context directly, while server components like the settings page need a different data path.

### 3. Partial legal data

If a business has a name but no VAT or CR data, receipt generation may look correct visually while still being legally incomplete.

### 4. Persistence migration edge cases

Changing cart persistence may strand old local storage entries. Plan for either cleanup or a one-time migration strategy.

---

## Recommended First Implementation PR Scope

To keep the first implementation manageable, use this scope:

### PR 1

- Phase 1
- Phase 2
- Phase 3

### PR 2

- Phase 4
- Phase 5

### PR 3

- Phase 6
- Phase 7
- Phase 8

This keeps the receipt/compliance changes isolated from basic UI branding changes.

---

## Final Recommendation

Do not patch this as a text-replacement task only.

The visible Lazaza strings are the symptom.
The real fix is to make business identity a runtime business-scoped configuration that all UI, receipt, and QR paths consume consistently.

If we implement that properly, the app becomes truly multi-tenant in branding instead of only multi-tenant in data filtering.