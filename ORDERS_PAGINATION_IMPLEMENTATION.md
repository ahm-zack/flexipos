# Orders List Pagination Implementation

## Overview

The orders list now supports pagination to handle large datasets efficiently. This implementation includes a complete pagination system with navigation controls, page indicators, and proper state management.

## Features

### 1. Pagination Controls

- **Previous/Next buttons**: Navigate between pages
- **Page numbers**: Direct navigation to specific pages
- **Ellipsis**: Compact display for large page counts
- **Current page highlight**: Visual indication of active page

### 2. Smart Page Display

- Shows up to 7 page numbers at once
- Displays ellipsis (...) when there are more pages
- Always shows first and last page numbers
- Centers current page in the visible range

### 3. State Management

- **Current page state**: Tracks the active page
- **Expanded items reset**: Clears expanded order items when changing pages
- **Smooth scrolling**: Automatically scrolls to top when changing pages

### 4. Loading States

- **Pagination disabled**: During loading to prevent multiple requests
- **Loading indicators**: Shows loading status in header
- **Skeleton loading**: Maintains layout during data fetching

## Implementation Details

### Components Used

#### `Pagination` Component

- Located: `/components/ui/pagination.tsx`
- Props:
  - `currentPage`: Current active page number
  - `totalPages`: Total number of pages
  - `onPageChange`: Callback for page changes
  - `isLoading`: Loading state to disable interactions

#### `OrdersList` Component Updates

- **Page state**: Uses `useState` to track current page
- **Limit**: Set to 10 orders per page
- **Auto-scroll**: Scrolls to top when changing pages
- **Expanded state reset**: Clears expanded orders on page change

### API Integration

The pagination system leverages the existing API structure:

```typescript
// Hook usage
const { data, isLoading, error } = useOrders({}, currentPage, limit);

// API response structure
interface OrdersListResult {
  orders: ApiOrderResponse[];
  total: number;
  page: number;
  limit: number;
}
```

### Query Key Management

TanStack Query keys include pagination parameters:

```typescript
orderKeys.list(filters, page, limit);
```

This ensures proper caching and data freshness for each page.

## User Experience

### Page Information Display

- Shows current page and total pages in header
- Displays total number of orders
- Updates dynamically based on pagination state

### Navigation Features

- **Keyboard support**: Arrow keys for navigation
- **Focus management**: Proper focus handling for accessibility
- **Responsive design**: Works on all screen sizes

### Performance Optimizations

- **Efficient queries**: Only fetches 10 orders per page
- **Query caching**: TanStack Query caches pages for better performance
- **Background refetching**: Keeps data fresh without blocking UI

## Error Handling

- **Loading states**: Graceful loading indicators
- **Error boundaries**: Proper error display
- **Network resilience**: Handles failed requests gracefully

## Accessibility

- **ARIA labels**: Proper labeling for screen readers
- **Keyboard navigation**: Full keyboard support
- **Focus indicators**: Clear focus states
- **Semantic HTML**: Proper HTML structure

## Future Enhancements

Potential improvements for the pagination system:

1. **Jump to page**: Input field for direct page navigation
2. **Page size selection**: Allow users to choose items per page
3. **URL synchronization**: Update browser URL with current page
4. **Infinite scrolling**: Alternative pagination approach
5. **Page prefetching**: Pre-load adjacent pages for faster navigation

## Usage Example

```tsx
// The OrdersList component automatically handles pagination
<OrdersList />

// The component internally manages:
// - Current page state
// - Data fetching with pagination
// - Navigation controls
// - Loading states
```

The pagination system provides a robust, user-friendly way to navigate through large sets of orders while maintaining good performance and accessibility standards.
