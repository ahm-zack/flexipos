"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemsSearchBar } from "./items-search-bar";
import { CreateItemButton } from "./create-item-button";
import { ItemsGrid } from "./items-grid";
import { PizzaManagementView } from "@/modules/pizza-feature";
import { type MenuItem } from "./item-card";

// Sample data - in real app this would come from API/database
const sampleItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description:
      "Classic Italian pizza with fresh mozzarella, tomato sauce, and basil leaves",
    price: 24.99,
    category: "Pizza",
    inStock: true,
  },
  {
    id: "2",
    name: "Chicken Burger",
    description:
      "Grilled chicken breast with lettuce, tomato, and mayo on a sesame bun",
    price: 16.5,
    category: "Burger",
    inStock: true,
  },
  {
    id: "3",
    name: "Arabic Coffee",
    description:
      "Traditional Arabic coffee served with dates and a touch of cardamom",
    price: 8.75,
    category: "Beverages",
    inStock: false,
  },
];

export function ItemsPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items] = useState<MenuItem[]>(sampleItems);

  // Filter items based on search term
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Items Management</h1>
        <p className="text-muted-foreground">
          Manage all your menu items in one place
        </p>
      </div>

      <Tabs defaultValue="pizzas" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="pizzas">Pizzas</TabsTrigger>
          <TabsTrigger value="burgers">Burgers</TabsTrigger>
          <TabsTrigger value="beverages">Beverages</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="pizzas" className="mt-6">
          <PizzaManagementView />
        </TabsContent>

        <TabsContent value="burgers" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Burger Management</h2>
                <p className="text-muted-foreground">
                  Manage your burger menu items
                </p>
              </div>
              <CreateItemButton onClick={() => console.log("Create burger")} />
            </div>
            <ItemsSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search burgers..."
            />
            <ItemsGrid
              items={filteredItems.filter((item) => item.category === "Burger")}
              onEditItem={(item) => console.log("Edit item:", item)}
              onDeleteItem={(id) => console.log("Delete item:", id)}
            />
          </div>
        </TabsContent>

        <TabsContent value="beverages" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Beverage Management</h2>
                <p className="text-muted-foreground">
                  Manage your beverage menu items
                </p>
              </div>
              <CreateItemButton
                onClick={() => console.log("Create beverage")}
              />
            </div>
            <ItemsSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search beverages..."
            />
            <ItemsGrid
              items={filteredItems.filter(
                (item) => item.category === "Beverages"
              )}
              onEditItem={(item) => console.log("Edit item:", item)}
              onDeleteItem={(id) => console.log("Delete item:", id)}
            />
          </div>
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Other Items</h2>
                <p className="text-muted-foreground">
                  Manage all other menu items
                </p>
              </div>
              <CreateItemButton
                onClick={() => console.log("Create other item")}
              />
            </div>
            <ItemsSearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search other items..."
            />
            <ItemsGrid
              items={filteredItems.filter(
                (item) =>
                  !["Pizza", "Burger", "Beverages"].includes(item.category)
              )}
              onEditItem={(item) => console.log("Edit item:", item)}
              onDeleteItem={(id) => console.log("Delete item:", id)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
