"use client";

import { CartContainer } from "@/modules/cart";
import { usePathname } from "next/navigation";

export function ConditionalCartContainer() {
  const pathname = usePathname();

  // Hide cart on management pages
  const isManagementPage = pathname.includes("/admin/items");

  if (isManagementPage) {
    return null;
  }

  return <CartContainer />;
}
