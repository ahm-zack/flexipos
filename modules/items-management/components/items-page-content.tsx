"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const menuCategories = [
  {
    id: "pizzas",
    name: "Pizzas",
    description: "Manage pizza menu items",
    href: "/admin/items/pizzas",
    colors:
      "bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700",
    textColor: "text-white",
  },
  {
    id: "pies",
    name: "Pies",
    description: "Manage pie menu items",
    href: "/admin/items/pies",
    colors:
      "bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700",
    textColor: "text-white",
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    description: "Manage sandwich menu items",
    href: "/admin/items/sandwiches",
    colors:
      "bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700",
    textColor: "text-white",
  },
  {
    id: "burgers",
    name: "Burgers",
    description: "Manage burger menu items",
    href: "/admin/items/burgers",
    colors:
      "bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700",
    textColor: "text-white",
  },
  {
    id: "beverages",
    name: "Beverages",
    description: "Manage beverage menu items",
    href: "/admin/items/beverages",
    colors:
      "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700",
    textColor: "text-white",
  },
  {
    id: "appetizers",
    name: "Appetizers",
    description: "Manage appetizer menu items",
    href: "/admin/items/appetizers",
    colors:
      "bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700",
    textColor: "text-white",
  },
  {
    id: "desserts",
    name: "Desserts",
    description: "Manage dessert menu items",
    href: "/admin/items/desserts",
    colors:
      "bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700",
    textColor: "text-white",
  },
  {
    id: "salads",
    name: "Salads",
    description: "Manage salad menu items",
    href: "/admin/items/salads",
    colors:
      "bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700",
    textColor: "text-white",
  },
  {
    id: "other",
    name: "Other Items",
    description: "Manage other menu items",
    href: "/admin/items/other",
    colors:
      "bg-gradient-to-br from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800",
    textColor: "text-white",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {menuCategories.map((category) => {
          return (
            <Link key={category.id} href={category.href}>
              <Card
                className={`
                  ${category.colors}
                  border-0
                  transition-all duration-300 ease-out
                  hover:shadow-2xl hover:shadow-black/20
                  hover:scale-105 hover:-translate-y-2
                  cursor-pointer 
                  h-40
                  group
                  overflow-hidden
                `}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-8 relative">
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                  {/* Content */}
                  <div className="relative z-10 text-center space-y-3">
                    <h3
                      className={`text-2xl font-bold ${category.textColor} group-hover:scale-105 transition-transform duration-200`}
                    >
                      {category.name}
                    </h3>
                    <p
                      className={`text-sm ${category.textColor} opacity-90 group-hover:opacity-100 transition-opacity duration-200 leading-relaxed`}
                    >
                      {category.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 group-hover:bg-white/50 transition-colors duration-200" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
