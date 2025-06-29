"use client";

import { useCart } from "@/modules/cart";
import { PriceDisplay } from "@/components/currency";
import type { CartItem } from "@/modules/cart/types/cart.types";

export default function AppetizersPage() {
  const { addItem } = useCart();

  const handleAddToCart = (item: Omit<CartItem, "quantity">) => {
    addItem(item);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          🥗 Appetizers Menu
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() =>
              handleAddToCart({
                id: "appetizer-mozzarella-sticks",
                name: "Mozzarella Sticks",
                price: 8.99,
                category: "Appetizers",
                description: "Crispy breaded mozzarella with marinara sauce",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Mozzarella Sticks</h2>
            <p className="text-muted-foreground mb-4">
              Crispy breaded mozzarella with marinara sauce
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
                id: "appetizer-buffalo-wings",
                name: "Buffalo Wings",
                price: 12.99,
                category: "Appetizers",
                description: "Spicy chicken wings with ranch dressing",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Buffalo Wings</h2>
            <p className="text-muted-foreground mb-4">
              Spicy chicken wings with ranch dressing
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
                id: "appetizer-nachos-supreme",
                name: "Nachos Supreme",
                price: 10.99,
                category: "Appetizers",
                description: "Tortilla chips with cheese, jalapeños, and salsa",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Nachos Supreme</h2>
            <p className="text-muted-foreground mb-4">
              Tortilla chips with cheese, jalapeños, and salsa
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
                id: "appetizer-onion-rings",
                name: "Onion Rings",
                price: 7.99,
                category: "Appetizers",
                description: "Golden crispy onion rings with dipping sauce",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Onion Rings</h2>
            <p className="text-muted-foreground mb-4">
              Golden crispy onion rings with dipping sauce
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={7.99}
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
                id: "appetizer-loaded-potato-skins",
                name: "Loaded Potato Skins",
                price: 9.99,
                category: "Appetizers",
                description: "Potato skins with cheese, bacon, and sour cream",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Loaded Potato Skins</h2>
            <p className="text-muted-foreground mb-4">
              Potato skins with cheese, bacon, and sour cream
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
                id: "appetizer-jalapeno-poppers",
                name: "Jalapeño Poppers",
                price: 8.49,
                category: "Appetizers",
                description:
                  "Stuffed jalapeños with cream cheese, breaded and fried",
              })
            }
          >
            <h2 className="text-2xl font-semibold mb-2">Jalapeño Poppers</h2>
            <p className="text-muted-foreground mb-4">
              Stuffed jalapeños with cream cheese, breaded and fried
            </p>
            <p className="text-3xl font-bold text-primary">
              <PriceDisplay
                price={8.49}
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
