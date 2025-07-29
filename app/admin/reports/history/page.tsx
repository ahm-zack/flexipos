import { HistoricalEODReports } from "@/modules/eod-report/components/historical-eod-reports";
import { QueryClient } from "@tanstack/react-query";
import { eodReportKeys } from "@/modules/eod-report/hooks/use-eod-reports";
import { fetchEODReportHistory } from "@/modules/eod-report/hooks/use-eod-reports";

export default async function ReportsHistoryPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
      },
    },
  });

  // Prefetch EOD report history for SSR hydration
  await queryClient.prefetchQuery({
    queryKey: eodReportKeys.historyWithFilters({ page: 1, limit: 50 }),
    queryFn: () => fetchEODReportHistory({ page: 1, limit: 50 }),
  });

  return <HistoricalEODReports />;
}
