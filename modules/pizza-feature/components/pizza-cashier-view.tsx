"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PizzaGridSkeleton } from "@/components/ui/pizza-skeleton";
import { PizzaGrid } from "./pizza-grid";
import { usePizzas } from "../hooks/use-pizzas";

export function PizzaCashierView() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pizzas, isLoading, error } = usePizzas();

  // Filter pizzas based on search term
  const filteredPizzas =
    pizzas?.filter(
      (pizza) =>
        pizza.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error loading pizzas
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
          <h1 className="text-4xl font-bold mb-2 text-center">🍕 Pizza Menu</h1>
          <p className="text-muted-foreground text-center mb-6">
            Discover our delicious pizza selection
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pizzas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Pizza Grid - Cashier View (No management actions) */}
        {isLoading ? (
          <PizzaGridSkeleton count={6} />
        ) : (
          <PizzaGrid
            pizzas={filteredPizzas}
            showActions={false} // No edit/delete actions in cashier view
            showCartActions={true} // Show cart actions in cashier view
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
