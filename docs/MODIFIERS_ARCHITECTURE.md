# Modifiers Feature Architecture

## 1. Database Layer

- **menuItemModifiers**: Stores all possible modifiers for menu items (e.g., extra cheese, no onions).
- **orderItemModifiers**: Stores which modifiers were selected for each order item (for historical accuracy and reporting).

---

## 2. Backend Service Layer

- **File:** `lib/modifiers-service.ts`
- **Responsibilities:**
  - CRUD operations for menu item modifiers:
    - `getModifiersByMenuItem(menuItemId, menuItemType)`
    - `createModifier(request)`
    - `updateModifier(modifierId, request)`
    - `deleteModifier(modifierId)`
    - `reorderModifiers(request)`
  - Order integration:
    - `saveOrderModifiers(orderId, menuItemId, menuItemType, selectedModifierIds)`
    - `getOrderModifiers(orderId, menuItemId)`

---

## 3. API Layer

- **API Endpoints:** (e.g., `/api/modifiers/`)
  - Expose the above service functions to the frontend via REST or RPC endpoints.
  - Handle request validation and authentication.

---

## 4. Frontend Layer

- **Modifier Management UI:**
  - Admins can create, update, delete, and reorder modifiers for menu items.
  - Modifier forms use the API to call the service functions.
- **Order UI:**
  - When a user adds a menu item to their cart, available modifiers are fetched and displayed.
  - User selects modifiers (e.g., extra cheese, no onions) and these are sent with the order.
  - On order submission, selected modifiers are saved using `saveOrderModifiers`.

---

## 5. Order/Receipt Integration

- When displaying an order or receipt, the app fetches the selected modifiers for each order item using `getOrderModifiers` and displays them alongside the item.

---

## Data Flow Example

1. **Admin adds a new modifier** for a pizza (e.g., "Extra Cheese"):
   - Frontend calls API → `createModifier` service → DB insert in `menuItemModifiers`.
2. **Customer orders a pizza with modifiers**:
   - Frontend fetches modifiers for the pizza via API → `getModifiersByMenuItem`.
   - User selects "Extra Cheese" and "No Onions".
   - On checkout, frontend sends selected modifier IDs with the order.
   - Backend calls `saveOrderModifiers` to record the selection in `orderItemModifiers`.
3. **Order receipt is displayed**:
   - Frontend fetches order details and calls API → `getOrderModifiers` for each item.
   - UI displays the pizza with "Extra Cheese" and "No Onions" listed.

---

## Summary Diagram

```
[Admin UI] ──┬─> [API] ──┬─> [modifiers-service.ts] ──┬─> [menuItemModifiers table]
             │           │                            │
[Order UI] ──┘           │                            │
                         └─> [orderItemModifiers table]
```

- **Admin UI** manages available modifiers.
- **Order UI** lets users select modifiers for their order.
- **API** exposes service functions.
- **Service** handles business logic and DB access.
- **DB** stores both available and selected modifiers.
