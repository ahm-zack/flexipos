# Orders Feature - Complete Implementation Guide

## 📋 Overview

This document provides a comprehensive guide to implementing the orders feature module from the POS dashboard. The orders feature is a complete order management system with filtering, search, CRUD operations, order history tracking, and a responsive UI.

## 📁 Module Structure

```
modules/orders-feature/
├── index.ts                 # Main exports and re-exports
├── hooks/
│   └── use-orders.ts       # React Query hooks for all CRUD operations (229 lines)
├── contexts/
│   └── orders-context.tsx  # State management & UI context (367 lines)
└── components/
    ├── orders-header.tsx   # Search/filter header component (200 lines)
    └── orders-list.tsx     # Main orders display component (602 lines)
```

## 🔧 Core Dependencies

### Required NPM Packages

```json
{
  "@tanstack/react-query": "^5.x",
  "@supabase/supabase-js": "^2.x",
  "drizzle-orm": "^0.x",
  "zod": "^3.x",
  "zustand": "^4.x",
  "lucide-react": "^0.x",
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-dropdown-menu": "^1.x",
  "@radix-ui/react-select": "^1.x"
}
```

### UI Components Required

- Card, CardHeader, CardTitle, CardContent
- Badge with variants (destructive, secondary, default)
- Button with variants (ghost, outline, default)
- Input with search functionality
- Dialog, DropdownMenu, Pagination
- DateTimePicker component
- Currency symbol component

## 📋 Type Definitions & Schemas

### Core Enums and Types (`/lib/orders/schemas.ts`)

```typescript
// Order Status
export const OrderStatusEnum = z.enum(["completed", "canceled", "modified"]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// Payment Methods
export const PaymentMethodEnum = z.enum(["cash", "card", "mixed", "delivery"]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

// Delivery Platforms
export const DeliveryPlatformEnum = z.enum([
  "keeta",
  "hunger_station",
  "jahez",
]);
export type DeliveryPlatform = z.infer<typeof DeliveryPlatformEnum>;

// Cart Item Modifier
export const CartItemModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["extra", "without"]),
  price: z.number(),
});

// Cart Item (for incoming orders)
export const CartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  modifiers: z.array(CartItemModifierSchema).optional(),
  modifiersTotal: z.number().optional(),
});

// Order Item (stored format)
export const OrderItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["pizza", "pie", "sandwich", "mini_pie"]),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  details: z.record(z.any()).optional(),
});

// Main Order Schema
export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(1),
  dailySerial: z.string().optional(),
  serialDate: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().min(0),
  paymentMethod: PaymentMethodEnum,
  deliveryPlatform: DeliveryPlatformEnum.optional(),
  status: OrderStatusEnum,
  discountType: z.enum(["percentage", "amount"]).optional(),
  discountValue: z.number().optional(),
  discountAmount: z.number().min(0).optional(),
  eventDiscountName: z.string().optional(),
  eventDiscountPercentage: z.number().min(0).max(100).optional(),
  eventDiscountAmount: z.number().min(0).optional(),
  cashAmount: z.number().min(0).optional(),
  cardAmount: z.number().min(0).optional(),
  cashReceived: z.number().min(0).optional(),
  changeAmount: z.number().min(0).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});
```

### API Service Types (`/lib/order-service.ts`)

```typescript
export interface OrderFilters {
  status?: "completed" | "canceled" | "modified";
  paymentMethod?: "cash" | "card" | "mixed" | "delivery";
  customerName?: string;
  orderNumber?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  dailySerial?: string;
  customerName: string | null;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "cash" | "card" | "mixed" | "delivery";
  deliveryPlatform?: "keeta" | "hunger_station" | "jahez";
  status: "completed" | "canceled" | "modified";
  discountType?: "percentage" | "amount";
  discountValue?: number;
  discountAmount?: number;
  eventDiscountName?: string;
  eventDiscountPercentage?: number;
  eventDiscountAmount?: number;
  cashAmount?: number;
  cardAmount?: number;
  cashReceived?: number;
  changeAmount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ApiOrderResponse extends ApiOrder {
  cashierName?: string;
}
```

## 🎣 React Query Hooks (`hooks/use-orders.ts`)

### Available Hooks

```typescript
// Main data fetching hooks
export function useOrders(
  filters: OrderFilters = {},
  page: number = 1,
  limit: number = 10
): UseQueryResult<OrdersListResult>;

export function useOrderById(
  id: string
): UseQueryResult<Order & { cashierName?: string }>;

export function useOrderHistory(id: string): UseQueryResult<OrderHistoryResult>;

// CRUD operation hooks
export function useCreateOrder(): UseMutationResult<
  Order,
  Error,
  CreateOrderData
>;

export function useUpdateOrder(): UseMutationResult<
  Order,
  Error,
  {
    id: string;
    updateData: Partial<Order>;
  }
>;

export function useDeleteOrder(): UseMutationResult<void, Error, string>;

// Order management hooks
export function useCancelOrder(): UseMutationResult<
  CanceledOrder,
  Error,
  {
    id: string;
    canceledBy: string;
    reason?: string;
  }
>;

export function useModifyOrder(): UseMutationResult<
  ModifiedOrder,
  Error,
  {
    id: string;
    modifiedBy: string;
    modificationType: ModificationType;
    customerName?: string;
    items?: OrderItem[];
    totalAmount?: number;
    paymentMethod?: PaymentMethod;
    reason?: string;
  }
>;

export function useCanceledOrders(): UseQueryResult<CanceledOrder[]>;

export function useModifiedOrders(): UseQueryResult<ModifiedOrder[]>;
```

### Query Key Structure

```typescript
export const ordersQueryKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersQueryKeys.all, "list"] as const,
  list: (filters: OrderFilters, page: number, limit: number) =>
    [...ordersQueryKeys.lists(), { filters, page, limit }] as const,
  details: () => [...ordersQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...ordersQueryKeys.details(), id] as const,
  history: (id: string) => [...ordersQueryKeys.all, "history", id] as const,
  canceled: () => [...ordersQueryKeys.all, "canceled"] as const,
  modified: () => [...ordersQueryKeys.all, "modified"] as const,
};
```

### Key Features

- **Automatic Invalidation**: All mutations automatically invalidate related queries
- **Optimistic Updates**: UI updates immediately, rolls back on error
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Smart Caching**: Efficient cache management with proper query keys

## 🏪 Context Provider (`contexts/orders-context.tsx`)

### State Interface

```typescript
interface OrdersContextState {
  // Search and filtering
  filters: {
    searchTerm: string;
    activeFilters: Set<string>;
    dateFrom: Date | null;
    dateTo: Date | null;
  };

  // UI state
  expandedOrders: Set<string>;
  editingOrder: ApiOrderResponse | null;
  isEditDialogOpen: boolean;

  // Print management
  printingOrderId: string | null;
  printOrderData: Order | null;
}
```

### Context Actions

```typescript
interface OrdersContextActions {
  // Filter management
  handleSearch: (term: string) => void;
  toggleFilter: (filterType: string) => void;
  clearAllFilters: () => void;
  setDateRange: (from: Date | null, to: Date | null) => void;

  // UI interactions
  toggleOrderExpansion: (orderId: string) => void;
  handleEditOrder: (order: ApiOrderResponse) => void;
  handleCloseEdit: (open?: boolean) => void;

  // Print functionality
  handlePrintOrder: (orderId: string) => void;
  handleClosePrint: () => void;

  // Styling helpers
  getStatusBadgeVariant: (status: string) => BadgeVariant;
  getStatusBadgeClassName: (status: string) => string;
}
```

### Key Features

- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Filter Management**: Add/remove filters with visual feedback
- **UI State**: Track expanded cards, dialogs, and print states
- **Badge Styling**: Dynamic styling based on order status

## 🧩 UI Components

### OrdersHeader Component (`components/orders-header.tsx`)

**Features:**

- Debounced search input with clear button
- Filter buttons for order status (completed, canceled, modified)
- Payment method filters (cash, card, mixed, delivery)
- Date range picker with time selection
- Clear all filters functionality
- Responsive design for mobile/desktop

**Key Elements:**

```typescript
// Search input with icon and clear button
<div className="relative w-full max-w-md">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Search by order number or customer..."
    value={filters.searchTerm}
    onChange={(e) => handleSearch(e.target.value)}
    className="pl-10 pr-10"
  />
  {filters.searchTerm && (
    <Button
      variant="ghost"
      size="sm"
      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
      onClick={() => handleSearch("")}
    >
      <X className="h-4 w-4" />
    </Button>
  )}
</div>

// Status filter buttons
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="min-w-[140px] justify-between">
      <Filter className="mr-2 h-4 w-4" />
      Status {statusFilterCount > 0 && `(${statusFilterCount})`}
      <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    {statusOptions.map((option) => (
      <DropdownMenuCheckboxItem
        key={option.value}
        checked={filters.activeFilters.has(option.value)}
        onCheckedChange={() => toggleFilter(option.value)}
      >
        {option.label}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>

// Date range picker
<div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full">
  <div className="flex gap-2 flex-1">
    <DateTimePicker
      date={filters.dateFrom}
      setDate={(date) => setDateRange(date, filters.dateTo)}
      placeholder="From date"
      className="flex-1"
    />
    <DateTimePicker
      date={filters.dateFrom}
      setDate={(time) => setTimeFrom(time)}
      placeholder="Time"
      timeOnly
      className="w-[110px]"
    />
  </div>
</div>
```

### OrdersList Component (`components/orders-list.tsx`)

**Features:**

- **Responsive Grid Layout**: 1-4 columns based on screen size
- **Order Cards**: Clean card design with order details
- **Status Management**: Color-coded status badges
- **Payment Display**: Icons and colors for payment methods
- **Item Management**: Expandable item lists with modifiers
- **Actions**: Edit and print functionality
- **Loading States**: Skeleton loading animations
- **Empty States**: Different messages for no data vs filtered results
- **Pagination**: Integrated pagination component

**Card Structure:**

```typescript
<Card className="group hover:shadow-lg transition-all duration-300">
  <CardHeader className="pb-4">
    <div className="flex items-start justify-between">
      <div className="flex flex-col items-start gap-2">
        {/* Order number display */}
        {order.dailySerial ? (
          <>
            <CardTitle className="text-lg font-semibold">
              Daily: {order.dailySerial}
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              #{order.orderNumber}
            </span>
          </>
        ) : (
          <CardTitle className="text-lg font-semibold">
            #{order.orderNumber}
          </CardTitle>
        )}

        {/* Status badge */}
        <Badge
          variant={getStatusBadgeVariant(order.status)}
          className={getStatusBadgeClassName(order.status)}
        >
          {getOrderStatusText(order.status)}
        </Badge>
      </div>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {order.status === "completed" && (
            <DropdownMenuItem onClick={() => handleEditOrder(order)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handlePrintOrder(order.id)}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Total amount */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Total</span>
      <span className="text-lg font-bold flex items-center gap-1">
        <SaudiRiyalSymbol size={16} />
        <span className="text-green-600">{order.totalAmount.toFixed(2)}</span>
      </span>
    </div>

    {/* Order details (date, time, customer, cashier, payment) */}

    {/* Items list with expand/collapse */}
    {order.items && order.items.length > 0 && (
      <div className="pt-2 border-t">
        <div className="space-y-1">
          {(expandedOrders.has(order.id)
            ? order.items
            : order.items.slice(0, 2)
          ).map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate flex-1">
                  {item.name}
                </span>
                <span className="text-muted-foreground ml-2">
                  {item.quantity}x
                </span>
              </div>

              {/* Modifiers display */}
              {item.details?.modifiers && (
                <div className="space-y-0.5">
                  {item.details.modifiers.map((modifier, modIndex) => (
                    <div
                      key={modIndex}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground italic">
                        {modifier.type === "extra" ? "+ " : "- "}
                        {modifier.name}
                      </span>
                      {modifier.type === "extra" && modifier.price > 0 && (
                        <span className="text-muted-foreground text-xs flex items-center gap-0.5">
                          +<SaudiRiyalSymbol size={10} />
                          {modifier.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Show more/less button */}
          {order.items.length > 2 && (
            <button
              onClick={() => toggleOrderExpansion(order.id)}
              className="text-blue-600 hover:text-blue-800 text-xs hover:underline"
            >
              {expandedOrders.has(order.id)
                ? "Show less"
                : `+${order.items.length - 2} more`}
            </button>
          )}
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

## 🗄️ Database Service (`/lib/supabase-queries/order-client-service.ts`)

### Core Service Functions

```typescript
export const orderClientService = {
  // Get orders with filtering and pagination
  async getOrders(
    filters: OrderFilters = {},
    page = 1,
    limit = 10
  ): Promise<OrdersListResult> {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.paymentMethod) query = query.eq('payment_method', filters.paymentMethod);
    if (filters.customerName) query = query.ilike('customer_name', `%${filters.customerName}%`);
    if (filters.orderNumber) query = query.ilike('order_number', `%${filters.orderNumber}%`);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    return {
      orders: (data || []).map(transformSupabaseToOrder),
      total: count || 0,
      page,
      limit,
    };
  },

  // Create new order
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const orderNumber = await generateOrderNumber();
    const { data: dailySerialData } = await supabase.rpc('get_next_daily_serial');
    const dailySerial = dailySerialData?.[0];

    const orderItems = transformCartItemsToOrderItems(orderData.items);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        daily_serial: dailySerial?.serial || null,
        serial_date: dailySerial?.serial_date || null,
        customer_name: orderData.customerName || null,
        items: orderItems,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        delivery_platform: orderData.deliveryPlatform || null,
        discount_type: orderData.discountType || null,
        discount_value: orderData.discountValue || null,
        discount_amount: orderData.discountAmount || 0,
        event_discount_name: orderData.eventDiscountName || null,
        event_discount_percentage: orderData.eventDiscountPercentage || null,
        event_discount_amount: orderData.eventDiscountAmount || 0,
        created_by: orderData.createdBy,
        cash_amount: orderData.cashAmount || null,
        card_amount: orderData.cardAmount || null,
        cash_received: orderData.cashReceived || null,
        change_amount: orderData.changeAmount || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);
    return transformSupabaseToOrder(data);
  },

  // Other CRUD operations...
  async getOrderById(id: string): Promise<Order & { cashierName?: string }>,
  async updateOrder(id: string, updateData: Partial<Order>): Promise<Order>,
  async deleteOrder(id: string): Promise<void>,
  async cancelOrder(id: string, canceledBy: string, reason?: string): Promise<CanceledOrder>,
  async modifyOrder(id: string, modificationData: ModifyOrderData): Promise<ModifiedOrder>,
  async getOrderHistory(id: string): Promise<OrderHistoryResult>,
  async getCanceledOrders(): Promise<CanceledOrder[]>,
  async getModifiedOrders(): Promise<ModifiedOrder[]>,
};
```

### Helper Functions

```typescript
// Auto-generate order numbers
const generateOrderNumber = async (): Promise<string> => {
  const { data, error } = await supabase
    .from("orders")
    .select("order_number")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return "ORD-0001";
  }

  const lastOrderNumber = data[0].order_number as string;
  const match = lastOrderNumber.match(/ORD-(\d+)/);

  if (!match) return "ORD-0001";

  const lastNumber = parseInt(match[1], 10);
  const nextNumber = lastNumber + 1;

  return `ORD-${nextNumber.toString().padStart(4, "0")}`;
};

// Transform cart items to order items
const transformCartItemsToOrderItems = (cartItems: CartItem[]): OrderItem[] => {
  return cartItems.map((item) => ({
    id: item.id,
    type: mapCategoryToType(item.category),
    name: item.name,
    nameAr: item.nameAr || item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    totalPrice: item.quantity * item.price + (item.modifiersTotal || 0),
    details: {
      modifiers: item.modifiers || [],
      description: item.description,
      image: item.image,
    },
  }));
};

// Transform Supabase data to Order type
const transformSupabaseToOrder = (row: any): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  dailySerial: row.daily_serial,
  serialDate: row.serial_date,
  customerName: row.customer_name,
  items: row.items || [],
  totalAmount: parseFloat(row.total_amount),
  paymentMethod: row.payment_method,
  deliveryPlatform: row.delivery_platform,
  status: row.status,
  discountType: row.discount_type,
  discountValue: row.discount_value,
  discountAmount: parseFloat(row.discount_amount || 0),
  eventDiscountName: row.event_discount_name,
  eventDiscountPercentage: row.event_discount_percentage,
  eventDiscountAmount: parseFloat(row.event_discount_amount || 0),
  cashAmount: row.cash_amount ? parseFloat(row.cash_amount) : undefined,
  cardAmount: row.card_amount ? parseFloat(row.card_amount) : undefined,
  cashReceived: row.cash_received ? parseFloat(row.cash_received) : undefined,
  changeAmount: row.change_amount ? parseFloat(row.change_amount) : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  createdBy: row.created_by,
});
```

## 🔧 Utility Functions (`/lib/orders/utils.ts`)

```typescript
// Order calculations
export function calculateOrderTotal(
  items: Array<{ quantity: number; unitPrice: number }>
): number {
  return items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );
}

// Display formatting
export function formatOrderNumber(orderNumber: string): string {
  if (orderNumber.startsWith("ORD-")) {
    return orderNumber.replace("ORD-", "#");
  }
  return orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`;
}

// Validation
export function validateOrderItems(items: unknown[]): boolean {
  if (!Array.isArray(items) || items.length === 0) return false;

  return items.every((item) => {
    if (typeof item !== "object" || item === null) return false;

    const orderItem = item as Record<string, unknown>;
    return (
      typeof orderItem.id === "string" &&
      typeof orderItem.name === "string" &&
      typeof orderItem.quantity === "number" &&
      typeof orderItem.unitPrice === "number" &&
      orderItem.quantity > 0 &&
      orderItem.unitPrice >= 0
    );
  });
}

// Status helpers
export function getOrderStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "green";
    case "canceled":
      return "red";
    case "modified":
      return "orange";
    default:
      return "gray";
  }
}

export function getOrderStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "canceled":
      return "Canceled";
    case "modified":
      return "Modified";
    default:
      return "Unknown";
  }
}
```

## 📊 Database Schema Requirements

### Main Tables

```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR UNIQUE NOT NULL,
  daily_serial VARCHAR,
  serial_date DATE,
  customer_name VARCHAR,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method order_payment_method NOT NULL,
  delivery_platform order_delivery_platform,
  status order_status NOT NULL DEFAULT 'completed',
  discount_type discount_type,
  discount_value DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  event_discount_name VARCHAR,
  event_discount_percentage DECIMAL(5,2),
  event_discount_amount DECIMAL(10,2) DEFAULT 0,
  cash_amount DECIMAL(10,2),
  card_amount DECIMAL(10,2),
  cash_received DECIMAL(10,2),
  change_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) NOT NULL
);

-- Canceled orders table
CREATE TABLE canceled_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_order_id UUID REFERENCES orders(id) NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  canceled_by UUID REFERENCES users(id) NOT NULL,
  reason TEXT,
  order_data JSONB NOT NULL
);

-- Modified orders table
CREATE TABLE modified_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_order_id UUID REFERENCES orders(id) NOT NULL,
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by UUID REFERENCES users(id) NOT NULL,
  modification_type modification_type NOT NULL,
  original_data JSONB NOT NULL,
  new_data JSONB NOT NULL
);
```

### Enums

```sql
CREATE TYPE order_status AS ENUM ('completed', 'canceled', 'modified');
CREATE TYPE order_payment_method AS ENUM ('cash', 'card', 'mixed', 'delivery');
CREATE TYPE order_delivery_platform AS ENUM ('keeta', 'hunger_station', 'jahez');
CREATE TYPE discount_type AS ENUM ('percentage', 'amount');
CREATE TYPE modification_type AS ENUM (
  'item_added',
  'item_removed',
  'quantity_changed',
  'item_replaced',
  'multiple_changes'
);
```

### Database Functions

```sql
-- Function to generate daily serial numbers
CREATE OR REPLACE FUNCTION get_next_daily_serial()
RETURNS TABLE(serial VARCHAR, serial_date DATE) AS $$
DECLARE
  today DATE := CURRENT_DATE;
  order_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO order_count
  FROM orders
  WHERE DATE(created_at) = today;

  RETURN QUERY SELECT
    LPAD((order_count + 1)::TEXT, 3, '0') AS serial,
    today AS serial_date;
END;
$$ LANGUAGE plpgsql;
```

## ⚙️ Setup & Configuration

### 1. Install Dependencies

```bash
npm install @tanstack/react-query @supabase/supabase-js drizzle-orm zod zustand lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
```

### 2. Configure React Query

```typescript
// lib/react-query.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 3. Setup Context Provider

```typescript
// app/layout.tsx or similar
import { OrdersContextProvider } from "@/modules/orders-feature";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <OrdersContextProvider>{children}</OrdersContextProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### 4. Usage Example

```typescript
// pages/orders.tsx
import { OrdersList, OrdersHeader } from "@/modules/orders-feature";

export default function OrdersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <OrdersHeader />
      <OrdersList />
    </div>
  );
}
```

## 🔄 Integration Points

### With Cart System

- Convert `CartItem[]` to `OrderItem[]` during order creation
- Handle modifiers and special pricing
- Payment method selection integration

### With User Management

- Track order creators (`created_by` field)
- Display cashier names in order details
- Permission-based edit restrictions

### With Print System

- Generate receipt data from orders
- Handle different order statuses in receipts
- Print dialog management

### With Authentication

- Secure API endpoints
- User role validation
- Session management for order operations

## 📝 Implementation Checklist

### Backend Setup

- [ ] Create database tables and enums
- [ ] Implement database functions (daily serial generation)
- [ ] Set up Supabase client and configuration
- [ ] Create order client service with all CRUD operations

### Frontend Components

- [ ] Implement OrdersContext with state management
- [ ] Create OrdersHeader with search and filters
- [ ] Build OrdersList with responsive cards
- [ ] Set up React Query hooks with proper error handling
- [ ] Add loading states and error boundaries

### UI Integration

- [ ] Install and configure required UI libraries
- [ ] Create or import necessary UI components
- [ ] Implement responsive design patterns
- [ ] Add proper TypeScript types throughout

### Testing & Validation

- [ ] Test all CRUD operations
- [ ] Validate filter combinations
- [ ] Test pagination functionality
- [ ] Verify mobile responsiveness
- [ ] Test error scenarios and edge cases

This comprehensive implementation provides a complete, production-ready orders management system with modern React patterns, TypeScript safety, and excellent user experience.
