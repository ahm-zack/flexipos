"use client";

import { CartContainer } from "@/modules/cart";
import { usePathname } from "next/navigation";

export function ConditionalCartContainer() {
  const pathname = usePathname();

  // Hide cart on management pages
  const isManagementPage =
    pathname.includes("/admin/items") ||
    pathname.includes("/admin/users") ||
    pathname.includes("/admin/reports") ||
    pathname.includes("/admin/orders") ||
    pathname.includes("/admin/customers") ||
    pathname.includes("/admin/events");

  if (isManagementPage) {
    return null;
  }

  return <CartContainer />;
}
