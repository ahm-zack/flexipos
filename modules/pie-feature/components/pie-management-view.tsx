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
import { PieGrid } from "./pie-grid";
import { CreatePieForm } from "./create-pie-form";
import { EditPieForm } from "./edit-pie-form";
import { usePies, useDeletePie } from "../hooks/use-pies";
import type { Pie } from "@/lib/db/schema";

export function PieManagementView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pieToDelete, setPieToDelete] = useState<Pie | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pieToEdit, setPieToEdit] = useState<Pie | null>(null);

  const { data: pies, isLoading, error } = usePies();
  const deletePieMutation = useDeletePie();

  // Filter pies based on search term
  const filteredPies =
    pies?.filter(
      (pie) =>
        pie.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pie.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pie.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pie.size.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (pie: Pie) => {
    setPieToEdit(pie);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (pie: Pie) => {
    setPieToDelete(pie);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pieToDelete) return;

    try {
      await deletePieMutation.mutateAsync(pieToDelete.id);
      toast.success(`${pieToDelete.type} Pie deleted successfully`);
      setDeleteDialogOpen(false);
      setPieToDelete(null);
    } catch (error) {
      toast.error("Failed to delete pie");
      console.error("Error deleting pie:", error);
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
              Error loading pies
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
        <h1 className="text-5xl font-bold tracking-tight">Pie Management</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Create, edit, and manage your delicious pie offerings
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pies..."
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
              Add New Pie
            </Button>
          </div>

          {/* Results Count */}
          {!isLoading && pies && (
            <div className="mb-6 text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredPies.length} of {pies.length} pies
                  {searchTerm && (
                    <span> matching &quot;{searchTerm}&quot;</span>
                  )}
                </>
              ) : (
                <>Showing all {pies.length} pies</>
              )}
            </div>
          )}

          {/* Pie Grid - Admin View (With management actions, NO cart actions) */}
          <PieGrid
            pies={filteredPies}
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
                <DialogTitle>Delete Pie</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{pieToDelete?.type}{" "}
                  Pie&quot;? This action cannot be undone.
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
                  disabled={deletePieMutation.isPending}
                >
                  {deletePieMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Pie Form */}
          <CreatePieForm
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />

          {/* Edit Pie Form */}
          <EditPieForm
            pie={pieToEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </div>
      </div>
    </div>
  );
}
