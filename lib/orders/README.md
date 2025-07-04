# Orders Management System

This document provides detailed information about the orders management system implementation.

## File Structure

```
lib/orders/
├── index.ts           # Main exports for the orders module
├── schemas.ts         # Zod validation schemas
├── db-schema.ts       # Drizzle database schemas
└── utils.ts          # Utility functions
```

## Database Tables

### 1. `orders` table

**Purpose**: Main orders storage

```sql
- id: UUID (Primary Key)
- order_number: TEXT (Unique) - Format: ORD-YYYYMMDD-XXXXXX
- customer_name: TEXT (Optional)
- items: JSONB (Order items array)
- total_amount: DECIMAL(10,2)
- status: ENUM (pending, completed, canceled, modified)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- created_by: UUID (Foreign Key -> users.id)
```

### 2. `canceled_orders` table

**Purpose**: Track canceled orders with complete history

```sql
- id: UUID (Primary Key)
- original_order_id: UUID (Foreign Key -> orders.id)
- canceled_at: TIMESTAMP
- canceled_by: UUID (Foreign Key -> users.id)
- reason: TEXT (Optional)
- order_data: JSONB (Complete original order data)
```

### 3. `modified_orders` table

**Purpose**: Track order modifications with before/after data

```sql
- id: UUID (Primary Key)
- original_order_id: UUID (Foreign Key -> orders.id)
- modified_at: TIMESTAMP
- modified_by: UUID (Foreign Key -> users.id)
- modification_type: ENUM (item_added, item_removed, quantity_changed, item_replaced, multiple_changes)
- original_data: JSONB (Original order data)
- new_data: JSONB (Modified order data)
```

## Order Item Structure

Each order contains an array of items with the following structure:

```typescript
interface OrderItem {
  id: string; // Item ID (pizza, pie, sandwich, etc.)
  type: "pizza" | "pie" | "sandwich" | "mini_pie";
  name: string; // Item name (English)
  nameAr: string; // Item name (Arabic)
  quantity: number; // Quantity ordered
  unitPrice: number; // Price per unit
  totalPrice: number; // Total price for this item
  details?: Record<string, unknown>; // Additional details (size, extras, etc.)
}
```

## Validation Schemas

### Order Validation

- **CreateOrderSchema**: For new orders
- **UpdateOrderSchema**: For order modifications
- **OrderFormSchema**: For frontend form validation

### Cart Validation

- **CartItemSchema**: Individual cart items
- **CartSchema**: Complete cart with totals

### Filter Validation

- **OrderFiltersSchema**: Query parameters for filtering orders

## Utility Functions

### Order Number Generation

- **generateOrderNumber()**: Creates unique order numbers
- **formatOrderNumber()**: Formats for display (#ORD-20250704-123456)
- **parseOrderDate()**: Extracts date from order number

### Calculations

- **calculateOrderTotal()**: Calculates total from items
- **validateOrderItems()**: Validates item structure

### Display Helpers

- **getOrderStatusColor()**: Returns appropriate color for status
- **getOrderStatusText()**: Returns human-readable status text
- **formatOrderItems()**: Formats items for display

## Migration Instructions

1. **Generate Migration**:

   ```bash
   npx drizzle-kit generate
   ```

2. **Apply to Supabase**:

   ```bash
   supabase db push
   ```

3. **Or manually apply the SQL**:
   - Copy the generated SQL from `lib/db/migrations/0001_perpetual_luckman.sql`
   - Run it in your Supabase dashboard or CLI

## Usage Examples

### Creating an Order

```typescript
import { CreateOrderSchema } from "@/lib/orders";

const orderData = {
  customerName: "John Doe",
  items: [
    {
      id: "pizza-1",
      type: "pizza",
      name: "Margherita Pizza",
      nameAr: "بيتزا مارغريتا",
      quantity: 2,
      unitPrice: 15.0,
      totalPrice: 30.0,
      details: { size: "large", crust: "thin" },
    },
  ],
  totalAmount: 30.0,
  createdBy: "user-uuid",
};

const validatedOrder = CreateOrderSchema.parse(orderData);
```

### Validating Cart Items

```typescript
import { CartSchema } from '@/lib/orders';

const cart = {
  items: [...],
  totalAmount: 45.00,
  itemCount: 3
};

const validatedCart = CartSchema.parse(cart);
```

## Next Steps

After running the migration, you can:

1. **Create API endpoints** for order management
2. **Build frontend components** for cart and orders
3. **Implement order processing** logic
4. **Add order status tracking**
5. **Create reporting features**

## Foreign Key Relationships

- `orders.created_by` → `users.id`
- `canceled_orders.original_order_id` → `orders.id`
- `canceled_orders.canceled_by` → `users.id`
- `modified_orders.original_order_id` → `orders.id`
- `modified_orders.modified_by` → `users.id`

All foreign key relationships include proper cascade deletion where appropriate to maintain data integrity.
