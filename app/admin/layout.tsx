"use client";
import POSLayout from "@/components/fixed-layout";
import { DashboardLayoutClient } from "@/components/dashboard-layout-client";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTabletOrLarger, setIsTabletOrLarger] = useState(true);

  useEffect(() => {
    // Set initial value and listen for resize
    const checkScreen = () => {
      setIsTabletOrLarger(window.matchMedia("(min-width: 1360px)").matches);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (isTabletOrLarger) {
    return <POSLayout>{children}</POSLayout>;
  }
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
