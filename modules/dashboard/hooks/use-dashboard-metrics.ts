"use client";

import { useQuery } from "@tanstack/react-query";
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
    const queryKey = dashboardKeys.metrics(businessId ?? "");

    return useQuery({
        queryKey,
        enabled: !!businessId,
        refetchInterval: 30_000, // poll every 30 seconds — no WebSocket needed
        staleTime: 15_000,
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
