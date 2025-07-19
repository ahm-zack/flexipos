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
import { SidesGrid } from "./sides-grid";
import { EditSidesForm } from "./edit-sides-form";
import { useSides, useDeleteSide } from "../hooks/use-sides";
import type { SideOrder } from "@/lib/db/schema";
import { CreateSidesForm } from "./create-sides-form";

export function SidesManagementView() {
  const { data: sides, isLoading, error } = useSides("admin");
  const deleteSideMutation = useDeleteSide();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sideToDelete, setSideToDelete] = useState<SideOrder | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sideToEdit, setSideToEdit] = useState<SideOrder | null>(null);

  const filteredSides =
    sides?.filter(
      (side) =>
        side.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        side.nameAr.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (side: SideOrder) => {
    setSideToEdit(side);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (side: SideOrder) => {
    setSideToDelete(side);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sideToDelete) return;
    try {
      await deleteSideMutation.mutateAsync(sideToDelete.id);
      toast.success(`${sideToDelete.nameEn} deleted successfully`);
      setDeleteDialogOpen(false);
      setSideToDelete(null);
    } catch (error) {
      toast.error("Failed to delete side");
      console.error("Error deleting side:", error);
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
              Error loading sides
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
        <h1 className="text-5xl font-bold tracking-tight">Sides Management</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Create, edit, and manage your delicious sides offerings
        </p>
      </div>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sides..."
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
                Add New Side
              </Button>
            </div>
          </div>
          {/* Results Count */}
          {!isLoading && sides && (
            <div className="mb-6 text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredSides.length} of {sides.length} sides
                  {searchTerm && (
                    <span> matching &quot;{searchTerm}&quot;</span>
                  )}
                </>
              ) : (
                <>Showing all {sides.length} sides</>
              )}
            </div>
          )}
          {/* Sides Grid - Admin View (With management actions) */}
          <SidesGrid
            sides={filteredSides}
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
                <DialogTitle>Delete Side</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;
                  {sideToDelete?.nameEn}
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
                  disabled={deleteSideMutation.isPending}
                >
                  {deleteSideMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Create Side Form */}
          <CreateSidesForm
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
          {/* Edit Side Form */}
          <EditSidesForm
            side={sideToEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </div>
      </div>
    </div>
  );
}
