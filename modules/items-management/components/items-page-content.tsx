"use client";

import { useState } from "react";
import { ItemsSearchBar } from "./items-search-bar";
import { CreateItemButton } from "./create-item-button";
import { ItemsGrid } from "./items-grid";
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

  const handleCreateItem = () => {
    console.log("Create new item");
    // TODO: Implement create item functionality
  };

  const handleEditItem = (item: MenuItem) => {
    console.log("Edit item:", item);
    // TODO: Implement edit item functionality
  };

  const handleDeleteItem = (itemId: string) => {
    console.log("Delete item:", itemId);
    // TODO: Implement delete item functionality
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Items Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your menu items, pricing, and availability
          </p>
        </div>
      </div>

      {/* Search Bar and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <ItemsSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search items by name, description, or category..."
        />
        <CreateItemButton onClick={handleCreateItem} />
      </div>

      {/* Items Grid */}
      <ItemsGrid
        items={filteredItems}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />
    </div>
  );
}
