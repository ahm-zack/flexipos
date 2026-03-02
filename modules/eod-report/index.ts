// EOD Report Module – Supabase + TanStack Query

// Export hooks
export {
  eodReportKeys,
  useSmartEODPreview,
  useGenerateEODReport,
  useEODReportHistory,
  useEODReportDetail,
  useDeleteEODReport,
} from './hooks/use-eod-reports';

// Export utility hooks
export {
  useEODReportFormatters,
  useEODReportAnalytics,
} from './hooks/use-eod-report-utils';

// Export components
export { EODReportDashboard } from './components';

// Export types
export type {
  EODReportData,
  SavedEODReport,
  SmartEODPreview,
  ReportMetrics,
  TopItem,
  CategoryBreakdownItem,
  HourlySalesItem,
  PaymentBreakdownItem,
} from '@/lib/reports/types';
