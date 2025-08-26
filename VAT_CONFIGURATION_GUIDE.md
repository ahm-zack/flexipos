# VAT Configuration Guide

## Overview

VAT (Value Added Tax) has been temporarily hidden across the POS dashboard application while preserving all VAT-related code for future re-enabling. This document explains how the VAT system works and how to re-enable it when needed.

## Current Status

- **VAT Display**: Hidden across all interfaces
- **VAT Calculations**: Disabled (returns 0 for VAT amounts)
- **VAT Code**: Preserved and can be easily re-enabled

## How VAT Hiding Works

### Configuration File: `/lib/vat-config.ts`

The main configuration is controlled by two flags:

```typescript
export const VAT_CONFIG = {
  showVAT: false, // Controls UI visibility
  includeVATInCalculations: false, // Controls calculation logic
  vatRate: 0.15, // 15% VAT rate (preserved)
} as const;
```

### Affected Components

1. **Cart Panels**

   - `/modules/cart/components/cart-panel.tsx`
   - `/components/cart-panel-with-customer.tsx`
   - VAT line commented out with preservation comment

2. **Receipt Components**

   - `/components/restaurant-receipt.tsx`
   - VAT breakdown conditionally hidden using `vatUtils.shouldShowVAT()`

3. **EOD Reports**

   - `/modules/eod-report/components/eod-report-dashboard.tsx`
   - `/modules/eod-report/components/historical-eod-reports.tsx`
   - VAT amounts hidden using spread operator with conditional inclusion

4. **PDF Generators**

   - `/lib/eod-pdf-generator.ts`
   - Ready to handle VAT display when re-enabled

5. **Backend Services**
   - `/lib/eod-report-service.ts`
   - Uses `calculateVATBreakdown()` function that respects configuration

## How to Re-enable VAT

### Step 1: Update Configuration

Edit `/lib/vat-config.ts`:

```typescript
export const VAT_CONFIG = {
  showVAT: true, // ✅ Enable VAT display
  includeVATInCalculations: true, // ✅ Enable VAT calculations
  vatRate: 0.15, // Keep 15% rate
} as const;
```

### Step 2: Test Components

After changing the configuration, all components will automatically:

1. **Cart Panels**: Show VAT line in totals
2. **Receipts**: Display VAT breakdown section
3. **EOD Reports**: Include VAT amounts and calculations
4. **PDF Reports**: Show VAT details
5. **ZATCA QR Codes**: Include correct VAT amounts

### Step 3: Verify Restaurant Configuration

Ensure the restaurant VAT registration details are correct in `/lib/restaurant-config.ts`:

```typescript
vatNumber: "YOUR_15_DIGIT_VAT_NUMBER",  // Must be exactly 15 digits
vatRate: 0.15,                          // 15% for Saudi Arabia
```

## VAT Utility Functions

The `/lib/vat-config.ts` file provides utility functions:

- `vatUtils.shouldShowVAT()`: Check if VAT should be displayed
- `vatUtils.calculateVATFromTotal()`: Calculate VAT amount from total
- `vatUtils.calculateTotalWithoutVAT()`: Calculate net amount
- `calculateVATBreakdown()`: Get complete VAT breakdown

## Database Considerations

The database schema still stores VAT-related fields:

- `total_with_vat`
- `total_without_vat`
- `vat_amount`

These fields are populated correctly regardless of display settings, ensuring data integrity for future VAT re-enabling.

## Testing VAT Re-enabling

1. Change `showVAT: true` in configuration
2. Test cart functionality
3. Generate a test receipt
4. Create an EOD report
5. Verify PDF downloads
6. Check ZATCA QR code generation

## Legal Compliance

When re-enabling VAT:

- Ensure VAT registration number is valid
- Test ZATCA compliance
- Verify receipt formatting meets Saudi tax authority requirements
- Update any printed materials with VAT registration details

## Files Modified for VAT Hiding

### Core Configuration

- `/lib/vat-config.ts` (NEW)

### UI Components

- `/modules/cart/components/cart-panel.tsx`
- `/components/cart-panel-with-customer.tsx`
- `/components/restaurant-receipt.tsx`
- `/modules/eod-report/components/eod-report-dashboard.tsx`
- `/modules/eod-report/components/historical-eod-reports.tsx`

### Backend Services

- `/lib/eod-report-service.ts`
- `/lib/eod-pdf-generator.ts`

### Documentation

- `/CUSTOMER_REQUESTS_2025-08-26.md` (updated with completion status)

---

**Note**: All VAT code has been preserved with clear comments indicating temporary hiding. The system is designed for easy re-enabling without code rewriting.
