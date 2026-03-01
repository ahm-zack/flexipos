"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useCustomers,
  useCustomerSearch,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  type Customer,
} from "../hooks/use-customers";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
}

interface CustomersContextValue {
  // Data
  allCustomers: Customer[];
  displayCustomers: Customer[];
  isLoading: boolean;
  isSearchLoading: boolean;
  isSearching: boolean;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Dialog state
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
  editTarget: Customer | null;
  setEditTarget: (c: Customer | null) => void;
  deleteTarget: Customer | null;
  setDeleteTarget: (c: Customer | null) => void;

  // Mutations pending states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Handlers
  handleCreate: (form: CustomerFormData) => void;
  handleUpdate: (form: CustomerFormData) => void;
  handleDelete: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CustomersContext = createContext<CustomersContextValue | null>(null);

export function CustomersProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  // Queries
  const { data: allCustomers = [], isLoading } = useCustomers();
  const isSearching = searchQuery.trim().length >= 2;
  const { data: searchResults = [], isLoading: isSearchLoading } =
    useCustomerSearch(searchQuery.trim());

  const displayCustomers = isSearching ? searchResults : allCustomers;

  // Mutations
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = useCallback(
    (form: CustomerFormData) => {
      if (!currentUser) return toast.error("Not logged in");
      createCustomer.mutate(
        {
          name: form.name,
          phone: form.phone,
          address: form.address || undefined,
          createdBy: currentUser.id,
        },
        {
          onSuccess: () => {
            toast.success("Customer added");
            setAddOpen(false);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    },
    [currentUser, createCustomer],
  );

  const handleUpdate = useCallback(
    (form: CustomerFormData) => {
      if (!editTarget) return;
      updateCustomer.mutate(
        {
          id: editTarget.id,
          name: form.name,
          phone: form.phone,
          address: form.address || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Customer updated");
            setEditTarget(null);
          },
          onError: (err) => toast.error(err.message),
        },
      );
    },
    [editTarget, updateCustomer],
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteCustomer.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Customer deleted");
        setDeleteTarget(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }, [deleteTarget, deleteCustomer]);

  return (
    <CustomersContext.Provider
      value={{
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
        isCreating: createCustomer.isPending,
        isUpdating: updateCustomer.isPending,
        isDeleting: deleteCustomer.isPending,
        handleCreate,
        handleUpdate,
        handleDelete,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomersContext(): CustomersContextValue {
  const ctx = useContext(CustomersContext);
  if (!ctx)
    throw new Error(
      "useCustomersContext must be used inside <CustomersProvider>",
    );
  return ctx;
}
