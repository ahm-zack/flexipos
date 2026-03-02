# FlexiPOS Codebase Cleanup Plan

> **Status:** Plan only — no changes implemented.  
> Confirm each section before executing. Items are ordered from safest to most careful.

---

## Risk Legend

| Symbol | Meaning |
|--------|---------|
| ✅ **SAFE** | No code references this; delete without consequences |
| ⚠️ **MEDIUM** | Used by legacy/dead code paths; verify before deleting |
| 🔴 **CAREFUL** | Active references exist; requires refactor before removal |

---

## Section 1 — Accidental Files (Mistyped Commands)

These files were created because shell commands were accidentally typed into the wrong place. They have no purpose.

| File | Reason |
|------|--------|
| `h` | Fragment of a mistyped command |
| `ql -h 127.0.0.1 -p 54323 -U postgres -d postgres -c \dt` | Mistyped psql command (file with spaces in name) |
| `upabase db reset --local` | Mistyped `supabase` command |
| `aux \| grep "next dev"` | Shell pipeline accidentally created as file |
| `x check-user-state.ts` | Mistyped command fragment |

**Action:** Delete all five. ✅ **SAFE**

---

## Section 2 — Explicitly Marked for Removal

| File | Reason |
|------|--------|
| `REMOVE_ME_api_modifiers.txt` | Filename literally says to remove it |
| `REMOVE_ME_delete_these.txt` | Filename literally says to remove it |

**Action:** Delete both. ✅ **SAFE**

---

## Section 3 — Disabled Files

Files with `.disabled` extension are excluded from compilation and not imported anywhere.

| File | Reason |
|------|--------|
| `app/admin/customers/page.tsx.disabled` | Disabled route; active `page.tsx` exists |
| `components/customer-section.tsx.disabled` | Disabled component; never imported |
| `components/customer-section-simple.tsx.disabled` | Disabled component; never imported |
| `components/edit-order-dialog.tsx.disabled` | Old disabled version; active `edit-order-dialog.tsx` exists |
| `hooks/use-order-receipt.ts.disabled` | Disabled hook; active version exists |

**Action:** Delete all. ✅ **SAFE**

---

## Section 4 — Stray Files in Wrong Location

| File | Reason |
|------|--------|
| `components/khaled.md` | Personal/temp note inside the components directory |
| `receipt.recipt` | Typo filename, not a real file type, appears unused |
| `supabase.tar.gz` | Archive file checked into the project root |
| `current-schema.txt` | Snapshot text file; regenerated anytime via `supabase db dump` |
| `db-structure.txt` | Snapshot text file; redundant with migration files |

**Action:** Delete all. ✅ **SAFE**

---

## Section 5 — Internal Development Planning Docs

These `.md` files document completed tasks, refactor plans, or fix notes from AI-assisted development sessions. They clutter the root and add confusion about what is "current."

### Keep (actual reference docs)
- `README.md`
- `README-DEV-SETUP.md`
- `README-DOCKER-SETUP.md`
- `ARCHITECTURE.md`
- `PROJECT_OVERVIEW.md`
- `PRODUCTION_DEPLOYMENT_GUIDE.md`
- `VAT_CONFIGURATION_GUIDE.md`
- `CLEANUP_PLAN.md` *(this file)*

### Delete (completed task / progress notes)
| File |
|------|
| `ARABIC_LOCALIZATION_PLAN.md` |
| `CUSTOMER_FEATURE_IMPLEMENTATION_COMPLETE.md` |
| `CUSTOMER_FEATURE_IMPLEMENTATION_PLAN.md` |
| `CUSTOMER_REQUESTS_2025-08-26.md` |
| `DUPLICATE_KEYS_ERROR_FIXED.md` |
| `DYNAMIC_ARCHITECTURE_ANALYSIS.md` |
| `DYNAMIC_DATABASE_SETUP_COMPLETE.md` |
| `DYNAMIC_LOGIN_SETUP_COMPLETE.md` |
| `DYNAMIC_POS_CONVERSION_PLAN.md` |
| `DYNAMIC_PRODUCT_TRANSFORMATION_COMPLETE.md` |
| `FLEXIPOS_ARCHITECTURE_AND_USER_EXPERIENCE.md` |
| `LOGIN-FIX-COMPLETE.md` |
| `MIGRATION_COMPLETED.md` |
| `MODIFIER_MANAGER_REACT_ERROR_FIXED.md` |
| `MODIFIERS_FEATURE_COMPLETE.md` |
| `ORDERS_FEATURE_REFACTOR_PLAN.md` |
| `ORDERS_MIGRATION_COMPLETE.md` |
| `ORDERS_MIGRATION_PLAN.md` |
| `PIE_FEATURE_REFACTOR_COMPLETE.md` |
| `PIE_FEATURE_REFACTOR_PLAN.md` |
| `PIZZA_FEATURE_REFACTOR_PLAN.md` |
| `PIZZA_MIGRATION_PLAN.md` |
| `PIZZA_REFACTOR_COMPLETE.md` |
| `PRODUCTION_DEPLOYMENT_GUIDE_AUG26.md` |
| `PRODUCTION_FIXES_GUIDE.md` |
| `README-original.md` |
| `SELECT_ERROR_FIXED.md` |
| `SIGNUP_REFACTOR_COMPLETE.md` |
| `orders-feature-implementation.md` |

**Action:** Move `/docs` folder and archive, or delete. ✅ **SAFE**

### Internal module docs to delete
| File |
|------|
| `modules/eod-report/AUTHENTICATION_IMPLEMENTATION.md` |
| `modules/eod-report/IMPLEMENTATION_SUMMARY.md` |
| `modules/eod-report/README.md` |
| `modules/cart/README.md` |
| `lib/orders/README.md` |

**Action:** Delete. ✅ **SAFE**

---

## Section 6 — Root-Level Investigation / One-off Scripts

These scripts were used during development to inspect or patch the database. They do not belong in production source control.

### SQL investigation scripts
| File |
|------|
| `check-tables.sql` |
| `get-db-schema.sql` |
| `get-table-details.sql` |
| `inspect-schema.sql` |

### SQL test scripts
| File |
|------|
| `test-cash-tracking.sql` |
| `test-daily-serial-quick.sql` |
| `test-daily-serial.sql` |
| `test_payment_tracking.sql` |
| `verify_payment_columns.sql` |

### SQL one-time run scripts (already applied)
| File |
|------|
| `add-missing-item-types.sql` |
| `add-payment-method-migration.sql` |
| `add-products-simple.sql` |
| `add-sample-products.sql` |
| `add-superuser.sql` |
| `cleanup-ahmed.sql` |
| `cleanup-orphaned-users.sql` |
| `fix-order-sequence.sql` |
| `fix-production-daily-serial.sql` |
| `fix-production-pending-status.sql` |
| `production_event_discount_fix.sql` |
| `production_event_discount_setup.sql` |
| `PRODUCTION_MIGRATION_04_add_delivery_payment_method.sql` |
| `production-migration-daily-serial.sql` |
| `setup-development-business.sql` |
| `setup-development-business-fixed.sql` |
| `setup-development-business-v2.sql` |
| `reset-db.sql` |

> **Note:** If `reset-db.sql` is needed for dev environment resets, move it to `scripts/` rather than deleting.

### TypeScript/JS investigation scripts
| File |
|------|
| `check-tables.js` |
| `check-user-state.ts` |
| `cleanup-all-orphans.ts` |
| `cleanup-orphaned-users.ts` |
| `delete-user-by-email.ts` |
| `inspect-db.js` |
| `test-pie-crud.js` |
| `test-supabase-connection.ts` |

**Action:** Delete all or move to `scripts/` folder if they have ongoing utility. ✅ **SAFE**

---

## Section 7 — Redundant / Duplicate Shell Scripts

Several shell scripts overlap in purpose. Consolidate to one set.

| File | Status |
|------|--------|
| `start-dev.sh` | ✅ Keep — primary dev start script |
| `setup-dev.sh` | ✅ Keep — initial dev setup |
| `apply-migrations.sh` | ⚠️ Review — may duplicate `supabase db push` |
| `dynamic-db.sh` | ⚠️ Review — may be superseded by standard Supabase CLI |
| `migrate-to-dynamic.sh` | ⚠️ Review — one-time migration script, already run |
| `supabase-cli.sh` | ⚠️ Review — wrapper around Supabase CLI |
| `supabase-dev.sh` | ⚠️ Likely duplicate of `start-dev.sh` |
| `supabase-docker.sh` | ⚠️ Review — check if `docker-compose.yml` replaces this |
| `check-db.sh` | ⚠️ Investigation script, probably not needed |
| `check-schema.sh` | ⚠️ Investigation script, probably not needed |
| `create-admin-user.sh` | ⚠️ One-time setup, possibly already run |

**Action:** Audit and collapse to 2-3 essential scripts. Owner decision required.

---

## Section 8 — Unused Module Components

Confirmed with `grep` — not imported anywhere in the codebase.

| File | Reason |
|------|--------|
| `modules/eod-report/components/eod-report-manager.tsx` | Zero imports found |
| `modules/eod-report/components/historical-eod-reports.tsx` | Zero imports found |

**Action:** Delete both. ✅ **SAFE**

---

## Section 9 — Unused / Legacy `lib/` Files

### Explicit backup and Drizzle-specific files

| File | Reason | Risk |
|------|--------|------|
| `lib/order-service-backup.ts` | Explicit backup, only imports itself | ✅ SAFE to delete |
| `lib/order-service-drizzle.ts` | Drizzle version, not imported by any active route | ✅ SAFE to delete |
| `lib/user-service-drizzle.ts` | Drizzle version, replaced by Supabase | ✅ SAFE to delete |
| `lib/orders/test-setup.ts` | Test helper, not used in app code | ✅ SAFE to delete |
| `lib/customers/db-schema.ts` | Re-exports from `lib/db/schema` with no other logic | ⚠️ Verify no imports |
| `lib/orders/db-schema.ts` | Drizzle schema only used by drizzle files | ⚠️ Verify no imports |

### Drizzle migration artifacts

The `lib/db/migrations/` directory contains 7 Drizzle SQL migrations and their JSON snapshots. These represent the schema at the time Drizzle was used. The app has since migrated to Supabase-native migrations in `supabase/migrations/`.

| Path | Status |
|------|--------|
| `lib/db/migrations/` (entire directory) | ⚠️ **Archive** — keep as reference but move to `archive/` |
| `drizzle.config.ts` | ⚠️ Can be deleted once `lib/db/` is removed |

> **⚠️ IMPORTANT:** `lib/db/index.ts` and `lib/db/schema.ts` are **still actively used** by:  
> - `app/api/auth/signup/step1/route.ts`  
> - `app/api/auth/signup/step2/route.ts`  
> - `app/api/auth/me/route.ts`  
> - `app/api/admin/initialize-claims/route.ts`  
> - `modules/user-management/components/edit-user-dialog.tsx` (imports `UserRole` type)  
> 
> These must be **migrated to Supabase native** before `lib/db/` can be removed. This is a 🔴 **CAREFUL** task.

---

## Section 10 — Unused Root-Level Hooks

Three versions of `use-current-user` exist:

| File | Status |
|------|--------|
| `hooks/use-current-user-optimized.ts` | ✅ ACTIVE — use this one exclusively |
| `hooks/use-current-user.ts` | ⚠️ Check if still imported anywhere |
| `hooks/use-current-user-client.ts` | ⚠️ Check if still imported anywhere |

Also:

| File | Status |
|------|--------|
| `hooks/useProducts.ts` (root-level) | ⚠️ Duplicated by `modules/product-feature/hooks/useProducts.ts` — verify which is imported |

**Action:** Run `grep -r "use-current-user[^-]" --include="*.tsx" --include="*.ts"` to confirm which version is in use, then delete the others. ⚠️ **MEDIUM**

---

## Section 11 — Unused / Redundant Components

| File | Status | Reason |
|------|--------|--------|
| `components/dashboard-layout.tsx` | ✅ SAFE to delete | Not imported anywhere; `modern-admin-layout` is used |
| `components/dashboard-layout-client.tsx` | ✅ SAFE to delete | Not imported anywhere |
| `components/business-debug-info.tsx` | ⚠️ Only in inventory page | Remove from inventory page, then delete |
| `components/coming-soon.tsx` | ⚠️ Verify imports | Likely not used |
| `components/skeleton-loader.tsx` | ⚠️ Verify imports | May be replaced by ShadCN `Skeleton` |
| `components/desktop-admin-navbar.tsx` | ⚠️ Verify imports | Possibly replaced by app-sidebar |
| `components/modern-admin-navbar.tsx` | ⚠️ Verify imports | Check if used by modern-admin-layout |

**Action:** Verify with grep before deleting. ⚠️ **MEDIUM**

---

## Section 12 — `lib/query-keys/` — Consolidate

| File | Status |
|------|--------|
| `lib/query-keys/categoryKeys.ts` | ⚠️ Only one file; may be superseded by module-level `product-keys.ts` |

Check if `categoryKeys.ts` is imported anywhere vs `modules/product-feature/queries/product-keys.ts`.

---

## Section 13 — Events Page — Evaluate

`app/admin/events/page.tsx` displays an event discount manager backed by a `useEventDiscountStore` (Zustand). The discount is **in-memory only** (not persisted to DB).

**Issues:**
- Discount state resets on page refresh
- No sidebar link confirmed to this page (verify in `app-sidebar.tsx`)
- Business context is not applied — it's global state, not tenant-scoped

**Recommendation:** Either persist the event discount to the DB per `business_id`, or remove the page until it's properly implemented. 🔴 **CAREFUL**

---

## Section 14 — `app/private/page.tsx` — Remove or Repurpose

This page appears to be a Next.js Supabase auth template leftover. Confirm it serves no active purpose before removing. ⚠️ **MEDIUM**

---

## Recommended Execution Order

```
Phase 1 (< 5 min, zero risk):
  - Section 1: Accidental files
  - Section 2: REMOVE_ME files
  - Section 3: .disabled files
  - Section 4: Stray files

Phase 2 (15 min, safe):
  - Section 5: Internal planning .md files
  - Section 6: Root investigation scripts
  - Section 8: Unused module components
  - Section 9 (partial): lib/order-service-backup.ts, lib/order-service-drizzle.ts, lib/user-service-drizzle.ts

Phase 3 (30 min, verify first):
  - Section 7: Shell script consolidation
  - Section 10: Unused hook versions
  - Section 11: Redundant components
  - Section 12: Query keys consolidation

Phase 4 (1-2 hours, requires refactor):
  - Section 9 (lib/db/): Migrate signup/users API routes from Drizzle → Supabase
  - Section 13: Persist event discount or remove page
  - Section 14: Remove app/private page
```

---

## Estimated Impact

| Metric | Before | After (estimated) |
|--------|--------|-------------------|
| Root-level files | ~95 | ~20 |
| `lib/` files | 45 | ~25 |
| Component files | 75 | ~60 |
| Hook files | 14 | ~10 |
| `.md` planning files | 40+ | 8 |

---

*Generated by audit on: 2025-09-01*
