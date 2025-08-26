# Customer Requests - August 26, 2025

## 📋 Overview

New feature requests and modifications requested by the customer to improve the POS system functionality.

---

## 🧾 1. EOD Report Enhancements

### 1.1 Show All Sold Items

- **Request**: Display all sold items in the EOD report (not just best sellers)
- **Current State**: Report shows only top 10 best-selling items
- **Required Change**: Add complete list of all items sold during the reporting period
- **Priority**: High

### 1.2 A4 PDF Download

- **Request**: Add button to download EOD report as A4 PDF
- **Format**: Standard A4 page size
- **Content**: Complete EOD report with all sections
- **Priority**: High

### 1.3 Thermal Printer PDF Download

- **Request**: Add button to download EOD report optimized for 80mm thermal printer
- **Format**: 80mm width thermal receipt format
- **File Naming Convention**: `receipt-EOD-(timestamp)`
- **Example**: `receipt-EOD-20250826-143025.pdf`
- **Priority**: High

---

## 🧾 2. Orders - Print Invoice Enhancement

### 2.1 Order Receipt File Naming

- **Request**: Standardize downloaded receipt file naming
- **Current State**: Generic receipt naming
- **Required Format**: `receipt-ORD-{orderNumber}`
- **Example**: `receipt-ORD-0001.pdf`
- **Scope**: Apply to print invoice button in orders list
- **Priority**: Medium

---

## 🍕 3. Pizza Feature Modifications

### 3.1 Remove Pizza Type Field

- **Request**: Hide or remove pizza type selection
- **Current State**: Pizza type dropdown is visible in pizza management
- **Required Change**: Remove pizza type field from:
  - Pizza creation form
  - Pizza edit form
  - Pizza display cards
- **Priority**: Medium

### 3.2 Bilingual Pizza Names

- **Request**: Display both Arabic and English names on pizza cards
- **Current State**: Cards show only one language
- **Required Format**:
  ```
  Pizza Name (English)
  اسم البيتزا (العربية)
  ```
- **Scope**: All pizza cards in management and cashier views
- **Priority**: Medium

---

## 💰 4. VAT Removal (Temporary) ✅

### 4.1 Hide VAT Across Application ✅

- **Request**: Remove VAT calculations and displays throughout the app
- **Reason**: Customer not yet registered for VAT
- **Scope**: Remove VAT from:
  - ✅ Order totals and calculations
  - ✅ Receipt displays
  - ✅ EOD reports
  - ✅ Price calculations
  - ✅ Invoice formatting
- **Implementation**: Hide VAT elements (don't delete code for future re-enabling)
- **Priority**: High
- **Status**: ✅ COMPLETED

### 4.2 VAT Removal Areas ✅

- ✅ **Cart Panel**: Remove VAT line from totals
- ✅ **Receipts**: Remove VAT breakdown section
- ✅ **EOD Reports**: Remove VAT amounts and calculations
- ✅ **Order Details**: Remove VAT from order summaries
- ✅ **Invoices**: Remove VAT sections from printed invoices

### 4.3 Implementation Details ✅

- ✅ Created `/lib/vat-config.ts` with VAT configuration flag
- ✅ Updated cart panels to hide VAT line
- ✅ Updated receipt component to conditionally show VAT breakdown
- ✅ Updated EOD report dashboard and historical reports
- ✅ Updated PDF generators to handle VAT hiding
- ✅ Updated ZATCA QR code generation for VAT-free receipts
- ✅ Preserved all VAT code for future re-enabling

---

## 📅 Implementation Priority

### High Priority (Immediate)

1. ✅ EOD Report - Show all sold items
2. ✅ EOD Report - A4 PDF download
3. ✅ EOD Report - Thermal PDF download
4. ✅ VAT removal across application

### Medium Priority (Next Sprint)

1. ✅ Orders - Receipt file naming
2. ✅ Pizza - Remove type field
3. ✅ Pizza - Bilingual names

---

## 🔧 Technical Notes

### EOD Report Changes

- Modify EOD service to include all items, not just top 10
- Add PDF generation with different formats (A4 vs thermal)
- Implement proper file naming with timestamps

### VAT Removal Strategy

- Use conditional rendering to hide VAT elements
- Modify calculation functions to exclude VAT
- Preserve VAT code structure for future re-implementation

### Pizza Management

- Update schemas to make pizza type optional
- Modify UI components to hide type selection
- Enhance card layouts for bilingual display

---

## ✅ Acceptance Criteria

### EOD Report

- [x] All sold items appear in report (quantity > 0)
- [x] A4 PDF download button functional
- [x] Thermal PDF download with correct naming
- [x] Both PDF formats properly formatted

### Orders

- [x] Receipt downloads use format: `receipt-ORD-{orderNumber}.pdf`

### Pizza

- [x] Pizza type field hidden/removed from forms
- [x] Pizza cards show both English and Arabic names

### VAT Removal

- [x] No VAT amounts visible in any interface
- [x] Totals calculated without VAT
- [x] Receipts and invoices VAT-free
- [x] EOD reports exclude VAT calculations
- [x] VAT configuration system implemented for future re-enabling

---

_Document created: August 26, 2025_  
_Status: Pending Implementation_
