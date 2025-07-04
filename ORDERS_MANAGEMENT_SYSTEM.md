# Orders Management System - Feature Specification

## Overview

This document outlines the complete orders management system for the POS dashboard application. The system handles order creation, modification, and cancellation with proper database tracking.

## System Flow

### 1. Order Creation Process

- **Actor**: Cashier
- **Action**: Add items to cart and submit order
- **Database**: Save order to `orders` table
- **Requirements**:
  - Cart functionality for adding/removing items
  - Order submission form
  - Order data persistence in database

### 2. Orders Display & Management

- **Page**: Orders page (`/orders`)
- **Functionality**: Display all orders with management options
- **UI Components**:
  - Orders list/table showing order details
  - Two action buttons per order:
    - **Cancel Button**: Cancel entire order
    - **Edit Button**: Modify order items

### 3. Order Cancellation Flow

- **Trigger**: Cashier clicks "Cancel" button
- **Process**:
  - Save complete order details to `canceled_orders` table
  - Include reference ID to original order
  - Mark original order as canceled (status update)
- **Database Schema**:
  ```sql
  canceled_orders:
  - id (primary key)
  - original_order_id (foreign key to orders table)
  - canceled_at (timestamp)
  - canceled_by (user who canceled)
  - reason (optional cancellation reason)
  - order_data (JSON of original order details)
  ```

### 4. Order Modification Flow

- **Trigger**: Cashier clicks "Edit" button
- **Process**:
  - Open dialog with current order items
  - Allow modification of quantities/items
  - Save changes to `modified_orders` table
  - Update original order with new details
- **Database Schema**:
  ```sql
  modified_orders:
  - id (primary key)
  - original_order_id (foreign key to orders table)
  - modified_at (timestamp)
  - modified_by (user who modified)
  - original_data (JSON of original order)
  - new_data (JSON of modified order)
  - modification_type (e.g., 'item_removed', 'quantity_changed')
  ```

## Database Tables Structure

### Core Tables

#### 1. `orders` table

```sql
- id (primary key)
- order_number (unique identifier) it should be serilized
- customer_name (optional)
- customer_phone (optional)
- customer_address (optional)
- items (JSON array of order items)
- total_amount (decimal)
- status (enum: 'pending', 'completed', 'canceled', 'modified')
- created_at (timestamp)
- created_by (cashier user ID)
- updated_at (timestamp)
```

#### 2. `canceled_orders` table

```sql
- id (primary key)
- original_order_id (foreign key)
- canceled_at (timestamp)
- canceled_by (user ID)
- reason (text, optional)
- order_data (JSON of original order)
```

#### 3. `modified_orders` table

```sql
- id (primary key)
- original_order_id (foreign key)
- modified_at (timestamp)
- modified_by (user ID)
- original_data (JSON)
- new_data (JSON)
- modification_type (text)
```

## User Interface Requirements

### 1. Cart Component

- Add/remove items functionality
- Quantity adjustment
- Total calculation
- Submit order button

### 2. Orders Page

- **Layout**: Table/grid view of all orders
- **Columns**: Order ID, Customer, Items, Total, Status, Actions
- **Filters**: By status, date range, cashier
- **Actions**: Cancel and Edit buttons per order

### 3. Edit Order Modal

- **Display**: Current order items with quantities
- **Functionality**:
  - Modify quantities
  - Remove items
  - Add new items (optional)
  - Save changes button
  - Cancel button

### 4. Order Status Indicators

- **Visual indicators** for different order statuses
- **Color coding**:
  - Pending: Blue
  - Completed: Green
  - Canceled: Red
  - Modified: Orange

## Technical Implementation Plan

### Phase 1: Database Setup

1. Create/update database schema
2. Set up migrations for new tables
3. Define relationships between tables

### Phase 2: Backend API

1. Order creation endpoint
2. Orders listing endpoint
3. Order cancellation endpoint
4. Order modification endpoint
5. Order status update endpoint

### Phase 3: Frontend Components

1. Enhanced cart component
2. Orders page with data fetching
3. Order action buttons
4. Edit order modal
5. Order status components

### Phase 4: Integration & Testing

1. Connect frontend to backend APIs
2. Test all flows end-to-end
3. Error handling and validation
4. User feedback mechanisms

## Success Criteria

- [ ] Cashier can add items to cart and submit orders
- [ ] Orders are saved correctly to database
- [ ] Orders page displays all orders with proper formatting
- [ ] Cancel functionality works and saves to canceled_orders
- [ ] Edit functionality opens modal and saves modifications
- [ ] Order status updates reflect current state
- [ ] All database relationships are properly maintained
- [ ] System handles errors gracefully

## Notes

- Ensure proper user authentication and authorization
- Implement proper error handling for all operations
- Consider adding audit trail for all order modifications
- Plan for potential rollback scenarios
- Consider adding order history view for customers
