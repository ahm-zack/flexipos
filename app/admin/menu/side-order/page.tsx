"use client";

import { useCart } from "@/modules/cart";
import { PriceDisplay } from "@/components/currency";
import type { CartItem } from "@/modules/cart/types/cart.types";

export default function SideOrderPage() {
  const { addItem } = useCart();

  const handleAddToCart = (item: Omit<CartItem, "quantity">) => {
    addItem(item);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🍟 Side Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "side-french-fries",
                name: "French Fries",
                price: 4.99,
                category: "Side Orders",
                description: "Crispy golden fries",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">French Fries</h2>
            <p className="text-muted-foreground mb-4">Crispy golden fries</p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={4.99}
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
                id: "side-onion-rings",
                name: "Onion Rings",
                price: 5.99,
                category: "Side Orders",
                description: "Battered and fried onion rings",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Onion Rings</h2>
            <p className="text-muted-foreground mb-4">
              Battered and fried onion rings
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={5.99}
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
                id: "side-mozzarella-sticks",
                name: "Mozzarella Sticks",
                price: 6.99,
                category: "Side Orders",
                description: "Breaded mozzarella with marinara",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Mozzarella Sticks</h2>
            <p className="text-muted-foreground mb-4">
              Breaded mozzarella with marinara
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={6.99}
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
