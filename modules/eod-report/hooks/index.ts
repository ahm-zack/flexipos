// Main EOD Report hooks
export {
  eodReportKeys,
  useGenerateEODReport,
  useGenerateEODReportWithPreset,
  useEODReportHistory,
  useEODReport,
  useTodayEODReport,
  useYesterdayEODReport,
  useLast7DaysEODReport,
  usePrefetchEODReports,
  useInvalidateEODReports,
  useEODReportManager,
} from './use-eod-reports';

// Utility hooks
export {
  useEODReportFormatters,
  useEODReportAnalytics,
  useEODReportComparison,
  useEODReportSummary,
  useEODReportChartData,
  useEODReportExport,
} from './use-eod-report-utils';

// Re-export types for convenience
export type {
  EODReportRequest,
  EODReportData,
  SavedEODReport,
  EODReportHistoryRequest,
  BestSellingItem,
  PaymentBreakdown,
  HourlySales,
} from '@/lib/schemas';
