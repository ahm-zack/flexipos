# Cart Module

A complete shopping cart system for the Lazaza POS dashboard with tablet and mobile-friendly UI.

## Features

### 🛒 Core Functionality

- **Add/Remove Items** - Easy item management
- **Quantity Control** - +/- buttons for quantity adjustment
- **Persistent Storage** - Cart state saved to localStorage
- **Real-time Updates** - Instant UI updates with optimistic UI
- **Tax Calculation** - Automatic tax calculation (8.5%)

### 📱 Mobile & Tablet Optimized

- **Floating Cart Badge** - Always visible cart with item count
- **Slide-out Panel** - Smooth slide animation from right
- **Touch-Friendly** - Large 44px+ tap targets
- **Responsive Design** - Adapts to all screen sizes
- **Backdrop Blur** - Modern blur effect on mobile

### 🎨 UI Components

- **CartBadge** - Floating action button with item count
- **CartPanel** - Full-featured slide-out cart
- **AddToCartButton** - Smart button with success animation
- **CartContainer** - Main wrapper component

## File Structure

```
modules/cart/
├── components/
│   ├── cart-badge.tsx          # Floating cart button
│   ├── cart-panel.tsx          # Slide-out cart panel
│   ├── cart-container.tsx      # Main cart wrapper
│   └── add-to-cart-button.tsx  # Add to cart button
├── hooks/
│   └── use-cart.tsx           # Cart context & provider
├── types/
│   └── cart.types.ts          # TypeScript types
└── index.ts                   # Module exports
```

## Usage

### 1. Add to Menu Items

```tsx
import { AddToCartButton } from "@/modules/cart";

<AddToCartButton
  item={{
    id: "unique-item-id",
    name: "Item Name",
    price: 9.99,
    category: "Category",
    description: "Item description",
  }}
  size="sm"
/>;
```

### 2. Use Cart State

```tsx
import { useCart } from "@/modules/cart";

function MyComponent() {
  const { cart, addItem, removeItem, clearCart } = useCart();

  return (
    <div>
      <p>Items: {cart.itemCount}</p>
      <p>Total: ${cart.total.toFixed(2)}</p>
    </div>
  );
}
```

### 3. Cart Provider Setup

Already integrated in `modules/providers/index.tsx`:

```tsx
<CartProvider>
  <App />
</CartProvider>
```

## Design Decisions

- **LocalStorage Persistence** - Cart survives page refreshes
- **Optimistic UI** - Instant feedback for better UX
- **Slide-out Panel** - Doesn't block content, easy to dismiss
- **Fixed Positioning** - Cart always accessible
- **Touch Targets** - 44px minimum for accessibility
- **Success Animations** - Visual feedback for actions

## Future Enhancements

- [ ] Order history
- [ ] Checkout process
- [ ] Customer information
- [ ] Payment integration
- [ ] Print receipts
- [ ] Split screen for larger tablets
