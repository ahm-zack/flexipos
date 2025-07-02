"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const menuCategories = [
  {
    id: "pizzas",
    name: "Pizzas",
    description: "Manage pizza menu items",
    href: "/admin/items/pizzas",
  },
  {
    id: "pies",
    name: "Pies",
    description: "Manage pie menu items",
    href: "/admin/items/pies",
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    description: "Manage sandwich menu items",
    href: "/admin/items/sandwiches",
  },
  {
    id: "mini-pies",
    name: "Mini Pies",
    description: "Manage mini pie menu items (Party Only)",
    href: "/admin/items/mini-pies",
  },
  {
    id: "burgers",
    name: "Burgers",
    description: "Manage burger menu items",
    href: "/admin/items/burgers",
  },
  {
    id: "beverages",
    name: "Beverages",
    description: "Manage beverage menu items",
    href: "/admin/items/beverages",
  },
  {
    id: "appetizers",
    name: "Appetizers",
    description: "Manage appetizer menu items",
    href: "/admin/items/appetizers",
  },
  {
    id: "shawerma",
    name: "Shawerma",
    description: "Manage shawerma menu items",
    href: "/admin/items/shawerma",
  },
  {
    id: "side orders",
    name: "Side Orders",
    description: "Manage side orders menu items",
    href: "/admin/items/side-orders",
  },
];

export function ItemsPageContent() {
  return (
    <div className="space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Items Management</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Choose a category to manage your menu items with ease
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto px-4">
        {menuCategories.map((category) => {
          return (
            <Link key={category.id} href={category.href}>
              <Card
                className="
                  bg-card
                  border-0
                  transition-all duration-300 ease-out
                  hover:shadow-2xl hover:shadow-black/20
                  hover:scale-105 hover:-translate-y-2
                  cursor-pointer 
                  h-40
                  group
                  overflow-hidden
                "
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-8 relative">
                  {/* Content */}
                  <div className="relative z-10 text-center space-y-3">
                    <h3 className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform duration-200">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground opacity-90 group-hover:opacity-100 transition-opacity duration-200 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
