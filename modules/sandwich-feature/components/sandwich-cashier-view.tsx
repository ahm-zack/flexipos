"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SandwichGridSkeleton } from "@/components/ui/sandwich-skeleton";
import { SandwichGrid } from "./sandwich-grid";
import { useSearchStore } from "../hooks/use-sandwiches";
import type { Sandwich } from "@/lib/db/schema";

export function SandwichCashierView() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sandwiches, isLoading, error } = useSearchStore("cashier");

  // Filter sandwiches based on search term
  const filteredSandwiches =
    sandwiches?.filter(
      (sandwich: Sandwich) =>
        sandwich.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sandwich.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sandwich.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sandwich.size.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-full mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error loading sandwiches
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-center">
            🥪 Sandwich Menu
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
            Discover our delicious sandwich selection
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sandwiches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Sandwich Grid - Cashier View (No management actions) */}
        {isLoading ? (
          <SandwichGridSkeleton count={6} />
        ) : (
          <SandwichGrid
            sandwiches={filteredSandwiches}
            showActions={false} // No edit/delete actions in cashier view
            showCartActions={true} // Show cart actions in cashier view
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
