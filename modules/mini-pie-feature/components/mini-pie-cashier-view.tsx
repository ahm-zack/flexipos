"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MiniPieGridSkeleton } from "@/components/ui/mini-pie-skeleton";
import { MiniPieGrid } from "./mini-pie-grid";
import { useMiniPies } from "../hooks/use-mini-pies";
import type { MiniPie } from "@/lib/db/schema";

export function MiniPieCashierView() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: miniPies, isLoading, error } = useMiniPies();

  // Filter mini pies based on search term
  const filteredMiniPies =
    miniPies?.filter(
      (miniPie: MiniPie) =>
        miniPie.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniPie.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniPie.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniPie.size.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error loading mini pies
            </h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">
            🥧 Mini Pie Menu
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            Discover our delicious mini pie selection - perfect for parties!
          </p>
          <p className="text-purple-700 font-medium text-center mb-6">
            ✨ Party Only Items ✨
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mini pies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Mini Pie Grid - Cashier View (No management actions) */}
        {isLoading ? (
          <MiniPieGridSkeleton count={6} />
        ) : (
          <MiniPieGrid
            miniPies={filteredMiniPies}
            showActions={false} // No edit/delete actions in cashier view
            showCartActions={true} // Show cart actions in cashier view
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
