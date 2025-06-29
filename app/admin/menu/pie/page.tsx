"use client";

import { useCart } from "@/modules/cart";
import { PriceDisplay } from "@/components/currency";
import type { CartItem } from "@/modules/cart/types/cart.types";

export default function PiePage() {
  const { addItem } = useCart();

  const handleAddToCart = (item: Omit<CartItem, "quantity">) => {
    addItem(item);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🥧 Pie Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "pie-apple",
                name: "Apple Pie",
                price: 8.99,
                category: "Pie",
                description: "Fresh apples with cinnamon",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Apple Pie</h2>
            <p className="text-muted-foreground mb-4">
              Fresh apples with cinnamon
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={8.99}
                symbolSize={20}
                variant="primary"
                className="text-3xl font-bold"
              />
            </p>
          </div>
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "pie-cherry",
                name: "Cherry Pie",
                price: 9.99,
                category: "Pie",
                description: "Sweet cherries in flaky crust",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Cherry Pie</h2>
            <p className="text-muted-foreground mb-4">
              Sweet cherries in flaky crust
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={9.99}
                symbolSize={20}
                variant="primary"
                className="text-3xl font-bold"
              />
            </p>
          </div>
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "pie-pecan",
                name: "Pecan Pie",
                price: 10.99,
                category: "Pie",
                description: "Rich pecans with caramel",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Pecan Pie</h2>
            <p className="text-muted-foreground mb-4">
              Rich pecans with caramel
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={10.99}
                symbolSize={20}
                variant="primary"
                className="text-3xl font-bold"
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
