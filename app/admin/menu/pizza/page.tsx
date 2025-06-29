"use client";

import { useCart } from "@/modules/cart";
import { PriceDisplay } from "@/components/currency";
import type { CartItem } from "@/modules/cart/types/cart.types";

export default function PizzaPage() {
  const { addItem } = useCart();

  const handleAddToCart = (item: Omit<CartItem, "quantity">) => {
    addItem(item);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🍕 Pizza Menu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "pizza-margherita",
                name: "Margherita Pizza",
                price: 12.99,
                category: "Pizza",
                description: "Fresh tomatoes, mozzarella, basil",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Margherita</h2>
            <p className="text-muted-foreground mb-4">
              Fresh tomatoes, mozzarella, basil
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
                id: "pizza-pepperoni",
                name: "Pepperoni Pizza",
                price: 14.99,
                category: "Pizza",
                description: "Pepperoni, mozzarella, tomato sauce",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Pepperoni</h2>
            <p className="text-muted-foreground mb-4">
              Pepperoni, mozzarella, tomato sauce
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
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "pizza-supreme",
                name: "Supreme Pizza",
                price: 16.99,
                category: "Pizza",
                description: "Pepperoni, sausage, peppers, onions",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Supreme</h2>
            <p className="text-muted-foreground mb-4">
              Pepperoni, sausage, peppers, onions
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={16.99}
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
