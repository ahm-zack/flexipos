// Sales Report Module – Supabase + TanStack Query

// Export hooks
export {
    salesReportKeys,
    useSalesReportPreview,
    useGenerateSalesReport,
    useSalesReportHistory,
    useSalesReportDetail,
    useDeleteSalesReport,
} from './hooks/use-sales-reports';

// Export components
export { SalesReportDashboard } from './components/sales-report-dashboard';
export { SalesReportPrintView } from './components/sales-report-print';

// Export types
export type {
    SalesReportData,
    SavedSalesReport,
    DailySalesItem,
} from '@/lib/reports/types';
