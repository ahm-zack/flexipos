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
import { MiniPieGrid } from "./mini-pie-grid";
import { CreateMiniPieForm } from "./create-mini-pie-form";
import { EditMiniPieForm } from "./edit-mini-pie-form";
import { useMiniPies, useDeleteMiniPie } from "../hooks/use-mini-pies";
import type { MiniPie } from "@/lib/db/schema";

export function MiniPieManagementView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [miniPieToDelete, setMiniPieToDelete] = useState<MiniPie | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [miniPieToEdit, setMiniPieToEdit] = useState<MiniPie | null>(null);

  const { data: miniPies, isLoading, error } = useMiniPies("admin");
  const deleteMiniPieMutation = useDeleteMiniPie();

  // Filter mini pies based on search term
  const filteredMiniPies =
    miniPies?.filter(
      (miniPie: MiniPie) =>
        miniPie.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniPie.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniPie.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miniPie.size.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (miniPie: MiniPie) => {
    setMiniPieToEdit(miniPie);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (miniPie: MiniPie) => {
    setMiniPieToDelete(miniPie);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!miniPieToDelete) return;

    try {
      await deleteMiniPieMutation.mutateAsync(miniPieToDelete.id);
      toast.success(`${miniPieToDelete.type} deleted successfully`);
      setDeleteDialogOpen(false);
      setMiniPieToDelete(null);
    } catch (error) {
      toast.error("Failed to delete mini pie");
      console.error("Error deleting mini pie:", error);
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
              Error loading mini pies
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
          Mini Pie Management
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Create, edit, and manage your delicious mini pie offerings - perfect
          for parties!
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mini pies..."
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
              Add New Mini Pie
            </Button>
          </div>

          {/* Results Count */}
          {!isLoading && miniPies && (
            <div className="mb-6 text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredMiniPies.length} of {miniPies.length} mini
                  pies
                  {searchTerm && (
                    <span> matching &quot;{searchTerm}&quot;</span>
                  )}
                </>
              ) : (
                <>Showing all {miniPies.length} mini pies</>
              )}
            </div>
          )}

          {/* Mini Pie Grid - Admin View (With management actions, NO cart actions) */}
          <MiniPieGrid
            miniPies={filteredMiniPies}
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
                <DialogTitle>Delete Mini Pie</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{miniPieToDelete?.type}
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
                  disabled={deleteMiniPieMutation.isPending}
                >
                  {deleteMiniPieMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Mini Pie Form */}
          <CreateMiniPieForm
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />

          {/* Edit Mini Pie Form */}
          {miniPieToEdit && (
            <EditMiniPieForm
              miniPie={miniPieToEdit}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
}
