"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieGridSkeleton } from "@/components/ui/pie-skeleton";
import { PieGrid } from "./pie-grid";
import { usePies } from "../hooks/use-pies";

export function PieCashierView() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pies, isLoading, error } = usePies();

  // Filter pies based on search term
  const filteredPies =
    pies?.filter(
      (pie) =>
        pie.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pie.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pie.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pie.size.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error loading pies
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
          <h1 className="text-4xl font-bold mb-2 text-center">🥧 Pie Menu</h1>
          <p className="text-muted-foreground text-center mb-6">
            Discover our delicious pie selection
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Pie Grid - Cashier View (No management actions) */}
        {isLoading ? (
          <PieGridSkeleton count={6} />
        ) : (
          <PieGrid
            pies={filteredPies}
            showActions={false} // No edit/delete actions in cashier view
            showCartActions={true} // Show cart actions in cashier view
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
