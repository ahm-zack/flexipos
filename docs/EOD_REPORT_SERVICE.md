# EOD (End of Day) Report Service Documentation

## Overview

The EOD Report Service provides comprehensive End-of-Day reporting functionality for the POS dashboard. It generates detailed business metrics and financial reports for any specified date range.

## Features

- ✅ **Core Metrics**: Total orders, cash/card totals, VAT calculations, cancellation rates
- ✅ **Payment Analysis**: Breakdown by payment method with percentages
- ✅ **Best Sellers**: Top 10 best-selling items with quantities and revenue
- ✅ **Hourly Sales**: Sales breakdown by hour of the day
- ✅ **Peak Hours**: Identification of busiest trading hours
- ✅ **Performance Metrics**: Completion rates, average order values
- ✅ **Database Storage**: Option to save reports for historical analysis
- ✅ **Flexible Date Ranges**: Support for custom date/time ranges

## File Structure

```
lib/
├── eod-report-service.ts       # Main service implementation
├── schemas.ts                  # Zod schemas for validation
└── db/
    └── schema.ts              # Database schema definitions

app/api/admin/reports/eod/
├── route.ts                   # Generate EOD reports (GET/POST)
├── history/
│   └── route.ts              # Get report history
└── [id]/
    └── route.ts              # Get specific report by ID
```

## API Endpoints

### 1. Generate EOD Report

**GET** `/api/admin/reports/eod`

Query Parameters:

- `preset` (optional): 'today', 'yesterday', 'last-7-days' (default: 'today')
- `save` (optional): 'true' to save report to database (default: false)

**POST** `/api/admin/reports/eod`

Request Body:

```json
{
  "startDateTime": "2024-01-01T00:00:00Z",
  "endDateTime": "2024-01-01T23:59:59Z",
  "saveToDatabase": true,
  "includePreviousPeriodComparison": false
}
```

### 2. Get Report History

**GET** `/api/admin/reports/eod/history`

Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `startDate` (optional): Filter by date range (YYYY-MM-DD)
- `endDate` (optional): Filter by date range (YYYY-MM-DD)

### 3. Get Specific Report

**GET** `/api/admin/reports/eod/{id}`

Parameters:

- `id`: UUID of the report

## Service Functions

### Core Functions

#### `generateEODReport(request: EODReportRequest): Promise<EODReportData>`

Generates a comprehensive EOD report for the specified date range.

#### `saveEODReportToDatabase(reportData: EODReportData, generatedBy: string): Promise<string>`

Saves a generated report to the database and returns the report ID.

#### `getEODReportsHistory(page?, limit?, startDate?, endDate?)`

Retrieves paginated list of saved EOD reports.

#### `getEODReportById(reportId: string)`

Retrieves a specific EOD report by its ID.

### Helper Functions

#### `calculateTotalRevenue(orders: OrderWithDetails[]): number`

Calculates total revenue from a list of orders.

#### `calculateVATBreakdown(totalRevenue: number)`

Calculates VAT breakdown (with VAT, without VAT, VAT amount).

#### `calculatePaymentBreakdown(orders: OrderWithDetails[]): PaymentBreakdown[]`

Analyzes payment methods with counts, totals, and percentages.

#### `calculateBestSellingItems(orders: OrderWithDetails[]): BestSellingItem[]`

Identifies top 10 best-selling items with detailed metrics.

#### `calculateHourlySales(orders: OrderWithDetails[]): HourlySales[]`

Breaks down sales by hour of the day (0-23).

#### `findPeakHour(hourlySales: HourlySales[]): string | undefined`

Identifies the busiest hour of the day.

### Utility Functions

#### `getReportPresets()`

Returns pre-configured date ranges for common reporting periods.

#### `validateEODReportRequest(request: unknown): EODReportRequest`

Validates and parses EOD report requests using Zod schemas.

#### `formatCurrency(amount: number): string`

Formats currency values in SAR (Saudi Riyal).

#### `formatPercentage(value: number): string`

Formats percentage values with 2 decimal places.

## Data Types

### EODReportRequest

```typescript
{
  startDateTime: string; // ISO datetime string
  endDateTime: string; // ISO datetime string
  saveToDatabase: boolean; // Whether to save to DB
  includePreviousPeriodComparison: boolean; // Future feature
}
```

### EODReportData

```typescript
{
  // Time period
  startDateTime: Date;
  endDateTime: Date;
  reportGeneratedAt: Date;

  // Core metrics
  totalCashOrders: number;
  totalCardOrders: number;
  totalWithVat: number;
  totalWithoutVat: number;
  totalCancelledOrders: number;
  totalOrders: number;

  // Additional metrics
  completedOrders: number;
  pendingOrders: number;
  vatAmount: number;
  averageOrderValue: number;

  // Advanced analytics
  paymentBreakdown: PaymentBreakdown[];
  bestSellingItems: BestSellingItem[];
  peakHour?: string;
  hourlySales: HourlySales[];
  orderCompletionRate: number;
  orderCancellationRate: number;
}
```

## Constants

- **VAT_RATE**: 15% (0.15) - Saudi Arabia VAT rate
- **Best Sellers Limit**: Top 10 items
- **Hourly Sales**: 24-hour format (0-23)

## Error Handling

The service includes comprehensive error handling:

- Request validation using Zod schemas
- Database connection error handling
- Invalid date range validation
- User existence validation for report generation
- Type-safe error responses

## Usage Examples

### Generate Today's Report

```typescript
import { generateEODReport } from "@/lib/eod-report-service";

const report = await generateEODReport({
  startDateTime: new Date().toISOString(),
  endDateTime: new Date().toISOString(),
  saveToDatabase: true,
  includePreviousPeriodComparison: false,
});
```

### Get Report History

```typescript
import { getEODReportsHistory } from "@/lib/eod-report-service";

const history = await getEODReportsHistory(1, 10);
console.log(history.reports);
console.log(history.pagination);
```

### Using API Endpoints

```javascript
// Generate today's report
const response = await fetch("/api/admin/reports/eod?preset=today&save=true");
const data = await response.json();

// Get report history
const history = await fetch("/api/admin/reports/eod/history?page=1&limit=10");
const reports = await history.json();
```

## Database Schema

The EOD reports are stored in the `eod_reports` table with the following key fields:

- Basic report metadata (dates, type, generated by)
- Financial metrics (revenue, VAT, payment totals)
- Order statistics (counts, rates, averages)
- JSON fields for complex data (payment breakdown, best sellers, hourly sales)

## Security

- All endpoints should be protected with appropriate authentication
- User validation is performed before saving reports
- RLS (Row Level Security) policies are implemented in the database
- Input validation using Zod schemas prevents injection attacks

## Performance Considerations

- Database queries are optimized with proper indexes
- Large result sets are paginated
- Complex calculations are performed in memory for better performance
- JSON fields are used for non-relational data to maintain flexibility

## Future Enhancements

- Previous period comparison functionality
- Export to PDF/Excel formats
- Real-time report generation
- Scheduled report generation
- Email report distribution
- Advanced filtering and search capabilities
- Dashboard visualization integration

## Testing

The service can be tested using:

1. API endpoints with different date ranges
2. Direct function calls for unit testing
3. Database integration tests
4. Build verification (TypeScript compilation)

---

This service provides a robust foundation for EOD reporting with room for future enhancements and customization based on business requirements.
