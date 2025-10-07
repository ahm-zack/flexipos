"use client";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchStore } from "@/hooks/useSearchStore";
import React from "react";

// Disabled old menu hooks to prevent pizza/pie API calls
// import {
//   useMenuPrefetch,
//   useAdjacentMenuPrefetch,
// } from "@/hooks/use-menu-prefetch";
// import { useMenu } from "@/modules/menu/hooks/useMenu";

// Helper function to generate dynamic menu config
const generateDynamicConfig = (categorySlug: string) => {
  const formattedName = categorySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    header: formattedName,
    desc: `Browse our ${formattedName.toLowerCase()} selection`,
    placeholder: `Search ${formattedName.toLowerCase()}...`,
  };
};

export default function MenuProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setSearchTerm, searchTerm, setCurrentCategory } = useSearchStore();

  // Extract category from pathname dynamically
  const categorySlug = pathname.split("/").pop() || "";

  // Set current category when pathname changes
  React.useEffect(() => {
    setCurrentCategory(categorySlug);
  }, [categorySlug, setCurrentCategory]);

  // Generate dynamic config based on category slug
  const config = generateDynamicConfig(categorySlug);

  // Disabled old menu prefetching
  // useEffect(() => {
  //   prefetchAllMenus();
  // }, [prefetchAllMenus]);
  // useMenu();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex gap-4 items-center">
          {/* <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-center">
            {config.header}
          </h1> */}

          {/* Search Bar */}
          <div className="flex justify-center w-full max-w-md">
            <div className="relative w-full">
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
