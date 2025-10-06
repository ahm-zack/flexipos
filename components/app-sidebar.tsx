"use client";

import * as React from "react";
import {
  Command,
  UtensilsCrossed,
  Pizza,
  Users,
  UserCheck,
  BarChart3,
  Package,
  ShoppingBag,
  Calendar,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { UserInfo } from "@/components/user-info";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Inventory",
      icon: UtensilsCrossed,
      isActive: true,
      items: [
        {
          title: "📦 Categories",
          url: "/admin/inventory",
          icon: Pizza,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: UserCheck,
    },
    {
      title: "Items Management",
      url: "/admin/items",
      icon: Package,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: BarChart3,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: Calendar,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" className="text-base" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-16 text-lg cursor-default"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
                <Command className="size-6" />
              </div>
              <Link href="/">
                <div className="grid flex-1 text-left text-base leading-tight">
                  <span className="truncate font-semibold text-lg">Lazaza</span>
                  <span className="truncate text-sm font-medium">POS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserInfo user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
