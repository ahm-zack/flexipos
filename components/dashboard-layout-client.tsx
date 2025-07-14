"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ConditionalCartContainer } from "@/components/conditional-cart-container";
import React from "react";
import { CreatedOrderReciptModal } from "@/modules/providers/CreatedOrderReciptsModal";
import { useCurrentUserClient } from "@/hooks/use-current-user-client";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutProps) {
  // Use client-side API-based hook for static export compatibility
  const { user: fullUserData, loading: isLoading } = useCurrentUserClient();

  return (
    <SidebarProvider>
      <AppSidebar
        user={
          fullUserData
            ? {
                name: fullUserData.name,
                email: fullUserData.email,
                avatar: undefined,
              }
            : null
        }
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Conditional Cart - Hidden on management pages */}
        <ConditionalCartContainer />
        <CreatedOrderReciptModal />
      </SidebarInset>
    </SidebarProvider>
  );
}
