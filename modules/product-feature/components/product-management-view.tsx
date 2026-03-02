"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("menu");
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
      toast.success(t("toasts.deleteSuccess", { name: productToDelete.name }));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(t("toasts.deleteFailed"));
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
            {t("allCategories")}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {t("categoryProducts", { name: categoryName ?? "" })}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("manageProductsDesc")}
            </p>
          </div>

          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("addProduct")}
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3 max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t("total")}</p>
              <p className="text-lg font-bold leading-none">
                {products.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t("status.active")}
              </p>
              <p className="text-lg font-bold leading-none">{activeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
            <XCircle className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t("status.inactive")}
              </p>
              <p className="text-lg font-bold leading-none">{inactiveCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("searchProducts")}
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
              <DialogTitle>{t("confirmDeleteProductTitle")}</DialogTitle>
              <DialogDescription>
                {t("confirmDeleteProductDesc", {
                  name: productToDelete?.name ?? "",
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? t("deleting") : t("delete")}
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
