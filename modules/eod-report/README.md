# EOD Report Module

A comprehensive End of Day reporting module built with TanStack Query for the POS Dashboard.

## Features

- 🔄 **TanStack Query Integration**: Efficient data fetching, caching, and state management
- 📊 **Comprehensive Reporting**: Revenue, orders, payments, best sellers, and performance metrics
- 🎯 **Preset Date Ranges**: Today, yesterday, last 7 days with intelligent caching
- 📈 **Analytics & Insights**: Business intelligence with trend analysis
- 💾 **Database Storage**: Optional report persistence with history tracking
- 🔧 **Utility Functions**: Formatting, export, and comparison tools
- 📱 **React Components**: Ready-to-use UI components for dashboards

## Quick Start

### Basic Usage

```typescript
import {
  useTodayEODReport,
  useEODReportFormatters,
} from "@/modules/eod-report";

function MyComponent() {
  const todayReport = useTodayEODReport();
  const formatters = useEODReportFormatters();

  if (todayReport.isLoading) return <div>Loading...</div>;
  if (todayReport.error) return <div>Error: {todayReport.error.message}</div>;

  return (
    <div>
      <h1>
        Today's Revenue:{" "}
        {formatters.formatCurrency(todayReport.data.totalWithVat)}
      </h1>
      <p>Total Orders: {todayReport.data.totalOrders}</p>
    </div>
  );
}
```

### Generate Custom Reports

```typescript
import { useGenerateEODReport } from "@/modules/eod-report";

function CustomReportGenerator() {
  const generateReport = useGenerateEODReport();

  const handleGenerate = () => {
    generateReport.mutate({
      startDateTime: "2024-01-01T00:00:00Z",
      endDateTime: "2024-01-01T23:59:59Z",
      saveToDatabase: true,
      includePreviousPeriodComparison: false,
    });
  };

  return (
    <button onClick={handleGenerate} disabled={generateReport.isPending}>
      Generate Report
    </button>
  );
}
```

### Report History

```typescript
import { useEODReportHistory } from "@/modules/eod-report";

function ReportHistory() {
  const history = useEODReportHistory({
    page: 1,
    limit: 10,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  });

  return (
    <div>
      {history.data?.reports.map((report) => (
        <div key={report.id}>
          {report.reportDate} - {report.totalOrders} orders
        </div>
      ))}
    </div>
  );
}
```

## Available Hooks

### Core Hooks

- `useTodayEODReport()` - Get today's report
- `useYesterdayEODReport()` - Get yesterday's report
- `useLast7DaysEODReport()` - Get last 7 days report
- `useEODReport(id)` - Get specific report by ID
- `useEODReportHistory(params)` - Get paginated report history
- `useGenerateEODReport()` - Generate custom reports
- `useGenerateEODReportWithPreset()` - Generate with preset ranges

### Manager Hook

- `useEODReportManager()` - Comprehensive manager with all operations

### Utility Hooks

- `useEODReportFormatters()` - Currency, percentage, date formatting
- `useEODReportAnalytics()` - Business insights and analysis
- `useEODReportSummary()` - Key metrics summary
- `useEODReportComparison()` - Compare two reports
- `useEODReportChartData()` - Chart-ready data transformation
- `useEODReportExport()` - Export to CSV/JSON

### Cache Management

- `usePrefetchEODReports()` - Prefetch common reports
- `useInvalidateEODReports()` - Invalidate cached data

## Components

### EODReportDashboard

A comprehensive dashboard component demonstrating all features:

```typescript
import { EODReportDashboard } from "@/modules/eod-report";

function MyDashboard() {
  return <EODReportDashboard />;
}
```

### SimpleEODReport

A basic report component for common use cases:

```typescript
import { SimpleEODReport } from "@/modules/eod-report";

function MyReport() {
  return <SimpleEODReport />;
}
```

## API Integration

The hooks automatically integrate with these API endpoints:

- `GET /api/admin/reports/eod` - Generate reports with presets
- `POST /api/admin/reports/eod` - Generate custom reports
- `GET /api/admin/reports/eod/history` - Get report history
- `GET /api/admin/reports/eod/[id]` - Get specific report

## Query Keys

All hooks use consistent query keys for efficient caching:

```typescript
import { eodReportKeys } from "@/modules/eod-report";

// Examples
eodReportKeys.all; // ['eodReports']
eodReportKeys.history(); // ['eodReports', 'history']
eodReportKeys.detail(id); // ['eodReports', 'detail', id]
```

## Caching Strategy

- **Today's reports**: 1 minute stale time (frequently updated)
- **Yesterday's reports**: 5 minutes stale time (stable data)
- **Weekly reports**: 3 minutes stale time (moderate updates)
- **Report history**: 2 minutes stale time (admin data)
- **Specific reports**: 5 minutes stale time (historical data)

## Error Handling

All hooks include comprehensive error handling:

```typescript
const report = useTodayEODReport();

if (report.error) {
  console.error("Report error:", report.error.message);
  // Handle specific error cases
}
```

## Performance Optimization

- **Intelligent caching** prevents unnecessary API calls
- **Selective invalidation** updates only relevant data
- **Prefetching** for common use cases
- **Background refetching** keeps data fresh
- **Optimistic updates** for better UX

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  EODReportData,
  SavedEODReport,
  EODReportRequest,
} from "@/modules/eod-report";

const handleReport = (report: EODReportData) => {
  // Fully typed report data
};
```

## Advanced Usage

### Custom Query Configuration

```typescript
const customReport = useQuery({
  queryKey: eodReportKeys.generateWithParams(params),
  queryFn: () => generateEODReport(params),
  staleTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  enabled: !!params.startDateTime,
});
```

### Combining Multiple Hooks

```typescript
function ComprehensiveReport() {
  const today = useTodayEODReport();
  const yesterday = useYesterdayEODReport();
  const comparison = useEODReportComparison(today.data, yesterday.data);
  const analytics = useEODReportAnalytics(today.data);

  // Use all data together
}
```

### Background Data Fetching

```typescript
function useBackgroundReports() {
  const { prefetchHistory, prefetchTodayReport } = usePrefetchEODReports();

  useEffect(() => {
    // Prefetch data in background
    prefetchHistory();
    prefetchTodayReport();
  }, []);
}
```

## Best Practices

1. **Use preset hooks** for common date ranges (today, yesterday, etc.)
2. **Leverage caching** by using consistent query keys
3. **Handle loading states** appropriately in UI
4. **Implement error boundaries** for graceful error handling
5. **Prefetch data** for better user experience
6. **Use utility hooks** for formatting and analysis
7. **Batch operations** when possible to reduce API calls

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `@/lib/eod-report-service` - Backend service functions
- `@/lib/schemas` - Type definitions and validation
- `@/components/ui/*` - UI components (for example components)

## Contributing

When adding new features:

1. Add new hooks to the appropriate hook file
2. Update query keys in the key factory
3. Add proper TypeScript types
4. Include error handling
5. Update the index exports
6. Add tests for new functionality
7. Update documentation

## Testing

```typescript
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTodayEODReport } from "@/modules/eod-report";

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

test("should fetch today report", () => {
  const { result } = renderHook(() => useTodayEODReport(), { wrapper });
  expect(result.current.isLoading).toBe(true);
});
```

---

This module provides a complete, production-ready solution for EOD reporting with modern React patterns and best practices.
