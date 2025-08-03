# Customer Feature Implementation Plan

## Overview

Implement a comprehensive customer management system that tracks customer information, purchase history, and enables loyalty features for your POS dashboard.

## 1. Database Schema Updates

### A. Customers Table

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  phone VARCHAR,
  address TEXT,
  email VARCHAR,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
```

### B. Update Orders Table

```sql
-- Add customer_id to orders table
ALTER TABLE orders ADD COLUMN customer_id UUID REFERENCES customers(id);
-- Keep customer_name for backward compatibility and quick access
-- customer_name, customer_number, customer_address can stay for denormalized data
```

## 2. Implementation Steps

### Phase 1: Database & Schema Setup

- [ ] Create customers table with Drizzle ORM
- [ ] Update orders table to include customer_id foreign key
- [ ] Create Zod schemas for customer validation
- [ ] Generate database migration

### Phase 2: Backend Services

- [ ] Create customer service functions (CRUD operations)
- [ ] Implement customer lookup by phone/name
- [ ] Create customer aggregation logic (total spent, visit count)
- [ ] Update order creation to handle customer data

### Phase 3: Frontend Components

- [ ] Customer search/selection component
- [ ] Customer creation form
- [ ] Customer profile/details view
- [ ] Integration with cart/checkout flow

### Phase 4: Integration & Testing

- [ ] Integrate customer selection in order flow
- [ ] Test customer data aggregation
- [ ] Add customer management in admin panel

## 3. Technical Recommendations

### A. Customer Identification Strategy

```typescript
// Recommend using phone number as primary identifier
// Name as secondary (handles typos, variations)
interface CustomerLookup {
  phone?: string;
  name?: string;
  email?: string;
}
```

### B. Drizzle Schema Example

```typescript
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  email: text("email"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default(
    "0.00"
  ),
  visitCount: integer("visit_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### C. Service Layer Functions

```typescript
// Core customer service functions needed:
interface CustomerService {
  findOrCreateCustomer(data: CustomerData): Promise<Customer>;
  updateCustomerStats(customerId: string, orderAmount: number): Promise<void>;
  searchCustomers(query: string): Promise<Customer[]>;
  getCustomerHistory(customerId: string): Promise<Order[]>;
}
```

## 4. Order Flow Integration

### Current Flow:

1. Add items to cart
2. Enter customer info (name, address, phone)
3. Create order

### New Flow:

1. Add items to cart
2. **Search existing customers OR create new**
3. Select/confirm customer details
4. Create order with customer_id
5. **Auto-update customer stats (total_spent, visit_count)**

## 5. UI/UX Recommendations

### A. Customer Selection Component

- Search by phone number (primary)
- Search by name (secondary)
- "Create New Customer" option
- Recent customers list
- Customer details preview

### B. Admin Customer Management

- Customer list with search/filter
- Customer profile with order history
- Customer statistics (total spent, visit frequency)
- Export customer data

## 6. Future Enhancement Opportunities

### A. Loyalty Program Ready

- Points system (e.g., 1 point per $1 spent)
- Tier levels (Bronze, Silver, Gold)
- Discount eligibility tracking

### B. Marketing Features

- Customer segmentation
- Purchase behavior analysis
- Targeted promotions
- Birthday/anniversary tracking

### C. Advanced Features

- Customer preferences tracking
- Favorite items
- Delivery addresses history
- Payment method preferences

## 7. Data Privacy Considerations

- [ ] Implement customer data consent tracking
- [ ] Add data retention policies
- [ ] Secure customer PII (phone, email, address)
- [ ] GDPR compliance if applicable

## 8. Performance Considerations

- [ ] Index customer lookup fields (phone, name)
- [ ] Cache frequent customer lookups
- [ ] Optimize customer stats aggregation
- [ ] Consider pagination for customer lists

## 9. Implementation Priority

### High Priority

1. Basic customer CRUD operations
2. Customer selection in order flow
3. Automatic stats updating (total_spent, visit_count)

### Medium Priority

1. Customer search functionality
2. Customer admin management
3. Order history per customer

### Low Priority

1. Advanced analytics
2. Loyalty program features
3. Marketing segmentation

## 10. Files to Create/Modify

### New Files:

- `lib/db/schema.ts` (add customers table)
- `lib/supabase-queries/customer-service.ts`
- `modules/customer-feature/` (hooks, components, types)
- `components/customer-selection.tsx`
- `app/admin/customers/` (admin management pages)

### Modified Files:

- Order creation logic
- Cart checkout flow
- Database migrations
- Zod schemas

---

## Next Steps

1. Start with Phase 1 (Database schema)
2. Implement basic customer CRUD
3. Integrate customer selection in order flow
4. Test customer stats aggregation
5. Build admin customer management

This approach ensures scalability and prepares your system for advanced customer relationship features while maintaining backward compatibility with existing orders.
