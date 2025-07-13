# 📦 Orders Feature Migration Plan: From APIs to Client Queries

## 🎯 Migration Overview

This plan will migrate the **Orders feature** from API routes and server-side rendering to direct client-side Supabase queries using TanStack Query, following the same pattern successfully implemented for Pizza and Pies features.

## 📋 Current State Analysis

### **Current Architecture (API-Based)**

```
🌐 UI Components
    ↓ (fetch calls)
📡 API Routes (/api/orders/*)
    ↓ (Drizzle ORM)
🏛️ orderService (lib/order-service.ts)
    ↓ (SQL queries)
🗃️ Database (orders, canceled_orders, modified_orders)
```

### **Current API Endpoints**

- `GET /api/orders` - List orders with filters
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order
- `POST /api/orders/[id]/cancel` - Cancel order
- `POST /api/orders/[id]/modify` - Modify order
- `GET /api/orders/[id]/history` - Get order history
- `GET /api/orders/canceled` - Get canceled orders
- `GET /api/orders/modified` - Get modified orders

### **Current Hook Structure**

- **Query Hooks**: `useOrders`, `useOrder`, `useOrderHistory`, `useCanceledOrders`, `useModifiedOrders`
- **Mutation Hooks**: `useCreateOrder`, `useUpdateOrder`, `useDeleteOrder`, `useCancelOrder`, `useModifyOrder`
- **Query Keys**: Well-structured with `orderKeys` factory

## 🎯 Target Architecture (Client-Side Queries)

### **New Architecture (Client-Based)**

```
🌐 UI Components
    ↓ (TanStack Query hooks)
🔄 Client Hooks (use-orders.ts)
    ↓ (Direct Supabase calls)
🏛️ orderClientService (lib/supabase-queries/order-client-service.ts)
    ↓ (Supabase SDK)
🗃️ Database (orders, canceled_orders, modified_orders)
```

### **Benefits of Migration**

- ⚡ **Performance**: Direct database queries, no API overhead
- 🔄 **Real-time**: Supabase subscriptions for live updates
- 💾 **Better Caching**: TanStack Query optimizations
- 🎯 **Optimistic Updates**: Instant UI feedback
- 🔧 **Simplified Architecture**: Fewer layers, easier debugging
- 📱 **Offline Support**: Better cache management

## 🗂️ Database Schema (Already Exists)

The orders feature uses three tables:

- **`orders`**: Main orders table with items as JSONB
- **`canceled_orders`**: Stores canceled order history
- **`modified_orders`**: Stores order modification history

```typescript
// Key Types (from lib/orders/db-schema.ts)
export interface OrderItem {
  id: string;
  type: "pizza" | "pie" | "sandwich" | "mini_pie";
  name: string;
  nameAr: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  details?: Record<string, unknown>;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string | null;
  items: OrderItem[]; // JSONB array
  totalAmount: string; // Decimal as string
  paymentMethod: "cash" | "card" | "mixed";
  status: "completed" | "canceled" | "modified";
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## 📋 Phase-by-Phase Implementation

### **Phase 1: Create Orders Client Service** ⏱️ ~45 minutes

**File**: `/lib/supabase-queries/order-client-service.ts`

```typescript
import { createClient } from "@/utils/supabase/client";
import type {
  Order,
  CanceledOrder,
  ModifiedOrder,
  OrderItem,
} from "@/lib/orders/db-schema";
import type { OrderFilters } from "@/lib/order-service";

export const supabase = createClient();

export const orderClientService = {
  // ✅ CRUD Operations
  async getOrders(
    filters = {},
    page = 1,
    limit = 10
  ): Promise<OrdersListResult> {},
  async getOrderById(id: string): Promise<Order> {},
  async createOrder(orderData: CreateOrderData): Promise<Order> {},
  async updateOrder(id: string, updateData: Partial<Order>): Promise<Order> {},
  async deleteOrder(id: string): Promise<void> {},

  // ✅ Special Operations
  async cancelOrder(
    id: string,
    canceledBy: string,
    reason?: string
  ): Promise<CanceledOrder> {},
  async modifyOrder(
    id: string,
    modificationData: ModifyOrderData
  ): Promise<ModifiedOrder> {},
  async getOrderHistory(id: string): Promise<OrderHistoryResult> {},
  async getCanceledOrders(): Promise<CanceledOrder[]> {},
  async getModifiedOrders(): Promise<ModifiedOrder[]> {},
};
```

### **Phase 2: Update Orders Hooks** ⏱️ ~30 minutes

**File**: `/modules/orders-feature/hooks/use-orders.ts`

Replace all fetch calls with `orderClientService` calls:

```typescript
// Before (API-based)
const fetchOrders = async (filters, page, limit) => {
  const response = await fetch(`/api/orders?${searchParams}`);
  const data = await response.json();
  return data.data;
};

// After (Client-based)
const fetchOrders = async (filters, page, limit) => {
  return await orderClientService.getOrders(filters, page, limit);
};
```

### **Phase 3: Update SSR Pages** ⏱️ ~15 minutes

**File**: `/app/admin/orders/page.tsx`

```typescript
// Before (using orderService)
const result = await orderService.getOrders({}, 1, 10);

// After (using orderClientService)
const result = await orderClientService.getOrders({}, 1, 10);
```

### **Phase 4: Remove API Routes** ⏱️ ~5 minutes

Delete these files:

- `/app/api/orders/route.ts`
- `/app/api/orders/[id]/route.ts`
- `/app/api/orders/[id]/cancel/route.ts`
- `/app/api/orders/[id]/modify/route.ts`
- `/app/api/orders/[id]/history/route.ts`
- `/app/api/orders/canceled/route.ts`
- `/app/api/orders/modified/route.ts`

### **Phase 5: Optional Cleanup** ⏱️ ~10 minutes

Keep `orderService` for now (might be used by other features), but remove unused exports.

## 🔧 Detailed Implementation Steps

### **Step 1: Create Order Client Service**

```typescript
// lib/supabase-queries/order-client-service.ts
import { createClient } from "@/utils/supabase/client";
import type {
  Order,
  CanceledOrder,
  ModifiedOrder,
} from "@/lib/orders/db-schema";
import type { OrderFilters } from "@/lib/order-service";

export const supabase = createClient();

// Type transformations
const transformSupabaseToOrder = (row: any): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  customerName: row.customer_name,
  items: row.items || [],
  totalAmount: row.total_amount,
  paymentMethod: row.payment_method,
  status: row.status,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  createdBy: row.created_by,
});

export const orderClientService = {
  // Get orders with filters and pagination
  async getOrders(filters: OrderFilters = {}, page = 1, limit = 10) {
    let query = supabase
      .from("orders")
      .select(
        `
        *,
        cashier:users!orders_created_by_fkey(name)
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.paymentMethod)
      query = query.eq("payment_method", filters.paymentMethod);
    if (filters.customerName)
      query = query.ilike("customer_name", `%${filters.customerName}%`);
    if (filters.orderNumber)
      query = query.ilike("order_number", `%${filters.orderNumber}%`);
    if (filters.createdBy) query = query.eq("created_by", filters.createdBy);
    if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
    if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    // Transform data
    const orders = (data || []).map((row) => ({
      ...transformSupabaseToOrder(row),
      cashierName: row.cashier?.name,
    }));

    return {
      orders,
      total: count || 0,
      page,
      limit,
    };
  },

  // Get single order by ID
  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        cashier:users!orders_created_by_fkey(name)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") throw new Error("Order not found");
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    return {
      ...transformSupabaseToOrder(data),
      cashierName: data.cashier?.name,
    };
  },

  // Create new order
  async createOrder(orderData: {
    customerName?: string;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: "cash" | "card" | "mixed";
    createdBy: string;
  }) {
    // Generate order number (you may need to implement this)
    const orderNumber = await this.generateOrderNumber();

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customerName || null,
        items: orderData.items,
        total_amount: orderData.totalAmount.toString(),
        payment_method: orderData.paymentMethod,
        created_by: orderData.createdBy,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);
    return transformSupabaseToOrder(data);
  },

  // Update order
  async updateOrder(id: string, updateData: Partial<Order>) {
    const updateFields: Record<string, any> = {};

    if (updateData.customerName !== undefined)
      updateFields.customer_name = updateData.customerName;
    if (updateData.items !== undefined) updateFields.items = updateData.items;
    if (updateData.totalAmount !== undefined)
      updateFields.total_amount = updateData.totalAmount.toString();
    if (updateData.status !== undefined)
      updateFields.status = updateData.status;
    if (updateData.paymentMethod !== undefined)
      updateFields.payment_method = updateData.paymentMethod;

    updateFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("orders")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update order: ${error.message}`);
    return transformSupabaseToOrder(data);
  },

  // Delete order (soft delete by updating status)
  async deleteOrder(id: string) {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw new Error(`Failed to delete order: ${error.message}`);
  },

  // Cancel order
  async cancelOrder(id: string, canceledBy: string, reason?: string) {
    // First get the original order
    const originalOrder = await this.getOrderById(id);

    // Insert into canceled_orders table
    const { data, error } = await supabase
      .from("canceled_orders")
      .insert({
        original_order_id: id,
        canceled_by: canceledBy,
        reason,
        order_data: originalOrder,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to cancel order: ${error.message}`);

    // Update original order status
    await this.updateOrder(id, { status: "canceled" });

    return {
      id: data.id,
      originalOrderId: data.original_order_id,
      canceledAt: data.canceled_at,
      canceledBy: data.canceled_by,
      reason: data.reason,
      orderData: data.order_data,
    };
  },

  // Additional methods for modify, history, etc...
  // ... (implement similar patterns)

  // Generate order number helper
  async generateOrderNumber(): Promise<string> {
    // Implementation depends on your business logic
    // This is a simplified version
    const timestamp = Date.now();
    return `ORD-${timestamp}`;
  },
};
```

### **Step 2: Update Hooks File**

```typescript
// modules/orders-feature/hooks/use-orders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderClientService } from "@/lib/supabase-queries/order-client-service";
// ... rest of imports

// Replace API functions with client service calls
const fetchOrders = async (filters = {}, page = 1, limit = 10) => {
  return await orderClientService.getOrders(filters, page, limit);
};

const fetchOrderById = async (id: string) => {
  return await orderClientService.getOrderById(id);
};

const createOrder = async (orderData: CreateOrder) => {
  return await orderClientService.createOrder(orderData);
};

// ... update all other functions similarly
```

### **Step 3: Update SSR Pages**

```typescript
// app/admin/orders/page.tsx
import { orderClientService } from "@/lib/supabase-queries/order-client-service";
// Remove: import { orderService } from "@/lib/order-service";

export default async function OrdersPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: orderKeys.list({}, 1, 10),
    queryFn: async () => {
      // Replace orderService with orderClientService
      return await orderClientService.getOrders({}, 1, 10);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersProvider>
        <OrdersList />
      </OrdersProvider>
    </HydrationBoundary>
  );
}
```

## 🔒 Security Considerations

### **Row Level Security (RLS)**

Ensure Supabase RLS policies are properly configured:

```sql
-- Enable RLS on all orders tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canceled_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE modified_orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read orders
CREATE POLICY "Allow authenticated users to read orders" ON orders
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to create orders
CREATE POLICY "Allow authenticated users to create orders" ON orders
    FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Allow users to update their own orders or admins to update any
CREATE POLICY "Allow order updates" ON orders
    FOR UPDATE TO authenticated USING (
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
    );

-- Similar policies for canceled_orders and modified_orders tables
```

## 🧪 Testing Strategy

### **1. Test Client Service**

```typescript
// Test in browser console
import { orderClientService } from "@/lib/supabase-queries/order-client-service";

// Test fetching orders
const orders = await orderClientService.getOrders();
console.log("Orders:", orders);
```

### **2. Test Hooks**

```typescript
// Test hooks in components
const { data: orders, isLoading, error } = useOrders();
console.log("Hook result:", { orders, isLoading, error });
```

### **3. Manual Testing Checklist**

- [ ] Orders list loads correctly
- [ ] Pagination works
- [ ] Filters apply correctly
- [ ] Order creation works
- [ ] Order updates work
- [ ] Order cancellation works
- [ ] Order modification works
- [ ] Order history displays
- [ ] SSR hydration works
- [ ] Performance is improved

## 📊 Performance Monitoring

Monitor these metrics before and after migration:

- **Query response times** - Should improve with direct queries
- **Page load times** - SSR with hydration should be faster
- **Cache hit ratio** - TanStack Query efficiency
- **Bundle size** - Should decrease by removing API route code

## 🚀 Migration Timeline

| Phase     | Duration     | Description                        |
| --------- | ------------ | ---------------------------------- |
| Phase 1   | 45 min       | Create order client service        |
| Phase 2   | 30 min       | Update hooks to use client service |
| Phase 3   | 15 min       | Update SSR pages                   |
| Phase 4   | 5 min        | Remove API routes                  |
| Phase 5   | 10 min       | Optional cleanup                   |
| **Total** | **~2 hours** | Complete migration                 |

## 🎯 Success Criteria

- ✅ All order operations work without API routes
- ✅ SSR hydration working correctly
- ✅ Filters and pagination working
- ✅ Performance improved (faster queries)
- ✅ Build passes without errors
- ✅ Cache strategies working effectively
- ✅ Real-time capabilities available (optional)

## 📝 Post-Migration Tasks

1. **Enable Real-time** (Optional): Add Supabase subscriptions for live updates
2. **Optimistic Updates** (Optional): Implement for better UX
3. **Performance Testing**: Compare before/after metrics
4. **Documentation Update**: Update architecture docs
5. **Team Training**: Brief team on new patterns

## 🎉 Expected Results

After migration, the orders feature will have:

- ⚡ **Faster operations** - Direct database access
- 🔄 **Real-time capabilities** - Supabase subscriptions ready
- 📱 **Better offline support** - TanStack Query caching
- 🎯 **Optimistic updates** - Instant UI feedback available
- 🔧 **Simplified debugging** - Fewer layers between UI and data
- 🏗️ **Consistent architecture** - Matches pizza/pies patterns

The migration follows the exact same proven pattern used for Pizza and Pies features, ensuring consistency and maintainability across the codebase.

---

**Ready to start implementation?** This plan provides a step-by-step guide to migrate the orders feature safely and efficiently! 🚀
