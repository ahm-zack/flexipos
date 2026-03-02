"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ArrowLeft,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProductGrid } from "./product-grid";
import { EditProductForm } from "./edit-product-form";
import { CreateProductForm } from "./create-product-form";
import { useDeleteProduct } from "../hooks/useProducts";
import type { Product } from "../services/product-supabase-service";

interface ProductManagementViewProps {
  products: Product[];
  isLoading?: boolean;
  categoryName?: string;
  businessId: string;
  categoryId?: string;
}

export function ProductManagementView({
  products,
  isLoading = false,
  categoryName,
  businessId,
  categoryId,
}: ProductManagementViewProps) {
  const router = useRouter();
  const deleteProductMutation = useDeleteProduct();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Filter products based on search term
  const filteredProducts =
    products?.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      toast.success(`${productToDelete.name} deleted successfully`);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.length - activeCount;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl flex-1" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {/* Back + header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/inventory")}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Categories
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {categoryName}&nbsp;Products
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage products, add new items, and update details.
            </p>
          </div>

          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold leading-none">
                {products.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold leading-none">{activeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <XCircle className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Inactive</p>
              <p className="text-lg font-bold leading-none">{inactiveCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mt-6">
          <ProductGrid
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{productToDelete?.name}
                &quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Product Form */}
        <CreateProductForm
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          businessId={businessId}
          categoryId={categoryId || products[0]?.categoryId || ""}
        />

        {/* Edit Product Form */}
        <EditProductForm
          product={productToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      </div>
    </div>
  );
}
