"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Users, Plus } from "lucide-react";
import { useCustomersContext } from "../contexts/customers-context";
import { CustomerCard } from "./customer-card";
import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomersStats } from "./customers-stats";

export function CustomersList() {
  const {
    allCustomers,
    displayCustomers,
    isLoading,
    isSearchLoading,
    isSearching,
    searchQuery,
    setSearchQuery,
    addOpen,
    setAddOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    isCreating,
    isUpdating,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCustomersContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your business customers and purchase history.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Summary stats (only when not searching) */}
      {!isSearching && allCustomers.length > 0 && (
        <CustomersStats customers={allCustomers} />
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone…"
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customer grid */}
      {isLoading || isSearchLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-sm">Loading customers…</span>
          </div>
        </div>
      ) : displayCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">
            {isSearching ? "No customers found" : "No customers yet"}
          </p>
          <p className="text-sm">
            {isSearching
              ? "Try a different search term"
              : "Customers are added automatically when you checkout with their info."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={(c) => setEditTarget(c)}
              onDelete={(c) => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <CustomerFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Customer"
        initial={{ name: "", phone: "", address: "" }}
        onSave={handleCreate}
        isSaving={isCreating}
      />

      {/* Edit dialog */}
      {editTarget && (
        <CustomerFormDialog
          open={!!editTarget}
          onOpenChange={(v) => !v && setEditTarget(null)}
          title="Edit Customer"
          initial={{
            name: editTarget.name,
            phone: editTarget.phone,
            address: editTarget.address ?? "",
          }}
          onSave={handleUpdate}
          isSaving={isUpdating}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
