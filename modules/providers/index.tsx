"use client";

import * as React from "react";
import { ThemeProvider } from "./components/theme-provider";
import { QueryProvider } from "./components/query-provider";
import { BusinessProvider } from "./components/business-provider";
import { CartProvider } from "../cart";
import { useMenuCacheWarming } from "@/hooks/use-menu-prefetch";

interface ProvidersProps {
  children: React.ReactNode;
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  // Warm up menu cache on app initialization
  useMenuCacheWarming();
  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <BusinessProvider>
          <CartProvider>
            <AppInitializer>{children}</AppInitializer>
          </CartProvider>
        </BusinessProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
