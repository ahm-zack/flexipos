"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BurgerCashierCard } from "./burger-cashier-card";
import { useBurgers } from "../hooks/use-burgers";

export function BurgerCashierView() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: burgers, isLoading, error } = useBurgers("cashier");

  const filteredBurgers =
    burgers?.filter(
      (burger) =>
        burger.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        burger.nameAr.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-full mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error loading burgers
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
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-center">
            🍔 Burger Menu
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Discover our delicious burger selection
          </p>
          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search burgers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        {/* Burger Grid - Cashier View (No management actions) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-8 bg-gray-200 rounded w-24" />
                    <div className="h-10 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBurgers.map((burger) => (
              <BurgerCashierCard key={burger.id} burger={burger} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
