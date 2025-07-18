"use client";

import { useState } from "react";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BeverageGrid } from "./beverage-grid";
import { EditBeverageForm } from "./edit-beverage-form";
import { useBeverages, useDeleteBeverage } from "../hooks/use-beverages";
import type { Beverage } from "@/lib/db/schema";
import { CreateBeveragesForm } from "./create-beverages-form";

export function BeverageManagementView() {
  const { data: beverages, isLoading, error } = useBeverages("admin");
  const deleteBeverageMutation = useDeleteBeverage();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [beverageToDelete, setBeverageToDelete] = useState<Beverage | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [beverageToEdit, setBeverageToEdit] = useState<Beverage | null>(null);

  const filteredBeverages =
    beverages?.filter(
      (beverage) =>
        beverage.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beverage.nameAr.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (beverage: Beverage) => {
    setBeverageToEdit(beverage);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (beverage: Beverage) => {
    setBeverageToDelete(beverage);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!beverageToDelete) return;
    try {
      await deleteBeverageMutation.mutateAsync(beverageToDelete.id);
      toast.success(`${beverageToDelete.nameEn} deleted successfully`);
      setDeleteDialogOpen(false);
      setBeverageToDelete(null);
    } catch (error) {
      toast.error("Failed to delete beverage");
      console.error("Error deleting beverage:", error);
    }
  };

  const handleCreateNew = () => {
    setCreateDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Error loading beverages
            </h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Beverage Management
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Create, edit, and manage your beverage offerings
        </p>
      </div>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search beverages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateNew}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Beverage
              </Button>
            </div>
          </div>
          {/* Results Count */}
          {!isLoading && beverages && (
            <div className="mb-6 text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredBeverages.length} of {beverages.length}{" "}
                  beverages
                  {searchTerm && (
                    <span> matching &quot;{searchTerm}&quot;</span>
                  )}
                </>
              ) : (
                <>Showing all {beverages.length} beverages</>
              )}
            </div>
          )}
          {/* Beverage Grid - Admin View (With management actions) */}
          <BeverageGrid
            beverages={filteredBeverages}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            showActions={true}
            isLoading={isLoading}
          />
          {/* Back Button - Placed after cards */}
          <div className="flex justify-center mt-12 pt-8 border-t">
            <Link href="/admin/items">
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Items
              </Button>
            </Link>
          </div>
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Beverage</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;
                  {beverageToDelete?.nameEn}
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
                  disabled={deleteBeverageMutation.isPending}
                >
                  {deleteBeverageMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Create Beverage Form */}
          <CreateBeveragesForm
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
          {/* Edit Beverage Form */}
          <EditBeverageForm
            beverage={beverageToEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </div>
      </div>
    </div>
  );
}
