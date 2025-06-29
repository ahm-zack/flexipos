"use client";

import { type LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* Menu Link - clickable instead of label */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="h-12 text-lg font-semibold">
            <a href="/admin/menu">
              <span>{items[0]?.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Individual category links */}
        {items[0]?.items?.map((subItem) => (
          <SidebarMenuItem key={subItem.title}>
            <SidebarMenuButton asChild className="h-11 text-base font-medium">
              <a href={subItem.url}>
                <span>{subItem.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {/* Create Item Button */}
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="h-14 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
          >
            <a href="#" className="flex items-center justify-center gap-3">
              <Plus className="size-5" />
              <span>Create Item</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
