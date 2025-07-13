"use client";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/hooks/useSearchStore";
import {
  useMenuPrefetch,
  useAdjacentMenuPrefetch,
} from "@/hooks/use-menu-prefetch";
import React, { useEffect } from "react";

const MENU_CONFIG: Record<
  string,
  { header: string; desc: string; placeholder: string; icon?: React.ReactNode }
> = {
  "/admin/menu/sandwich": {
    header: "🥪 Sandwich Menu",
    desc: "Discover our delicious sandwich selection",
    placeholder: "Search sandwiches...",
  },
  "/admin/menu/pizza": {
    header: "🍕 Pizza Menu",
    desc: "Explore our pizza varieties",
    placeholder: "Search pizzas...",
  },
  "/admin/menu/pie": {
    header: "🥧 Pie Menu",
    desc: "Try our fresh pies",
    placeholder: "Search pies...",
  },
  "/admin/menu/mini-pie": {
    header: "🥟 Mini Pie Menu",
    desc: "Mini pies for every taste",
    placeholder: "Search mini pies...",
  },
  // Add more menu configs as needed
};

export default function MenuProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setSearchTerm, searchTerm } = useSearchStore();
  const { prefetchAllMenus } = useMenuPrefetch();

  // Extract category from pathname for adjacent prefetching
  const currentCategory = pathname.split("/").pop() || "";
  useAdjacentMenuPrefetch(currentCategory);

  const config = MENU_CONFIG[pathname] || {
    header: "Menu",
    desc: "Browse our menu",
    placeholder: "Search...",
  };

  // Prefetch all menu data when entering menu section
  useEffect(() => {
    prefetchAllMenus();
  }, [prefetchAllMenus]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center">
            {config.header}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
            {config.desc}
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={config.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
