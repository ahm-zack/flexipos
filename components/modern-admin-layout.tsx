"use client";

import { ModernAdminNavbar } from "@/components/modern-admin-navbar";
import { MobileAdminNavbar } from "@/components/mobile-admin-navbar";
import { CartPanelWithCustomer } from "@/components/cart-panel-with-customer";
import { useCurrentUserOptimized } from "@/hooks/use-current-user-optimized";
import { CreatedOrderReciptModal } from "@/modules/providers/CreatedOrderReciptsModal";
import { usePathname } from "next/navigation";

interface ModernAdminLayoutProps {
  children: React.ReactNode;
}

export function ModernAdminLayout({ children }: ModernAdminLayoutProps) {
  const { user: fullUserData, loading } = useCurrentUserOptimized();
  const pathname = usePathname();

  // Check if current page is an admin/management page
  const isAdminPage =
    pathname?.includes("/orders") ||
    pathname?.includes("/items") ||
    pathname?.includes("/customers") ||
    pathname?.includes("/users") ||
    pathname?.includes("/reports") ||
    pathname === "/admin";

  const user = fullUserData
    ? {
        name: fullUserData.name,
        email: fullUserData.email,
        avatar: undefined,
      }
    : loading
    ? {
        name: "Loading...",
        email: "...",
        avatar: undefined,
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Responsive Navbar - Fixed/Sticky */}
      <div className="fixed top-0 left-0 right-0 z-50 block xl:hidden">
        {/* Mobile & Tablet Navbar (up to 1280px) */}
        <MobileAdminNavbar user={user} />
      </div>
      <div className="fixed top-0 left-0 right-0 z-50 hidden xl:block">
        {/* Desktop Dock Navbar (1280px and above) */}
        <ModernAdminNavbar user={user} />
      </div>

      {/* Desktop Layout with Conditional Cards */}
      <div className="hidden xl:block pt-24 p-6">
        {isAdminPage ? (
          // Single card layout for admin pages
          <div className="h-[calc(100vh-120px)]">
            <div className="h-full bg-background border rounded-2xl shadow-lg overflow-hidden">
              <div className="h-full overflow-y-auto p-6">{children}</div>
            </div>
          </div>
        ) : (
          // Two-card layout for menu pages
          <div className="flex gap-6 h-[calc(100vh-120px)]">
            {/* Left Card - Menu Items */}
            <div className="flex-1 bg-background border rounded-2xl shadow-lg overflow-hidden">
              <div className="h-full overflow-y-auto p-6">{children}</div>
            </div>

            {/* Right Card - Cart Panel */}
            <div className="w-96 bg-card border rounded-2xl shadow-lg overflow-hidden">
              <div className="h-full overflow-y-auto">
                <CartPanelWithCustomer />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Layout - No cart panel */}
      <div className="block xl:hidden">
        <main className="container mx-auto px-4 pb-8 pt-24">{children}</main>
      </div>

      {/* Modals */}
      <CreatedOrderReciptModal />
    </div>
  );
}
