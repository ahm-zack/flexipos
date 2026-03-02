/**
 * EOD Report hooks – Supabase client + TanStack Query (no API routes)
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  getSmartEODPreview,
  generateAndSaveEODReport,
  fetchEODReportHistory,
  fetchEODReportById,
  deleteEODReport,
} from '@/lib/reports/eod-service';
import type { SmartEODPreview, SavedEODReport } from '@/lib/reports/types';

// ─────────────────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────────────────
export const eodReportKeys = {
  all: (businessId: string) => ['eodReports', businessId] as const,
  preview: (businessId: string) => ['eodReports', businessId, 'preview'] as const,
  history: (businessId: string, page: number) =>
    ['eodReports', businessId, 'history', page] as const,
  detail: (id: string) => ['eodReports', 'detail', id] as const,
};

// ─────────────────────────────────────────────────────────────────────────
// Smart EOD preview hook (auto-detects pending orders)
// ─────────────────────────────────────────────────────────────────────────
export const useSmartEODPreview = () => {
  const { businessId, isLoading: loading } = useBusinessId();

  return useQuery<SmartEODPreview>({
    queryKey: eodReportKeys.preview(businessId ?? ''),
    queryFn: () => getSmartEODPreview(businessId!),
    enabled: !!businessId && !loading,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

// ─────────────────────────────────────────────────────────────────────────
// Generate + save EOD report mutation
// ─────────────────────────────────────────────────────────────────────────
export const useGenerateEODReport = () => {
  const queryClient = useQueryClient();
  const { businessId } = useBusinessId();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: (notes?: string) => {
      if (!businessId) throw new Error('No business ID');
      if (!user?.id) throw new Error('Must be logged in');
      return generateAndSaveEODReport(businessId, user.id, notes);
    },
    onSuccess: () => {
      if (businessId) {
        queryClient.invalidateQueries({ queryKey: eodReportKeys.all(businessId) });
      }
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────
// EOD report history
// ─────────────────────────────────────────────────────────────────────────
export const useEODReportHistory = (page = 1, limit = 10) => {
  const { businessId, isLoading: loading } = useBusinessId();

  return useQuery({
    queryKey: eodReportKeys.history(businessId ?? '', page),
    queryFn: () => fetchEODReportHistory(businessId!, page, limit),
    enabled: !!businessId && !loading,
    staleTime: 60_000,
  });
};

// ─────────────────────────────────────────────────────────────────────────
// Single EOD report
// ─────────────────────────────────────────────────────────────────────────
export const useEODReportDetail = (reportId: string | null) => {
  return useQuery<SavedEODReport>({
    queryKey: eodReportKeys.detail(reportId ?? ''),
    queryFn: () => fetchEODReportById(reportId!),
    enabled: !!reportId,
    staleTime: 5 * 60_000,
  });
};

// ─────────────────────────────────────────────────────────────────────────
// Delete EOD report mutation
// ─────────────────────────────────────────────────────────────────────────
export const useDeleteEODReport = () => {
  const queryClient = useQueryClient();
  const { businessId } = useBusinessId();

  return useMutation({
    mutationFn: (reportId: string) => deleteEODReport(reportId),
    onSuccess: () => {
      if (businessId) {
        queryClient.invalidateQueries({ queryKey: eodReportKeys.all(businessId) });
      }
    },
  });
};
