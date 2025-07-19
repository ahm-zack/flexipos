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
import { ShawermaGrid } from "./shawerma-grid";
import { EditShawermaForm } from "./edit-shawerma-form";
import { useShawarmas, useDeleteShawarma } from "../hooks/use-shawermas";
import type { Shawarma } from "@/lib/db/schema";
import { CreateShawermaForm } from "./create-shawerma-form";

export function ShawermaManagementView() {
  const { data: shawarmas, isLoading, error } = useShawarmas("admin");
  const deleteShawarmaMutation = useDeleteShawarma();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shawarmaToDelete, setShawarmaToDelete] = useState<Shawarma | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shawarmaToEdit, setShawarmaToEdit] = useState<Shawarma | null>(null);

  const filteredShawarmas =
    shawarmas?.filter(
      (shawarma) =>
        shawarma.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shawarma.nameAr.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (shawarma: Shawarma) => {
    setShawarmaToEdit(shawarma);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (shawarma: Shawarma) => {
    setShawarmaToDelete(shawarma);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shawarmaToDelete) return;
    try {
      await deleteShawarmaMutation.mutateAsync(shawarmaToDelete.id);
      toast.success(`${shawarmaToDelete.nameEn} deleted successfully`);
      setDeleteDialogOpen(false);
      setShawarmaToDelete(null);
    } catch (error) {
      toast.error("Failed to delete shawarma");
      console.error("Error deleting shawarma:", error);
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
              Error loading shawarmas
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
          Shawarma Management
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          Create, edit, and manage your delicious shawarma offerings
        </p>
      </div>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shawarmas..."
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
                Add New Shawarma
              </Button>
            </div>
          </div>
          {/* Results Count */}
          {!isLoading && shawarmas && (
            <div className="mb-6 text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredShawarmas.length} of {shawarmas.length}{" "}
                  shawarmas
                  {searchTerm && (
                    <span> matching &quot;{searchTerm}&quot;</span>
                  )}
                </>
              ) : (
                <>Showing all {shawarmas.length} shawarmas</>
              )}
            </div>
          )}
          {/* Shawarma Grid - Admin View (With management actions) */}
          <ShawermaGrid
            shawermas={filteredShawarmas}
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
                <DialogTitle>Delete Shawarma</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;
                  {shawarmaToDelete?.nameEn}
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
                  disabled={deleteShawarmaMutation.isPending}
                >
                  {deleteShawarmaMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Create Shawarma Form */}
          <CreateShawermaForm
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
          {/* Edit Shawarma Form */}
          <EditShawermaForm
            shawarma={shawarmaToEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </div>
      </div>
    </div>
  );
}
