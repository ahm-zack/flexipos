"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized for menu/POS system
            staleTime: 5 * 60 * 1000, // 5 minutes default
            gcTime: 15 * 60 * 1000, // 15 minutes (keep in memory longer)
            refetchOnWindowFocus: false, // Don't refetch when returning to tab
            refetchOnMount: false, // Don't refetch if data exists and not stale
            refetchOnReconnect: true, // Do refetch when internet reconnects
            retry: (failureCount, error) => {
              // Smart retry logic
              if (error instanceof Error) {
                // Don't retry on 4xx errors (client errors)
                if (error.message.includes("4")) return false;
                // Don't retry on auth errors
                if (error.message.toLowerCase().includes("unauthorized"))
                  return false;
              }
              // Retry up to 2 times for other errors
              return failureCount < 2;
            },
          },
          mutations: {
            // Faster error display for mutations
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
