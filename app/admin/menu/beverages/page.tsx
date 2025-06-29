"use client";

import { useCart } from "@/modules/cart";
import { PriceDisplay } from "@/components/currency";
import type { CartItem } from "@/modules/cart/types/cart.types";

export default function BeveragesPage() {
  const { addItem } = useCart();

  const handleAddToCart = (item: Omit<CartItem, "quantity">) => {
    addItem(item);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">☕ Beverages</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "beverage-coffee",
                name: "Coffee",
                price: 2.99,
                category: "Beverages",
                description: "Fresh brewed coffee",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Coffee</h2>
            <p className="text-muted-foreground mb-4">Fresh brewed coffee</p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={2.99}
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
                id: "beverage-soft-drinks",
                name: "Soft Drinks",
                price: 1.99,
                category: "Beverages",
                description: "Coke, Pepsi, Sprite, Orange",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Soft Drinks</h2>
            <p className="text-muted-foreground mb-4">
              Coke, Pepsi, Sprite, Orange
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={1.99}
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
                id: "beverage-fresh-juice",
                name: "Fresh Juice",
                price: 3.99,
                category: "Beverages",
                description: "Orange, Apple, Mixed Berry",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Fresh Juice</h2>
            <p className="text-muted-foreground mb-4">
              Orange, Apple, Mixed Berry
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={3.99}
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
