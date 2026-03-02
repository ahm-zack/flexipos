"use client";

import { DynamicDesktopAdminNavbar } from "@/components/dynamic-desktop-admin-navbar";
import { MobileAdminNavbar } from "@/components/mobile-admin-navbar";
import { CartPanel } from "@/modules/cart";
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
    pathname?.includes("/inventory") ||
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
    <div className="min-h-screen bg-gray-100 dark:bg-black/40">
      {/* Responsive Navbar - Fixed/Sticky */}
      <div className="fixed top-0 left-0 right-0 z-50 block xl:hidden">
        {/* Mobile & Tablet Navbar (up to 1280px) */}
        <MobileAdminNavbar user={user} />
      </div>

      {/* Desktop Layout with Conditional Cards */}
      <div className="hidden xl:flex h-screen">
        {isAdminPage ? (
          // Single card layout for admin pages
          <div className="w-full p-6">
            {/* Navbar positioned over left card area */}
            <div className="fixed top-0 left-6 right-6 z-50">
              <DynamicDesktopAdminNavbar user={user} />
            </div>
            <div className="h-full pt-24">
              <div className="h-full rounded-2xl shadow-lg overflow-hidden">
                <div className="h-full overflow-y-auto p-6">{children}</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Left Section - Content with Navbar */}
            <div className="flex-1 p-4 pr-2">
              {/* Navbar positioned only over left card */}
              <div className="fixed top-0 left-4 right-[22rem] xl:right-[26rem] 2xl:right-[28rem] z-50">
                <DynamicDesktopAdminNavbar user={user} />
              </div>

              {/* Left Card - Menu Items */}
              <div className="h-full pt-24">
                <div className="h-full shadow-lg overflow-hidden rounded-2xl">
                  <div className="h-full overflow-y-auto p-6">{children}</div>
                </div>
              </div>
            </div>

            {/* Right Section - Cart Panel */}
            <div className="w-[20rem] xl:w-[24rem] 2xl:w-[26rem] p-2 pl-0 min-w-[18rem]">
              <div className="h-full bg-card shadow-lg overflow-hidden rounded-2xl">
                <div className="h-full overflow-y-auto">
                  <CartPanel sidebarMode />
                </div>
              </div>
            </div>
          </>
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
