"use client";

import { useCart } from "@/modules/cart";
import { PriceDisplay } from "@/components/currency";
import type { CartItem } from "@/modules/cart/types/cart.types";

export default function ShawermaPage() {
  const { addItem } = useCart();

  const handleAddToCart = (item: Omit<CartItem, "quantity">) => {
    addItem(item);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          🌯 Shawerma Menu
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "shawerma-chicken",
                name: "Chicken Shawerma",
                price: 9.99,
                category: "Shawerma",
                description: "Grilled chicken with garlic sauce",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Chicken Shawerma</h2>
            <p className="text-muted-foreground mb-4">
              Grilled chicken with garlic sauce
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
                id: "shawerma-beef",
                name: "Beef Shawerma",
                price: 10.99,
                category: "Shawerma",
                description: "Seasoned beef with tahini",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Beef Shawerma</h2>
            <p className="text-muted-foreground mb-4">
              Seasoned beef with tahini
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
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "shawerma-mixed",
                name: "Mixed Shawerma",
                price: 11.99,
                category: "Shawerma",
                description: "Chicken and beef combination",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Mixed Shawerma</h2>
            <p className="text-muted-foreground mb-4">
              Chicken and beef combination
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={11.99}
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
