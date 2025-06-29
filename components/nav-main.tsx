"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* Menu Link - clickable instead of label */}
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className={cn(
              "h-12 text-lg font-semibold",
              pathname === "/admin/menu" && "bg-accent text-accent-foreground"
            )}
          >
            <a href="/admin/menu">
              <span>{items[0]?.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Individual category links */}
        {items[0]?.items?.map((subItem) => (
          <SidebarMenuItem key={subItem.title}>
            <SidebarMenuButton
              asChild
              className={cn(
                "h-11 text-base font-medium",
                pathname === subItem.url && "bg-accent text-accent-foreground"
              )}
            >
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
            className="h-10 text-sm font-medium border border-border hover:bg-muted/50 mt-3"
          >
            <a href="#" className="flex items-center justify-center">
              <span>Create Item</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
