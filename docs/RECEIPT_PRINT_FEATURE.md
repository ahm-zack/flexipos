# Restaurant Receipt Print Feature

## Overview

The restaurant receipt print feature allows users to generate and print authentic, ZATCA-compliant receipts for orders in the POS system. The feature includes:

- **ZATCA QR Code Generation**: Compliant with Saudi tax authority requirements
- **Thermal Printer Optimization**: Styled for 58mm thermal receipt printers
- **Bilingual Support**: Arabic and English text
- **Professional Layout**: Restaurant branding, VAT calculations, and legal information
- **Print Dialog Integration**: Clean print experience with proper formatting

## Files Created/Modified

### Core Components

- `/components/restaurant-receipt.tsx` - Main receipt component with modal and print functionality
- `/hooks/use-order-receipt.ts` - React hook for fetching order data for printing
- `/lib/zatca-qr.ts` - ZATCA QR code generation utility
- `/lib/restaurant-config.ts` - Centralized restaurant configuration
- `/lib/print-utils.ts` - Print formatting utilities

### Integration Points

- `/modules/orders-feature/components/orders-list.tsx` - Print button integration

## Features

### 1. ZATCA QR Code Compliance

- Generates QR codes following Saudi ZATCA (Zakat, Tax and Customs Authority) standards
- Includes required fields: seller name, VAT number, timestamp, invoice total, VAT total
- Uses TLV (Type-Length-Value) encoding format
- Base64 encoded for QR code generation

### 2. Receipt Layout

- **Header**: Restaurant name (Arabic & English), address, phone, VAT & CR numbers
- **Order Details**: Order number, date, time, cashier, customer name, payment method
- **Items List**: Item names, quantities, prices with proper alignment
- **Totals**: Subtotal, VAT breakdown, final total
- **Footer**: ZATCA QR code, thank you message, business hours

### 3. Print Optimization

- Styled for 58mm thermal printers (standard POS receipt width)
- Monospace font for consistent character alignment
- Proper spacing and dividers using dashed lines
- Print-specific CSS with media queries
- Automatic print dialog handling

### 4. Configuration Management

The restaurant configuration is centralized in `/lib/restaurant-config.ts`:

```typescript
export const RESTAURANT_CONFIG = {
  // Restaurant Information
  name: "Golden Plate Restaurant",
  nameAr: "مطعم الطبق الذهبي",
  address: "456 King Fahd Road, Riyadh 11564, Saudi Arabia",
  addressAr: "٤٥٦ طريق الملك فهد، الرياض ١١٥٦٤، المملكة العربية السعودية",
  phone: "+966 11 456 7890",
  email: "info@goldenplate.com",
  website: "www.goldenplate.com",

  // Legal Information (ZATCA Required)
  vatNumber: "123456789012345", // 15-digit VAT registration number
  crNumber: "1010123456", // Commercial Registration number
  vatRate: 0.15, // 15% VAT rate in Saudi Arabia

  // Additional Settings
  zatcaCompliant: true,
  receiptWidth: "58mm",
  // ... other configuration options
};
```

## Usage

### For End Users

1. Navigate to the Orders list page
2. Find the order you want to print
3. Click the three-dot menu (⋮) on the order card
4. Select "Print" from the dropdown menu
5. The receipt modal will open with a preview
6. Click "🖨️ Print Receipt" to open the print dialog
7. Select your printer and print settings
8. Print the receipt

### For Developers

The print functionality is integrated into the orders list component:

```tsx
// Print button handler
const handlePrintOrder = (orderId: string) => {
  setPrintingOrderId(orderId);
};

// Receipt modal rendering
{
  printingOrderId && printOrderData && (
    <RestaurantReceipt
      order={convertedOrder}
      cashierName={printOrderData.cashierName}
      onClose={handleClosePrint}
    />
  );
}
```

## Technical Implementation

### 1. Data Flow

1. User clicks print button in orders list
2. `setPrintingOrderId()` triggers the `useOrderForReceipt()` hook
3. Hook fetches order details via API call to `/api/orders/[id]`
4. Receipt component receives order data and renders modal
5. ZATCA QR code is generated asynchronously
6. Print button opens browser print dialog with formatted receipt

### 2. Print Window Generation

The component creates a new window with:

- Proper DOCTYPE and meta tags
- Thermal printer CSS styling
- Receipt content as HTML
- Auto-close functionality after printing

### 3. Error Handling

- Graceful fallback if QR code generation fails
- Loading states during data fetching
- Proper error messages for API failures

## Configuration Instructions

### Restaurant Information

Update `/lib/restaurant-config.ts` with your restaurant's actual information:

1. **Basic Info**: Name, address, phone, email, website
2. **Arabic Info**: Arabic name and address
3. **Legal Info**: VAT registration number (15 digits) and CR number
4. **Tax Settings**: VAT rate (default 15% for Saudi Arabia)

### VAT Number Format

The VAT number must be exactly 15 digits. The system validates this format and will show warnings if invalid.

### Logo Integration (Optional)

To add a restaurant logo:

1. Place your logo image in `/public/`
2. Update `logo` field in config to point to your image
3. The receipt component will display it in the header

## Testing

### Build Test

```bash
npm run build
```

The build should complete without errors. All TypeScript and linting issues have been resolved.

### Runtime Test

1. Start the development server: `npm run dev`
2. Navigate to orders page
3. Test print functionality with existing orders
4. Verify QR code generation in browser console
5. Test print dialog and formatting

### QR Code Validation

The generated QR codes can be validated using ZATCA's official validation tools or any QR code reader. The decoded data should show the TLV-encoded invoice information.

## Production Considerations

### Before Going Live

1. **Update Restaurant Config**: Replace placeholder data with actual restaurant information
2. **Test VAT Number**: Ensure VAT number is valid and properly formatted
3. **Test Printing**: Verify compatibility with your thermal printer
4. **QR Code Testing**: Test QR codes with ZATCA validation tools
5. **Legal Review**: Ensure compliance with local regulations

### Printer Compatibility

- Designed for 58mm thermal printers (standard POS receipt width)
- Should work with most ESC/POS compatible printers
- Test with your specific printer model for best results

### Performance

- QR code generation happens asynchronously to avoid blocking UI
- Receipt modal loads quickly with order data caching
- Print dialog opens immediately without delays

## Troubleshooting

### Common Issues

1. **QR Code Not Showing**: Check browser console for generation errors
2. **Print Dialog Not Opening**: Verify popup blocker settings
3. **Formatting Issues**: Ensure thermal printer supports the CSS styling
4. **API Errors**: Check network connectivity and server status

### Debug Mode

Enable debug logging by checking the browser console for:

- QR code generation status
- API request/response data
- Print dialog events

## Future Enhancements

### Potential Improvements

1. **Email Receipts**: Add option to email receipts to customers
2. **Receipt Templates**: Multiple receipt layouts for different needs
3. **Batch Printing**: Print multiple receipts at once
4. **Custom Branding**: More customization options for restaurant branding
5. **Receipt History**: Save and reprint previous receipts
6. **Multi-language**: Support for additional languages beyond Arabic/English

### Technical Debt

- Consider using a more robust QR code library for additional features
- Implement proper error boundaries for better error handling
- Add unit tests for QR code generation and print utilities
- Consider using a receipt template engine for more flexibility

## Dependencies

### NPM Packages

- `qrcode` - QR code generation
- `crypto-js` - Cryptographic functions (if needed for advanced ZATCA features)
- `@types/qrcode` - TypeScript definitions

### Browser APIs

- `window.print()` - Print dialog
- `window.open()` - Print window creation
- `Canvas API` - QR code rendering (via qrcode library)

## Compliance Notes

### ZATCA Requirements

This implementation follows ZATCA guidelines for:

- QR code structure and encoding
- Required invoice fields
- Arabic language support
- VAT calculation and display

### Legal Disclaimer

This implementation is designed to meet Saudi ZATCA requirements as of the development date. Tax regulations may change, and it's the restaurant's responsibility to ensure ongoing compliance. Consider consulting with tax professionals for production use.
