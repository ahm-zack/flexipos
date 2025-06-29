"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = (path: string): BreadcrumbItem[] => {
    const segments = path.split("/").filter(Boolean);

    // Start with empty breadcrumb items array
    const items: BreadcrumbItem[] = [];

    // Map path segments to breadcrumb items
    if (segments.length > 0) {
      let currentPath = "";

      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;

        // Skip the first segment if it's 'admin'
        if (segment === "admin") {
          return;
        }

        // Create breadcrumb item based on segment
        const breadcrumbItem = getBreadcrumbLabel(segment);

        if (breadcrumbItem) {
          // If it's the last segment, don't add href (it's the current page)
          if (index === segments.length - 1) {
            items.push({ label: breadcrumbItem });
          } else {
            items.push({ label: breadcrumbItem, href: currentPath });
          }
        }
      });
    }

    return items;
  };

  // Get human-readable labels for breadcrumb segments
  const getBreadcrumbLabel = (segment: string): string | null => {
    const segmentMap: Record<string, string> = {
      // Menu categories
      menu: "Menu",
      pizza: "🍕 Pizza",
      pie: "🥧 Pie",
      burger: "🍔 Burger",
      appetizers: "🥗 Appetizers",
      shawerma: "🌯 Shawerma",
      "side-order": "🍟 Side Order",
      beverages: "☕ Beverages",

      // Other sections
      users: "👥 Users",
      reports: "📊 Reports",

      // Actions
      new: "New",
      edit: "Edit",
    };

    return (
      segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  const breadcrumbItems = getBreadcrumbItems(pathname);

  // Don't show breadcrumb if there are no items or if we're on the root admin page
  if (breadcrumbItems.length === 0 || pathname === "/admin") {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-medium text-foreground">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator className="mx-2" />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
