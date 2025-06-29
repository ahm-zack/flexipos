"use client";

import * as React from "react";
import { ThemeProvider } from "./components/theme-provider";
import { QueryProvider } from "./components/query-provider";
import { CartProvider } from "../cart";

interface ProvidersProps {
  children: React.ReactNode;
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
        <CartProvider>{children}</CartProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
