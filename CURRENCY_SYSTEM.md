# Saudi Riyal Currency System

## Overview

The POS dashboard now features a comprehensive, theme-aware Saudi Riyal currency system that automatically adapts to your application's color scheme.

## Components

### 1. SaudiRiyalSymbol

A theme-aware SVG component that renders the official Saudi Riyal symbol.

```tsx
import { SaudiRiyalSymbol } from "@/components/currency";

<SaudiRiyalSymbol size={16} variant="primary" className="custom-styles" />;
```

**Props:**

- `size`: Number (default: 16) - Size of the symbol in pixels
- `variant`: "default" | "primary" | "muted" | "destructive" - Color variant
- `className`: String - Additional CSS classes

### 2. PriceDisplay

An advanced price display component with full customization options.

```tsx
import { PriceDisplay } from "@/components/currency";

<PriceDisplay
  price={12.99}
  symbolSize={20}
  symbolPosition="before"
  variant="primary"
  className="text-2xl font-bold"
/>;
```

**Props:**

- `price`: Number - The price to display
- `symbolSize`: Number (default: 16) - Size of the symbol
- `symbolPosition`: "before" | "after" (default: "before") - Position of symbol
- `variant`: "default" | "primary" | "muted" | "destructive" - Color variant
- `className`: String - Additional CSS classes for the container
- `symbolClassName`: String - Additional CSS classes for the symbol

### 3. formatSaudiPriceWithSymbol (Legacy)

Backwards-compatible function for existing code.

```tsx
import { formatSaudiPriceWithSymbol } from "@/components/currency";

{
  formatSaudiPriceWithSymbol(12.99, 16);
}
```

## Theme Integration

The currency system automatically adapts to your theme:

- **Light Mode**: Symbol follows text colors
- **Dark Mode**: Symbol automatically adjusts to maintain readability
- **Custom Variants**: Use predefined color variants or inherit from parent

## Usage Examples

### Menu Items

```tsx
<PriceDisplay
  price={12.99}
  symbolSize={20}
  variant="primary"
  className="text-3xl font-bold"
/>
```

### Cart Items

```tsx
<PriceDisplay
  price={item.price * item.quantity}
  symbolSize={14}
  variant="primary"
  className="font-semibold"
/>
```

### Totals

```tsx
<PriceDisplay price={total} symbolSize={16} className="font-semibold text-lg" />
```

## Implementation Details

- **SVG-based**: Uses the official Saudi Riyal symbol as inline SVG
- **Theme-aware**: Automatically adapts colors using CSS `fill-current`
- **Accessible**: Includes proper ARIA labels and role attributes
- **Responsive**: Scales properly at different sizes
- **Flexible**: Supports custom styling and positioning

## Migration Guide

If you're updating from the old system:

1. Replace `formatSaudiPriceWithSymbol` calls with `PriceDisplay` component for better control
2. Use `variant` prop instead of manually setting colors
3. Symbol now appears before the price by default (can be changed with `symbolPosition`)

## Color Variants

- `default`: Inherits current text color
- `primary`: Uses theme primary color
- `muted`: Uses muted foreground color
- `destructive`: Uses destructive color (for errors/warnings)

## Implementation Status

✅ **All Menu Pages Updated:**

- Pizza Menu - Theme-aware pricing with cart functionality
- Burger Menu - Theme-aware pricing with cart functionality
- Beverages Menu - Theme-aware pricing with cart functionality
- Appetizers Menu - Theme-aware pricing with cart functionality
- Pie Menu - Theme-aware pricing with cart functionality
- Shawerma Menu - Theme-aware pricing with cart functionality
- Side Orders Menu - Theme-aware pricing with cart functionality

✅ **Cart System:**

- Cart Panel - All prices display with theme-aware Saudi Riyal symbol
- Item prices, VAT calculation, and totals properly formatted
- Consistent symbol sizing (14-16px for cart items)

✅ **Theme Integration:**

- Symbols automatically adapt to light/dark mode
- Primary color variant used for menu item prices
- Muted variants for secondary information
