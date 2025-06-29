"use client";

import { useCart } from "@/modules/cart";
import { PriceDisplay } from "@/components/currency";
import type { CartItem } from "@/modules/cart/types/cart.types";

export default function BurgerPage() {
  const { addItem } = useCart();

  const handleAddToCart = (item: Omit<CartItem, "quantity">) => {
    addItem(item);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🍔 Burger Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "burger-classic",
                name: "Classic Burger",
                price: 11.99,
                category: "Burger",
                description: "Beef patty, lettuce, tomato, onion",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Classic Burger</h2>
            <p className="text-muted-foreground mb-4">
              Beef patty, lettuce, tomato, onion
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
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "burger-cheese",
                name: "Cheese Burger",
                price: 12.99,
                category: "Burger",
                description: "Classic burger with cheese",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Cheese Burger</h2>
            <p className="text-muted-foreground mb-4">
              Classic burger with cheese,ketchup
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={12.99}
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
                id: "burger-bacon",
                name: "Bacon Burger",
                price: 14.99,
                category: "Burger",
                description: "Cheese burger with crispy bacon",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Bacon Burger</h2>
            <p className="text-muted-foreground mb-4">
              Cheese burger with crispy bacon
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={14.99}
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
