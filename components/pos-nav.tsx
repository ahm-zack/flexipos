"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// Using emoji icons for a colorful menu
import { useBusiness } from "@/hooks/useBusinessId";
import { UserInfo } from "./user-info";
import { useCurrentUserOptimized } from "@/hooks/use-current-user-optimized";

const navItems = [
  {
    title: "Dashboard",
    icon: "🏠",
    items: [
      { title: "Home", url: "/", icon: "🏠" },
      { title: "Inventory", url: "/admin/inventory", icon: "📦" },
      { title: "Orders", url: "/admin/orders", icon: "🧾" },
      { title: "Customers", url: "/admin/customers", icon: "👥" },
      { title: "Users", url: "/admin/users", icon: "👥" },
      { title: "Reports", url: "/admin/reports", icon: "📊" },
      { title: "Events", url: "/admin/events", icon: "🎉" },
    ],
  },
];

export function POSNav() {
  const pathname = usePathname();
  const { user } = useCurrentUserOptimized();
  const { businessName } = useBusiness();
  const brandName = businessName || "FlexiPOS";
  // Group menu items by type for better organization
  const menuGroups = [
    {
      label: "Menu",
      items: navItems[0].items.filter((item) =>
        item.url.startsWith("/admin/menu")
      ),
    },
    {
      label: "Management",
      items: navItems[0].items.filter((item) =>
        [
          "/admin/orders",
          "/admin/customers",
          "/admin/items",
          "/admin/users",
          "/admin/reports",
          "/admin/events",
        ].includes(item.url)
      ),
    },
  ];

  return (
    <nav className="w-full h-full bg-sidebar shadow-sm flex flex-col">
      <div className="h-16 flex items-center px-6 ">
        <Link
          href="/"
          className="text-2xl font-bold text-sidebar-foreground tracking-tight"
        >
          {brandName}
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-6 pb-2 text-xs font-semibold uppercase text-primary tracking-wide">
              {group.label}
            </div>
            <ul className="space-y-1">
              {group.items.map((subItem) => (
                <li key={subItem.title}>
                  <Link
                    href={subItem.url}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-sidebar-accent ${
                      pathname === subItem.url
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-bold"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {subItem.icon && (
                      <span
                        className="w-5 h-5 text-xl mr-1 flex items-center"
                        aria-hidden="true"
                      >
                        {subItem.icon}
                      </span>
                    )}
                    <span>{subItem.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* Show user info with actual name */}
        <UserInfo
          user={user ? { name: user.name, email: user.email } : undefined}
        />
      </div>
    </nav>
  );
}
