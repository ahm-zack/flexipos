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
import { AppetizerGrid } from "./appetizer-grid";
import { EditAppetizerForm } from "./edit-appetizer-form";
import { useAppetizers, useDeleteAppetizer } from "../hooks/use-appetizers";
import type { Appetizer } from "@/lib/db/schema";
import { CreateAppetizersForm } from "./create-appetizers-form";

export function AppetizerManagementView() {
  const { data: appetizers, isLoading, error } = useAppetizers("admin");
  const deleteAppetizerMutation = useDeleteAppetizer();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appetizerToDelete, setAppetizerToDelete] = useState<Appetizer | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [appetizerToEdit, setAppetizerToEdit] = useState<Appetizer | null>(
    null
  );

  const filteredAppetizers =
    appetizers?.filter(
      (appetizer) =>
        appetizer.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appetizer.nameAr.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (appetizer: Appetizer) => {
    setAppetizerToEdit(appetizer);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (appetizer: Appetizer) => {
    setAppetizerToDelete(appetizer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appetizerToDelete) return;
    try {
      await deleteAppetizerMutation.mutateAsync(appetizerToDelete.id);
      toast.success(`${appetizerToDelete.nameEn} deleted successfully`);
      setDeleteDialogOpen(false);
      setAppetizerToDelete(null);
    } catch (error) {
      toast.error("Failed to delete appetizer");
      console.error("Error deleting appetizer:", error);
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
              Error loading appetizers
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
          Appetizer Management
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Create, edit, and manage your delicious appetizer offerings
        </p>
      </div>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appetizers..."
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
                Add New Appetizer
              </Button>
            </div>
          </div>
          {/* Results Count */}
          {!isLoading && appetizers && (
            <div className="mb-6 text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredAppetizers.length} of {appetizers.length}{" "}
                  appetizers
                  {searchTerm && (
                    <span> matching &quot;{searchTerm}&quot;</span>
                  )}
                </>
              ) : (
                <>Showing all {appetizers.length} appetizers</>
              )}
            </div>
          )}
          {/* Appetizer Grid - Admin View (With management actions) */}
          <AppetizerGrid
            appetizers={filteredAppetizers}
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
                <DialogTitle>Delete Appetizer</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;
                  {appetizerToDelete?.nameEn}
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
                  disabled={deleteAppetizerMutation.isPending}
                >
                  {deleteAppetizerMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Create Appetizer Form */}
          <CreateAppetizersForm
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
          {/* Edit Appetizer Form */}
          <EditAppetizerForm
            appetizer={appetizerToEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </div>
      </div>
    </div>
  );
}
