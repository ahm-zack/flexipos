import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  EODReportRequest, 
  EODReportData, 
  SavedEODReport,
  EODReportHistoryRequest 
} from '@/lib/schemas';

// Query key factory
export const eodReportKeys = {
  all: ['eodReports'] as const,
  lists: () => [...eodReportKeys.all, 'list'] as const,
  list: (filters: string) => [...eodReportKeys.lists(), { filters }] as const,
  details: () => [...eodReportKeys.all, 'detail'] as const,
  detail: (id: string) => [...eodReportKeys.details(), id] as const,
  history: () => [...eodReportKeys.all, 'history'] as const,
  historyWithFilters: (filters: EODReportHistoryRequest) => [...eodReportKeys.history(), filters] as const,
  generate: () => [...eodReportKeys.all, 'generate'] as const,
  generateWithParams: (params: EODReportRequest) => [...eodReportKeys.generate(), params] as const,
};

// API functions
const generateEODReport = async (reportRequest: EODReportRequest): Promise<EODReportData> => {
  const response = await fetch("/api/admin/reports/eod", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportRequest),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle specific auth errors
    if (response.status === 403) {
      throw new Error(data.error || 'Insufficient permissions for EOD reports');
    }
    throw new Error(data.error || `Failed to generate EOD report (${response.status})`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to generate EOD report');
  }

  return data.data;
};

const generateEODReportWithPreset = async (preset: string = 'today', saveToDb: boolean = false): Promise<EODReportData> => {
  const response = await fetch(`/api/admin/reports/eod?preset=${preset}&save=${saveToDb}`);
  
  if (!response.ok) {
    // Handle specific auth errors
    if (response.status === 403) {
      const data = await response.json();
      throw new Error(data.error || 'Insufficient permissions for EOD reports');
    }
    throw new Error("Failed to generate EOD report");
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Failed to generate EOD report");
  }
  
  return data.data;
};

const fetchEODReportHistory = async (historyRequest: EODReportHistoryRequest): Promise<{
  reports: SavedEODReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const params = new URLSearchParams({
    page: historyRequest.page.toString(),
    limit: historyRequest.limit.toString(),
  });

  if (historyRequest.startDate) {
    params.append('startDate', historyRequest.startDate);
  }
  if (historyRequest.endDate) {
    params.append('endDate', historyRequest.endDate);
  }
  if (historyRequest.reportType) {
    params.append('reportType', historyRequest.reportType);
  }

  const response = await fetch(`/api/admin/reports/eod/history?${params}`);
  
  if (!response.ok) {
    // Handle specific auth errors
    if (response.status === 403) {
      const data = await response.json();
      throw new Error(data.error || 'Insufficient permissions for EOD reports');
    }
    throw new Error("Failed to fetch EOD report history");
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch EOD report history");
  }
  
  return {
    reports: data.reports,
    pagination: data.pagination,
  };
};

const fetchEODReportById = async (id: string): Promise<SavedEODReport> => {
  const response = await fetch(`/api/admin/reports/eod/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("EOD report not found");
    }
    // Handle specific auth errors
    if (response.status === 403) {
      const data = await response.json();
      throw new Error(data.error || 'Insufficient permissions for EOD reports');
    }
    throw new Error("Failed to fetch EOD report");
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch EOD report");
  }
  
  return data.data;
};

// Hooks

/**
 * Hook to generate EOD report with custom parameters
 */
export const useGenerateEODReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: generateEODReport,
    onSuccess: (data) => {
      // Invalidate history queries to show new saved reports
      queryClient.invalidateQueries({ queryKey: eodReportKeys.history() });
      
      // Cache the generated report - create a proper request object from the data
      const cacheKey = eodReportKeys.generate();
      queryClient.setQueryData(cacheKey, data);
    },
  });
};

/**
 * Hook to generate EOD report with preset date ranges
 */
export const useGenerateEODReportWithPreset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ preset, saveToDb }: { preset: string; saveToDb: boolean }) => 
      generateEODReportWithPreset(preset, saveToDb),
    onSuccess: (data, variables) => {
      // Invalidate history queries if report was saved
      if (variables.saveToDb) {
        queryClient.invalidateQueries({ queryKey: eodReportKeys.history() });
      }
      
      // Cache the generated report
      queryClient.setQueryData(eodReportKeys.generate(), data);
    },
  });
};

/**
 * Hook to fetch EOD report history with pagination and filters
 */
export const useEODReportHistory = (historyRequest: EODReportHistoryRequest) => {
  return useQuery({
    queryKey: eodReportKeys.historyWithFilters(historyRequest),
    queryFn: () => fetchEODReportHistory(historyRequest),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};

/**
 * Hook to fetch a specific EOD report by ID
 */
export const useEODReport = (id: string) => {
  return useQuery({
    queryKey: eodReportKeys.detail(id),
    queryFn: () => fetchEODReportById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to generate today's EOD report (quick preset)
 */
export const useTodayEODReport = (saveToDb: boolean = false) => {
  return useQuery({
    queryKey: eodReportKeys.generateWithParams({ 
      startDateTime: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      endDateTime: new Date().toISOString(),
      saveToDatabase: saveToDb,
      includePreviousPeriodComparison: false
    }),
    queryFn: () => generateEODReportWithPreset('today', saveToDb),
    staleTime: 1 * 60 * 1000, // 1 minute for today's data
    retry: 2,
  });
};

/**
 * Hook to generate yesterday's EOD report (quick preset)
 */
export const useYesterdayEODReport = (saveToDb: boolean = false) => {
  return useQuery({
    queryKey: eodReportKeys.generateWithParams({
      startDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
      endDateTime: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      saveToDatabase: saveToDb,
      includePreviousPeriodComparison: false
    }),
    queryFn: () => generateEODReportWithPreset('yesterday', saveToDb),
    staleTime: 5 * 60 * 1000, // 5 minutes for yesterday's data
    retry: 2,
  });
};

/**
 * Hook to generate last 7 days EOD report (quick preset)
 */
export const useLast7DaysEODReport = (saveToDb: boolean = false) => {
  return useQuery({
    queryKey: eodReportKeys.generateWithParams({
      startDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
      endDateTime: new Date().toISOString(),
      saveToDatabase: saveToDb,
      includePreviousPeriodComparison: false
    }),
    queryFn: () => generateEODReportWithPreset('last-7-days', saveToDb),
    staleTime: 3 * 60 * 1000, // 3 minutes for weekly data
    retry: 2,
  });
};

/**
 * Hook to prefetch common EOD report data
 */
export const usePrefetchEODReports = () => {
  const queryClient = useQueryClient();
  
  const prefetchHistory = () => {
    queryClient.prefetchQuery({
      queryKey: eodReportKeys.historyWithFilters({
        page: 1,
        limit: 10,
      }),
      queryFn: () => fetchEODReportHistory({
        page: 1,
        limit: 10,
      }),
      staleTime: 2 * 60 * 1000,
    });
  };
  
  const prefetchTodayReport = () => {
    queryClient.prefetchQuery({
      queryKey: eodReportKeys.generateWithParams({
        startDateTime: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
        endDateTime: new Date().toISOString(),
        saveToDatabase: false,
        includePreviousPeriodComparison: false
      }),
      queryFn: () => generateEODReportWithPreset('today', false),
      staleTime: 1 * 60 * 1000,
    });
  };
  
  return {
    prefetchHistory,
    prefetchTodayReport,
  };
};

/**
 * Hook to invalidate all EOD report queries
 */
export const useInvalidateEODReports = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: eodReportKeys.all });
    },
    invalidateHistory: () => {
      queryClient.invalidateQueries({ queryKey: eodReportKeys.history() });
    },
    invalidateGenerated: () => {
      queryClient.invalidateQueries({ queryKey: eodReportKeys.generate() });
    },
  };
};

/**
 * Custom hook for managing EOD report state and operations
 */
export const useEODReportManager = () => {
  const generateReport = useGenerateEODReport();
  const generateWithPreset = useGenerateEODReportWithPreset();
  const invalidate = useInvalidateEODReports();
  const prefetch = usePrefetchEODReports();
  
  return {
    // Generation
    generateReport: generateReport.mutate,
    generateWithPreset: generateWithPreset.mutate,
    isGenerating: generateReport.isPending || generateWithPreset.isPending,
    generationError: generateReport.error || generateWithPreset.error,
    
    // Cache management
    invalidateAll: invalidate.invalidateAll,
    invalidateHistory: invalidate.invalidateHistory,
    invalidateGenerated: invalidate.invalidateGenerated,
    prefetchHistory: prefetch.prefetchHistory,
    prefetchTodayReport: prefetch.prefetchTodayReport,
    
    // Status
    isSuccess: generateReport.isSuccess || generateWithPreset.isSuccess,
    isError: generateReport.isError || generateWithPreset.isError,
    data: generateReport.data || generateWithPreset.data,
  };
};
