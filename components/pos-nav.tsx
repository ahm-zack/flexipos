"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Pizza,
  Sandwich,
  Beer,
  Hamburger,
  PieChart,
  Users,
  FileText,
  List,
  Utensils,
  ScrollText,
} from "lucide-react";
import { UserInfo } from "./user-info";
import { useCurrentUserOptimized } from "@/hooks/use-current-user-optimized";

const navItems = [
  {
    title: "Dashboard",
    icon: Home,
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Pizza", url: "/admin/menu/pizza", icon: Pizza },
      { title: "Appetizers", url: "/admin/menu/appetizers", icon: Utensils },
      { title: "Beverages", url: "/admin/menu/beverages", icon: Beer },
      { title: "Burgers", url: "/admin/menu/burger", icon: Hamburger },
      { title: "Sandwiches", url: "/admin/menu/sandwich", icon: Sandwich },
      { title: "Shawermas", url: "/admin/menu/shawerma", icon: List },
      { title: "Pies", url: "/admin/menu/pie", icon: PieChart },
      { title: "Mini Pies", url: "/admin/menu/mini-pie", icon: PieChart },
      { title: "Side Orders", url: "/admin/menu/side-order", icon: ScrollText },
      { title: "Orders", url: "/admin/orders", icon: FileText },
      { title: "Menu Items", url: "/admin/items", icon: List },
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Reports", url: "/admin/reports", icon: FileText },
    ],
  },
];

export function POSNav() {
  const pathname = usePathname();
  const { user } = useCurrentUserOptimized();
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
          "/admin/items",
          "/admin/users",
          "/admin/reports",
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
          LAZAZA
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
                      <subItem.icon className="w-5 h-5 text-blue-500 dark:text-blue-300" />
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
