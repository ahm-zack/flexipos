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
    <div className="p-4 sm:p-6 lg:p-0">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8 space-y-6">
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              {config.header} Menu
            </h1>
            {/* <p className="text-muted-foreground text-lg">
              Discover our amazing {config.header.toLowerCase()} selection
            </p> */}
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-sm"></div>
              <div className="relative bg-background/80 backdrop-blur-sm border-2 border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={config.placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-10 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 text-xl font-light"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
