"use client";

import * as React from "react";
import {
  Command,
  Frame,
  UtensilsCrossed,
  Pizza,
  Cookie,
  Beef,
  Sandwich,
  Coffee,
  Users,
  BarChart3,
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

const data = {
  navMain: [
    {
      title: "Menu",
      url: "/admin/menu",
      icon: UtensilsCrossed,
      isActive: true,
      items: [
        {
          title: "🍕 Pizza",
          url: "/admin/menu/pizza",
          icon: Pizza,
        },
        {
          title: "🥧 Pie",
          url: "/admin/menu/pie",
          icon: Cookie,
        },
        {
          title: "🍔 Burger",
          url: "/admin/menu/burger",
          icon: Beef,
        },
        {
          title: "🌯 Shawerma",
          url: "/admin/menu/shawerma",
          icon: Sandwich,
        },
        {
          title: "🍟 Side Order",
          url: "/admin/menu/side-order",
          icon: Frame,
        },
        {
          title: "☕ Beverages",
          url: "/admin/menu/beverages",
          icon: Coffee,
        },
      ],
    },
  ],
  navSecondary: [
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
            <SidebarMenuButton size="lg" asChild className="h-16 text-lg">
              <a href="/admin/menu">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-lg">
                  <Command className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-base leading-tight">
                  <span className="truncate font-semibold text-lg">Lazaza</span>
                  <span className="truncate text-sm font-medium">POS</span>
                </div>
              </a>
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
