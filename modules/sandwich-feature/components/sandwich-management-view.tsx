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
import { SandwichGrid } from "./sandwich-grid";
import { CreateSandwichForm } from "./create-sandwich-form";
import { EditSandwichForm } from "./edit-sandwich-form";
import { useSearchStore, useDeleteSandwich } from "../hooks/use-sandwiches";
import type { Sandwich } from "@/lib/db/schema";

export function SandwichManagementView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sandwichToDelete, setSandwichToDelete] = useState<Sandwich | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sandwichToEdit, setSandwichToEdit] = useState<Sandwich | null>(null);

  const { data: sandwiches, isLoading, error } = useSearchStore("admin");
  const deleteSandwichMutation = useDeleteSandwich();

  // Filter sandwiches based on search term
  const filteredSandwiches =
    sandwiches?.filter(
      (sandwich: Sandwich) =>
        sandwich.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sandwich.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sandwich.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sandwich.size.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (sandwich: Sandwich) => {
    setSandwichToEdit(sandwich);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (sandwich: Sandwich) => {
    setSandwichToDelete(sandwich);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sandwichToDelete) return;

    try {
      await deleteSandwichMutation.mutateAsync(sandwichToDelete.id);
      toast.success(`${sandwichToDelete.type} Sandwich deleted successfully`);
      setDeleteDialogOpen(false);
      setSandwichToDelete(null);
    } catch (error) {
      toast.error("Failed to delete sandwich");
      console.error("Error deleting sandwich:", error);
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
              Error loading sandwiches
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
          Sandwich Management
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Create, edit, and manage your delicious sandwich offerings
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sandwiches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              onClick={handleCreateNew}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Sandwich
            </Button>
          </div>

          {/* Results Count */}
          {!isLoading && sandwiches && (
            <div className="mb-6 text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredSandwiches.length} of {sandwiches.length}{" "}
                  sandwiches
                  {searchTerm && (
                    <span> matching &quot;{searchTerm}&quot;</span>
                  )}
                </>
              ) : (
                <>Showing all {sandwiches.length} sandwiches</>
              )}
            </div>
          )}

          {/* Sandwich Grid - Admin View (With management actions, NO cart actions) */}
          <SandwichGrid
            sandwiches={filteredSandwiches}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            showActions={true} // Full management actions in admin view
            showCartActions={false} // No cart actions in admin view
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
                <DialogTitle>Delete Sandwich</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{sandwichToDelete?.type}{" "}
                  Sandwich&quot;? This action cannot be undone.
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
                  disabled={deleteSandwichMutation.isPending}
                >
                  {deleteSandwichMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Sandwich Form */}
          <CreateSandwichForm
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />

          {/* Edit Sandwich Form */}
          {sandwichToEdit && (
            <EditSandwichForm
              sandwich={sandwichToEdit}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
}
