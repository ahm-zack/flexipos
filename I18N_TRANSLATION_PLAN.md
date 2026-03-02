# FlexiPOS — i18n Translation Plan

## Setup Summary

- Library: `next-intl`
- Strategy: Cookie-based (`NEXT_LOCALE`), no URL restructure
- Default locale: `en`
- Supported locales: `en`, `ar`
- Messages live in: `messages/{locale}/{namespace}.json`
- Request config: `lib/i18n/request.ts`

---

## Namespace Map

| Namespace   | File                               | Used By                                           |
| ----------- | ---------------------------------- | ------------------------------------------------- |
| `common`    | `messages/{locale}/common.json`    | Shared buttons, status labels, errors             |
| `auth`      | `messages/{locale}/auth.json`      | Login, Signup, Unauthorized, Error pages          |
| `dashboard` | `messages/{locale}/dashboard.json` | Dashboard page + both navbars                     |
| `pos`       | `messages/{locale}/pos.json`       | Cart panel, product cashier view, receipt modal   |
| `orders`    | `messages/{locale}/orders.json`    | Orders list, orders header                        |
| `menu`      | `messages/{locale}/menu.json`      | Product mgmt view, category system, product forms |
| `users`     | `messages/{locale}/users.json`     | Users page, users table, add/edit user dialogs    |
| `customers` | `messages/{locale}/customers.json` | Customers list, stats, form dialog                |
| `reports`   | `messages/{locale}/reports.json`   | EOD report dashboard, sales report dashboard      |
| `settings`  | `messages/{locale}/settings.json`  | Settings page                                     |
| `events`    | `messages/{locale}/events.json`    | Event discount management page                    |

---

## Translation Progress

### Pages

| File                                                  | Status                          | Namespace(s) |
| ----------------------------------------------------- | ------------------------------- | ------------ |
| `app/login/page.tsx`                                  | ✅ Done                         | `auth`       |
| `app/signup/page.tsx` → `components/sign-up-form.tsx` | ⏳ Pending                      | `auth`       |
| `app/unauthorized/page.tsx`                           | ⏳ Pending                      | `auth`       |
| `app/error/page.tsx`                                  | ⏳ Pending                      | `auth`       |
| `app/admin/page.tsx`                                  | delegates to `Dashboard` module | —            |
| `app/admin/settings/page.tsx`                         | ✅ Done                         | `settings`   |
| `app/admin/events/page.tsx`                           | ✅ Done                         | `events`     |
| `app/admin/orders/page.tsx`                           | delegates to module             | —            |
| `app/admin/customers/page.tsx`                        | delegates to module             | —            |
| `app/admin/users/page.tsx`                            | delegates to module             | —            |
| `app/admin/users/new/page.tsx`                        | delegates to module             | —            |
| `app/admin/reports/page.tsx`                          | delegates to module             | —            |
| `app/admin/reports/sales/page.tsx`                    | delegates to module             | —            |
| `app/admin/inventory/page.tsx`                        | delegates to module             | —            |
| `app/admin/menu/[id]/page.tsx`                        | delegates to module             | —            |

---

### Module Components

| File                                                             | Status  | Namespace(s)  |
| ---------------------------------------------------------------- | ------- | ------------- |
| `modules/dashboard/components/dashboard.tsx`                     | ✅ Done | `dashboard`   |
| `modules/orders-feature/components/orders-header.tsx`            | ✅ Done | `orders`      |
| `modules/orders-feature/components/orders-list.tsx`              | ✅ Done | `orders`      |
| `modules/customers-feature/components/customers-list.tsx`        | ✅ Done | `customers`   |
| `modules/customers-feature/components/customers-stats.tsx`       | ✅ Done | `customers`   |
| `modules/customers-feature/components/customer-form-dialog.tsx`  | ✅ Done | `customers`   |
| `modules/cart/components/cart-panel.tsx`                         | ✅ Done | `pos`         |
| `modules/cart/components/cart-container.tsx`                     | ✅ Done | `pos`         |
| `modules/cart/components/add-to-cart-button.tsx`                 | ✅ Done | `pos`         |
| `modules/providers/CreatedOrderReciptsModal.tsx`                 | ✅ Done | `pos`         |
| `modules/user-management/components/users-page-content.tsx`      | ✅ Done | `users`       |
| `modules/user-management/components/users-table.tsx`             | ✅ Done | `users`       |
| `modules/user-management/components/add-user-dialog.tsx`         | ✅ Done | `users`       |
| `modules/user-management/components/create-user-form.tsx`        | ✅ Done | `users`       |
| `modules/user-management/components/edit-user-dialog.tsx`        | ✅ Done | `users`       |
| `modules/eod-report/components/eod-report-dashboard.tsx`         | ✅ Done | `reports`     |
| `modules/sales-report/components/sales-report-dashboard.tsx`     | ✅ Done | `reports`     |
| `modules/product-feature/components/product-cashier-view.tsx`    | ✅ Done | `pos`, `menu` |
| `modules/product-feature/components/product-cashier-card.tsx`    | ✅ Done | `pos`         |
| `modules/product-feature/components/product-management-view.tsx` | ✅ Done | `menu`        |
| `modules/product-feature/components/product-management-card.tsx` | ✅ Done | `menu`        |
| `modules/product-feature/components/category-system.tsx`         | ✅ Done | `menu`        |
| `modules/product-feature/components/category-form.tsx`           | ✅ Done | `menu`        |
| `modules/product-feature/components/create-product-form.tsx`     | ✅ Done | `menu`        |
| `modules/product-feature/components/edit-product-form.tsx`       | ✅ Done | `menu`        |
| `components/dynamic-desktop-admin-navbar.tsx`                    | ✅ Done | `dashboard`   |
| `components/mobile-admin-navbar.tsx`                             | ✅ Done | `dashboard`   |

---

## Implementation Pattern

### Server Component

```tsx
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("auth");
  return <h1>{t("login.title")}</h1>;
}
```

### Client Component

```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("pos");
  return <button>{t("cart.checkout")}</button>;
}
```

### Guidelines

- Always call `useTranslations` / `getTranslations` at the top of the component — one call per namespace needed
- Use dot notation for nested keys: `t('cart.total')`
- For plurals: `t('items', { count: 3 })`
- Never translate dynamic values (names, prices) — only UI labels
- All `toast.error` / `toast.success` strings must also use `t()`
- RTL: use Tailwind logical properties — `ms-`, `me-`, `ps-`, `pe-` instead of `ml-`, `mr-`, `pl-`, `pr-`
- Use `text-start` / `text-end` instead of `text-left` / `text-right`

---

## New Namespace: `events`

This namespace doesn't exist yet — must be created for `app/admin/events/page.tsx`.

### Keys needed

```json
{
  "title": "Event Discount Management",
  "howItWorks": "How It Works",
  "currentStatus": "Current Status",
  "configuration": "Event Configuration",
  "activationControl": "Activation Control",
  "eventName": "Event Name",
  "eventNamePlaceholder": "e.g., Grand Opening, Black Friday...",
  "discountPercentage": "Discount Percentage",
  "percentagePlaceholder": "Enter percentage (0-100)",
  "updateSettings": "Update Discount Settings",
  "activate": "Activate Event",
  "deactivate": "Deactivate Event",
  "active": "ACTIVE",
  "inactive": "INACTIVE",
  "currentlyActive": "Currently active",
  "currentlyInactive": "Currently inactive",
  "toggleLabel": "Event Discount Active",
  "toggleDesc": "Toggle to activate/deactivate the event discount",
  "allOrdersDiscount": "All orders will automatically receive this discount",
  "tip": "Make sure to set both the event name and percentage before activating.",
  "toasts": {
    "invalidPercentage": "Please enter a valid percentage between 0 and 100",
    "missingName": "Please enter an event name",
    "updated": "Event discount updated successfully!",
    "activated": "Event discount activated!",
    "deactivated": "Event discount deactivated",
    "missingNameBeforeActivate": "Please enter an event name before activating",
    "missingPercentageBeforeActivate": "Please set a valid discount percentage before activating"
  }
}
```

---

## Batch Order (suggested execution)

1. **Batch 1** — Auth pages (small, self-contained): `login`, `unauthorized`, `error`, `signup`
2. **Batch 2** — Cart + POS: `cart-panel`, `cart-container`, `add-to-cart-button`, `product-cashier-view`, `receipt-modal`
3. **Batch 3** — Orders: `orders-list`, `orders-header`
4. **Batch 4** — Customers: `customers-list`, `customers-stats`, `customer-form-dialog`
5. **Batch 5** — Menu/Products: `product-management-view`, `category-system`, `category-form`, `create-product-form`, `edit-product-form`
6. **Batch 6** — Users: `users-page-content`, `users-table`, `add-user-dialog`, `create-user-form`, `edit-user-dialog`
7. **Batch 7** — Reports: `eod-report-dashboard`, `sales-report-dashboard`
8. **Batch 8** — Dashboard module
9. **Batch 9** — Settings + Events pages
