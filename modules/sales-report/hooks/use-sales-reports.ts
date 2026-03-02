/**
 * Sales Report hooks – Supabase client + TanStack Query (no API routes)
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
    previewSalesReport,
    generateAndSaveSalesReport,
    fetchSalesReportHistory,
    fetchSalesReportById,
    deleteSalesReport,
} from '@/lib/reports/sales-service';
import type { SalesReportData, SavedSalesReport } from '@/lib/reports/types';

// ─────────────────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────────────────
export const salesReportKeys = {
    all: (businessId: string) => ['salesReports', businessId] as const,
    history: (businessId: string, page: number) =>
        ['salesReports', businessId, 'history', page] as const,
    detail: (id: string) => ['salesReports', 'detail', id] as const,
    preview: (businessId: string, start: string, end: string) =>
        ['salesReports', businessId, 'preview', start, end] as const,
};

// ─────────────────────────────────────────────────────────────────────────
// Preview hook (no save)
// ─────────────────────────────────────────────────────────────────────────
export const useSalesReportPreview = (
    startDate: Date | null,
    endDate: Date | null,
    enabled = true
) => {
    const { businessId, isLoading: loading } = useBusinessId();
    const { user } = useCurrentUser();

    return useQuery<SalesReportData>({
        queryKey: salesReportKeys.preview(
            businessId ?? '',
            startDate?.toISOString() ?? '',
            endDate?.toISOString() ?? ''
        ),
        queryFn: () =>
            previewSalesReport(businessId!, user!.id, startDate!, endDate!),
        enabled: !!businessId && !loading && !!user && !!startDate && !!endDate && enabled,
        staleTime: 5 * 60_000,
    });
};

// ─────────────────────────────────────────────────────────────────────────
// Generate + save sales report mutation
// ─────────────────────────────────────────────────────────────────────────
export const useGenerateSalesReport = () => {
    const queryClient = useQueryClient();
    const { businessId } = useBusinessId();
    const { user } = useCurrentUser();

    return useMutation({
        mutationFn: ({
            startDate,
            endDate,
            reportName,
        }: {
            startDate: Date;
            endDate: Date;
            reportName?: string;
        }) => {
            if (!businessId) throw new Error('No business ID');
            if (!user?.id) throw new Error('Must be logged in');
            return generateAndSaveSalesReport(businessId, user.id, startDate, endDate, reportName);
        },
        onSuccess: () => {
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: salesReportKeys.all(businessId) });
            }
        },
    });
};

// ─────────────────────────────────────────────────────────────────────────
// Sales report history
// ─────────────────────────────────────────────────────────────────────────
export const useSalesReportHistory = (page = 1, limit = 10) => {
    const { businessId, isLoading: loading } = useBusinessId();

    return useQuery({
        queryKey: salesReportKeys.history(businessId ?? '', page),
        queryFn: () => fetchSalesReportHistory(businessId!, page, limit),
        enabled: !!businessId && !loading,
        staleTime: 60_000,
    });
};

// ─────────────────────────────────────────────────────────────────────────
// Single sales report
// ─────────────────────────────────────────────────────────────────────────
export const useSalesReportDetail = (reportId: string | null) => {
    return useQuery<SavedSalesReport>({
        queryKey: salesReportKeys.detail(reportId ?? ''),
        queryFn: () => fetchSalesReportById(reportId!),
        enabled: !!reportId,
        staleTime: 5 * 60_000,
    });
};

// ─────────────────────────────────────────────────────────────────────────
// Delete mutation
// ─────────────────────────────────────────────────────────────────────────
export const useDeleteSalesReport = () => {
    const queryClient = useQueryClient();
    const { businessId } = useBusinessId();

    return useMutation({
        mutationFn: (reportId: string) => deleteSalesReport(reportId),
        onSuccess: () => {
            if (businessId) {
                queryClient.invalidateQueries({ queryKey: salesReportKeys.all(businessId) });
            }
        },
    });
};
