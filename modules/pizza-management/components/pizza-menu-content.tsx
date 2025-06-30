"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
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
import { PizzaGrid } from "./pizza-grid";
import { CreatePizzaForm } from "./create-pizza-form";
import { EditPizzaForm } from "./edit-pizza-form";
import { usePizzas, useDeletePizza } from "../hooks/use-pizzas";
import type { Pizza } from "@/lib/db/schema";

export function PizzaMenuContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pizzaToDelete, setPizzaToDelete] = useState<Pizza | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pizzaToEdit, setPizzaToEdit] = useState<Pizza | null>(null);

  const { data: pizzas, isLoading, error } = usePizzas();
  const deletePizzaMutation = useDeletePizza();

  // Filter pizzas based on search term
  const filteredPizzas =
    pizzas?.filter(
      (pizza) =>
        pizza.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pizza.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleEdit = (pizza: Pizza) => {
    setPizzaToEdit(pizza);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (pizza: Pizza) => {
    setPizzaToDelete(pizza);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pizzaToDelete) return;

    try {
      await deletePizzaMutation.mutateAsync(pizzaToDelete.id);
      toast.success(`${pizzaToDelete.nameEn} deleted successfully`);
      setDeleteDialogOpen(false);
      setPizzaToDelete(null);
    } catch (error) {
      toast.error("Failed to delete pizza");
      console.error("Error deleting pizza:", error);
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
              Error loading pizzas
            </h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">🍕 Pizza Menu</h1>
          <p className="text-muted-foreground text-center mb-6">
            Discover our delicious pizza selection
          </p>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pizzas..."
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
              Add New Pizza
            </Button>
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && pizzas && (
          <div className="mb-6 text-sm text-muted-foreground">
            {searchTerm ? (
              <>
                Showing {filteredPizzas.length} of {pizzas.length} pizzas
                {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
              </>
            ) : (
              <>Showing all {pizzas.length} pizzas</>
            )}
          </div>
        )}

        {/* Pizza Grid */}
        <PizzaGrid
          pizzas={filteredPizzas}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          showActions={true}
          isLoading={isLoading}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Pizza</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{pizzaToDelete?.nameEn}
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
                disabled={deletePizzaMutation.isPending}
              >
                {deletePizzaMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Pizza Form */}
        <CreatePizzaForm
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        {/* Edit Pizza Form */}
        <EditPizzaForm
          pizza={pizzaToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      </div>
    </div>
  );
}
