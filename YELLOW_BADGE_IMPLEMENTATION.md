# Yellow Badge for Modified Orders

## Changes Made

Updated the orders list component to display a yellow badge for modified orders instead of the default secondary badge.

### Modified Files

#### `modules/orders-feature/components/orders-list.tsx`

1. **Added new function `getStatusBadgeClassName`**:

   - Returns specific CSS classes for different order statuses
   - For "modified" orders: returns yellow background with white text
   - For other statuses: returns empty string (uses default styling)

2. **Updated Badge component**:

   - Added `cn` utility import for better className merging
   - Updated Badge to use both the variant and custom className
   - Modified orders now display with yellow background (`bg-yellow-500`) and white text

3. **CSS Classes Applied for Modified Orders**:
   - `bg-yellow-500` - Yellow background
   - `text-white` - White text for good contrast
   - `hover:bg-yellow-600` - Darker yellow on hover
   - `border-yellow-500` - Yellow border

### Code Changes

```typescript
// Added new function
const getStatusBadgeClassName = (status: string) => {
  switch (status) {
    case "modified":
      return "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500";
    default:
      return "";
  }
};

// Updated Badge component
<Badge
  variant={getStatusBadgeVariant(order.status)}
  className={cn(
    "transition-colors duration-200 group-hover:scale-105",
    getStatusBadgeClassName(order.status)
  )}
>
  {getOrderStatusText(order.status)}
</Badge>;
```

### Visual Result

- **Completed Orders**: Default gray badge
- **Canceled Orders**: Red destructive badge
- **Modified Orders**: ✨ **Yellow badge with white text** ✨
- **Other Status**: Outline badge

The yellow badge makes modified orders easily identifiable at a glance, providing better visual distinction in the orders list.

### Benefits

1. **Visual Distinction**: Modified orders stand out with bright yellow color
2. **Consistent Styling**: Maintains the existing badge system while adding custom colors
3. **Good Contrast**: Yellow background with white text ensures readability
4. **Hover Effects**: Darker yellow on hover for better interaction feedback
5. **Accessibility**: High contrast between background and text colors
