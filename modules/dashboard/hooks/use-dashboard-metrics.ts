"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useBusinessContext } from "@/modules/providers/components/business-provider";
import type { Database } from "@/database.types";

export type DashboardMetrics =
    Database["public"]["Tables"]["dashboard_metrics"]["Row"];

export const dashboardKeys = {
    all: ["dashboard"] as const,
    metrics: (businessId: string) =>
        [...dashboardKeys.all, "metrics", businessId] as const,
};

export function useDashboardMetrics() {
    const { businessId } = useBusinessContext();
    const queryClient = useQueryClient();
    const queryKey = dashboardKeys.metrics(businessId ?? "");

    // ── Realtime subscription ──────────────────────────────────────────────
    // Listen for UPDATE events on this tenant's dashboard_metrics row.
    // On change, write the new payload directly into the query cache —
    // no extra HTTP round-trip needed.
    useEffect(() => {
        if (!businessId) return;

        const supabase = createClient();

        const channel = supabase
            .channel(`dashboard_metrics:${businessId}`)
            .on<DashboardMetrics>(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "dashboard_metrics",
                    filter: `business_id=eq.${businessId}`,
                },
                (payload) => {
                    // Push the fresh row straight into the cache — zero latency,
                    // no refetch required.
                    queryClient.setQueryData<DashboardMetrics>(
                        queryKey,
                        payload.new,
                    );
                },
            )
            .on<DashboardMetrics>(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "dashboard_metrics",
                    filter: `business_id=eq.${businessId}`,
                },
                (payload) => {
                    // First-ever row for this business (created on first order)
                    queryClient.setQueryData<DashboardMetrics>(
                        queryKey,
                        payload.new,
                    );
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // queryKey is stable as long as businessId doesn't change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessId, queryClient]);

    // ── Initial fetch ──────────────────────────────────────────────────────
    // Fetches once on mount; after that, realtime keeps the cache fresh.
    return useQuery({
        queryKey,
        enabled: !!businessId,
        staleTime: Infinity, // realtime owns cache freshness — never auto-refetch
        queryFn: async (): Promise<DashboardMetrics | null> => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("dashboard_metrics")
                .select("*")
                .eq("business_id", businessId!)
                .maybeSingle();

            if (error) throw new Error(error.message);
            return data;
        },
    });
}
