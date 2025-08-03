"use client";
import POSLayout from "@/components/fixed-layout";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTabletOrLarger, setIsTabletOrLarger] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Set initial value and listen for resize
    const checkScreen = () => {
      setIsTabletOrLarger(window.matchMedia("(min-width: 1360px)").matches);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Exclude POSLayout (cart) for these admin routes
  const excludedRoutes = [
    "/admin/orders",
    "/admin/customers",
    "/admin/items",
    "/admin/users",
    "/admin/reports",
  ];
  const isExcluded = excludedRoutes.some((route) => pathname.startsWith(route));

  if (isTabletOrLarger && !isExcluded) {
    return <POSLayout>{children}</POSLayout>;
  }
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
