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
import { useMenu } from "@/modules/menu/hooks/useMenu";

const MENU_CONFIG: Record<
  string,
  { header: string; desc: string; placeholder: string; icon?: React.ReactNode }
> = {
  "/admin/menu/appetizers": {
    header: "🥨 Appetizers Menu",
    desc: "Start your meal with our appetizers",
    placeholder: "Search appetizers...",
  },
  "/admin/menu/beverages": {
    header: "🥤 Beverages Menu",
    desc: "Refresh yourself with our drinks",
    placeholder: "Search beverages...",
  },
  "/admin/menu/burger": {
    header: "🍔 Burgers Menu",
    desc: "Juicy burgers made to perfection",
    placeholder: "Search burgers...",
  },
  "/admin/menu/sandwich": {
    header: "🥪 Sandwiches Menu",
    desc: "Discover our delicious sandwich selection",
    placeholder: "Search sandwiches...",
  },
  "/admin/menu/shawerma": {
    header: "🌯 Shawermas Menu",
    desc: "Authentic shawerma varieties",
    placeholder: "Search shawermas...",
  },
  "/admin/menu/pizza": {
    header: "🍕 Pizzas Menu",
    desc: "Explore our pizza varieties",
    placeholder: "Search pizzas...",
  },
  "/admin/menu/pie": {
    header: "🥧 Pies Menu",
    desc: "Try our fresh pies",
    placeholder: "Search pies...",
  },
  "/admin/menu/mini-pie": {
    header: "🥟 Mini Pies Menu",
    desc: "Mini pies for every taste",
    placeholder: "Search mini pies...",
  },
  "/admin/menu/side-order": {
    header: "🍟 Side Orders Menu",
    desc: "Complete your meal with our sides",
    placeholder: "Search side orders...",
  },
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

  useMenu();

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
