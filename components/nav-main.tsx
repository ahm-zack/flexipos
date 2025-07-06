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
    url?: string;
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
        {/* Menu Label - non-clickable section header */}
        <SidebarMenuItem>
          <div className="h-12 text-lg font-semibold flex items-center px-3 text-sidebar-foreground/70 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-data-[collapsible=icon]:opacity-0">
            <span>{items[0]?.title}</span>
          </div>
        </SidebarMenuItem>

        {/* Individual category links */}
        {items[0]?.items?.map((subItem) => (
          <SidebarMenuItem key={subItem.title}>
            <SidebarMenuButton
              asChild
              className={cn(
                "h-11 text-base font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                pathname === subItem.url && "bg-accent text-accent-foreground"
              )}
            >
              <a href={subItem.url}>
                <span className="transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-data-[collapsible=icon]:opacity-0">
                  {subItem.title}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
