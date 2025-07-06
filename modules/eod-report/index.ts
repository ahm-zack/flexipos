// EOD Report Module
// Complete module for End of Day reporting with TanStack Query

// Export all hooks
export * from './hooks';

// Export all components
export * from './components';

// Export service functions for direct use
export {
  generateEODReport,
  saveEODReportToDatabase,
  getEODReportsHistory,
  getEODReportById,
  getReportPresets,
  validateEODReportRequest,
  formatCurrency,
  formatPercentage,
} from '@/lib/eod-report-service';

// Export types for convenience
export type {
  EODReportRequest,
  EODReportData,
  SavedEODReport,
  EODReportHistoryRequest,
  BestSellingItem,
  PaymentBreakdown,
  HourlySales,
  PaymentMethod,
  OrderStatus,
} from '@/lib/schemas';
