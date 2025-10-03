"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";
import { ProductGrid } from "./product-grid";
import type { Product } from "../services/product-client-service";

interface ProductManagementViewProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: Product) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
  categoryName?: string;
}

export function ProductManagementView({
  products,
  onEdit,
  onDelete,
  onView,
  onCreateNew,
  isLoading = false,
  categoryName,
}: ProductManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Filter products based on search and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? product.isActive
        : !product.isActive;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-80 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {categoryName ? `${categoryName} Products` : "Product Management"}
          </h2>
          <p className="text-muted-foreground">
            Manage your products, prices, and availability
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Products</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Showing {filteredProducts.length} of {products.length} products
        </span>
        {searchQuery && (
          <span>Search results for &ldquo;{searchQuery}&rdquo;</span>
        )}
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={filteredProducts}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    </div>
  );
}
