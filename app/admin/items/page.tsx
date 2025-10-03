"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/modules/product-feature";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Loader2, ArrowRight } from "lucide-react";

const DEFAULT_BUSINESS_ID = "default-business-id";

export default function ItemsManagementPage() {
  const router = useRouter();
  const { data: categories = [], isLoading } = useCategories(
    DEFAULT_BUSINESS_ID,
    "admin"
  );

  // If there's only one category, redirect to it
  useEffect(() => {
    if (categories.length === 1) {
      router.push(`/admin/items/${categories[0].slug}`);
    }
  }, [categories, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <div>
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
          <p className="text-muted-foreground">
            Create categories first to manage products.
          </p>
        </div>
      </div>
    );
  }

  // If multiple categories, show selection
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Items Management</h1>
        <p className="text-muted-foreground">
          Select a category to manage its products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{category.name}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {category.description || "Manage products in this category"}
              </p>
              <Button
                onClick={() => router.push(`/admin/items/${category.slug}`)}
                className="w-full"
              >
                Manage Products
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
