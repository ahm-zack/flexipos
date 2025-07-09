import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { getUserByEmail } from "@/lib/user-service-drizzle";
import { ConditionalCartContainer } from "@/components/conditional-cart-container";
import React from "react";
import { CreatedOrderReciptModal } from "@/modules/providers/CreatedOrderReciptsModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Get the current authenticated user
  const { user: currentUser } = await getCurrentUser();

  // Get full user data from database if authenticated
  let fullUserData = null;
  if (currentUser?.email) {
    const userResult = await getUserByEmail(currentUser.email);
    if (userResult.success && userResult.data) {
      fullUserData = userResult.data;
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={
          fullUserData
            ? {
                name: fullUserData.name,
                email: fullUserData.email,
                avatar: undefined, // No avatar field in the current user schema
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>

        {/* Conditional Cart - Hidden on management pages */}
        <ConditionalCartContainer />
        <CreatedOrderReciptModal />
      </SidebarInset>
    </SidebarProvider>
  );
}
