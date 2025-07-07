/**
 * Orders Context - Manages orders list state and functionality
 * Provides centralized state management for orders filtering, pagination, and actions
 */

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useOrders } from "../hooks/use-orders";
import { useOrderForReceipt } from "@/hooks/use-order-receipt";
import { Order } from "@/lib/orders";
import { ApiOrderResponse } from "@/lib/order-service";

// Types for the context
interface OrdersFilters {
  searchTerm: string;
  activeFilters: Set<string>;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface OrdersPagination {
  currentPage: number;
  limit: number;
}

interface OrdersUIState {
  expandedOrders: Set<string>;
  editingOrder: Order | null;
  isEditDialogOpen: boolean;
  printingOrderId: string | null;
}

interface OrdersContextValue {
  // Data
  ordersData: ReturnType<typeof useOrders>["data"];
  isLoading: boolean;
  error: ReturnType<typeof useOrders>["error"];
  filteredOrders: ApiOrderResponse[];
  allFilteredOrders: ApiOrderResponse[];
  totalFilteredCount: number;
  hasActiveFilters: boolean;
  printOrderData: ReturnType<typeof useOrderForReceipt>["data"];

  // Filters
  filters: OrdersFilters;
  pagination: OrdersPagination;
  uiState: OrdersUIState;

  // Direct access to UI state for easier destructuring
  expandedOrders: Set<string>;
  editingOrder: Order | null;
  isEditDialogOpen: boolean;
  printingOrderId: string | null;

  // Filter Actions
  setSearchTerm: (term: string) => void;
  toggleFilter: (filterKey: string) => void;
  clearAllFilters: () => void;
  clearSearch: () => void;
  setDateFrom: (date: Date | undefined) => void;
  setDateTo: (date: Date | undefined) => void;
  clearDateFilters: () => void;
  getFilterButtonVariant: (filterKey: string) => "default" | "outline";

  // Pagination Actions
  handlePageChange: (page: number) => void;

  // Order Actions
  handleEditOrder: (apiOrder: ApiOrderResponse) => void;
  handlePrintOrder: (orderId: string) => void;
  handleClosePrint: () => void;
  handleCloseEdit: (open: boolean) => void;
  toggleOrderExpansion: (orderId: string) => void;
  convertToOrder: (apiOrder: ApiOrderResponse) => Order;

  // UI Helpers
  getStatusBadgeVariant: (
    status: string
  ) => "default" | "destructive" | "secondary" | "outline";
  getStatusBadgeClassName: (status: string) => string;
  getPaymentMethodDisplay: (paymentMethod: string) => {
    icon: React.ComponentType<{ className?: string; size?: number }>;
    text: string;
    color: string;
  };
}

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

interface OrdersProviderProps {
  children: ReactNode;
}

export function OrdersProvider({ children }: OrdersProviderProps) {
  // State management
  const [filters, setFilters] = useState<OrdersFilters>({
    searchTerm: "",
    activeFilters: new Set<string>(),
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [pagination, setPagination] = useState<OrdersPagination>({
    currentPage: 1,
    limit: 10,
  });

  const [uiState, setUIState] = useState<OrdersUIState>({
    expandedOrders: new Set<string>(),
    editingOrder: null,
    isEditDialogOpen: false,
    printingOrderId: null,
  });

  // API calls - fetch all data when filters are active, paginated when no filters
  const hasActiveFilters = Boolean(
    filters.searchTerm ||
      filters.activeFilters.size > 0 ||
      filters.dateFrom ||
      filters.dateTo
  );

  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrders(
    {},
    hasActiveFilters ? 1 : pagination.currentPage,
    hasActiveFilters ? 1000 : pagination.limit // Fetch large number when filtering
  );

  const { data: printOrderData } = useOrderForReceipt(
    uiState.printingOrderId || ""
  );

  // Filter data client-side for search, payment methods, status, and date range
  const allFilteredOrders =
    ordersData?.orders?.filter((order) => {
      // Search filter
      if (
        filters.searchTerm &&
        !order.orderNumber
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Payment method filters
      if (filters.activeFilters.has("cash") && order.paymentMethod !== "cash")
        return false;
      if (filters.activeFilters.has("card") && order.paymentMethod !== "card")
        return false;
      if (filters.activeFilters.has("mixed") && order.paymentMethod !== "mixed")
        return false;

      // Status filters
      if (
        filters.activeFilters.has("completed") &&
        order.status !== "completed"
      )
        return false;
      if (filters.activeFilters.has("modified") && order.status !== "modified")
        return false;
      if (filters.activeFilters.has("canceled") && order.status !== "canceled")
        return false;

      // Date range filters
      const orderDate = new Date(order.createdAt);
      if (filters.dateFrom && orderDate < filters.dateFrom) return false;
      if (filters.dateTo && orderDate > filters.dateTo) return false;

      return true;
    }) || [];

  // Handle pagination client-side when filters are active
  const filteredOrders = hasActiveFilters
    ? allFilteredOrders.slice(
        (pagination.currentPage - 1) * pagination.limit,
        pagination.currentPage * pagination.limit
      )
    : allFilteredOrders;

  // Filter Actions
  const setSearchTerm = (term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  };

  const toggleFilter = (filterKey: string) => {
    setFilters((prev) => {
      const newActiveFilters = new Set(prev.activeFilters);

      // If it's a payment method filter, clear other payment method filters
      if (["cash", "card", "mixed"].includes(filterKey)) {
        ["cash", "card", "mixed"].forEach((key) =>
          newActiveFilters.delete(key)
        );
        if (!prev.activeFilters.has(filterKey)) {
          newActiveFilters.add(filterKey);
        }
      }
      // If it's a status filter, clear other status filters
      else if (["completed", "modified", "canceled"].includes(filterKey)) {
        ["completed", "modified", "canceled"].forEach((key) =>
          newActiveFilters.delete(key)
        );
        if (!prev.activeFilters.has(filterKey)) {
          newActiveFilters.add(filterKey);
        }
      }

      return { ...prev, activeFilters: newActiveFilters };
    });

    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page when filtering
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: "",
      activeFilters: new Set(),
      dateFrom: undefined,
      dateTo: undefined,
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearSearch = () => {
    setFilters((prev) => ({ ...prev, searchTerm: "" }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const setDateFrom = (date: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateFrom: date }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const setDateTo = (date: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateTo: date }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearDateFilters = () => {
    setFilters((prev) => ({ ...prev, dateFrom: undefined, dateTo: undefined }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const getFilterButtonVariant = (filterKey: string) => {
    return filters.activeFilters.has(filterKey) ? "default" : "outline";
  };

  // Pagination Actions
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    setUIState((prev) => ({ ...prev, expandedOrders: new Set() })); // Reset expanded orders when changing page

    // Scroll to top of orders list when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Order Actions
  const convertToOrder = (apiOrder: ApiOrderResponse): Order => ({
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    customerName: apiOrder.customerName || undefined,
    items: apiOrder.items,
    totalAmount: apiOrder.totalAmount,
    paymentMethod: apiOrder.paymentMethod,
    status: apiOrder.status,
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
    createdBy: apiOrder.createdBy,
  });

  const handleEditOrder = (apiOrder: ApiOrderResponse) => {
    // Prevent editing cancelled orders
    if (apiOrder.status === "canceled") {
      console.warn("Cannot edit cancelled order:", apiOrder.orderNumber);
      return;
    }

    const order = convertToOrder(apiOrder);
    setUIState((prev) => ({
      ...prev,
      editingOrder: order,
      isEditDialogOpen: true,
    }));
  };

  const handlePrintOrder = (orderId: string) => {
    setUIState((prev) => ({ ...prev, printingOrderId: orderId }));
  };

  const handleClosePrint = () => {
    setUIState((prev) => ({ ...prev, printingOrderId: null }));
  };

  const handleCloseEdit = (open: boolean) => {
    if (!open) {
      setUIState((prev) => ({
        ...prev,
        editingOrder: null,
        isEditDialogOpen: false,
      }));
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setUIState((prev) => {
      const newExpanded = new Set(prev.expandedOrders);
      if (newExpanded.has(orderId)) {
        newExpanded.delete(orderId);
      } else {
        newExpanded.add(orderId);
      }
      return { ...prev, expandedOrders: newExpanded };
    });
  };

  // UI Helpers
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const;
      case "canceled":
        return "destructive" as const;
      case "modified":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-700 text-white";
      case "modified":
        return "bg-purple-700 text-white";
      default:
        return "";
    }
  };

  const getPaymentMethodDisplay = (paymentMethod: string) => {
    // Note: Icons are imported in the component that uses this context
    // to avoid circular dependencies
    const paymentMethods = {
      cash: { text: "Cash", color: "text-green-600" },
      card: { text: "Card", color: "text-blue-600" },
      mixed: { text: "Mixed", color: "text-purple-600" },
    };

    return (
      paymentMethods[paymentMethod as keyof typeof paymentMethods] ||
      paymentMethods.cash
    );
  };

  const contextValue: OrdersContextValue = {
    // Data
    ordersData,
    isLoading,
    error,
    filteredOrders,
    allFilteredOrders,
    totalFilteredCount: allFilteredOrders.length,
    hasActiveFilters,
    printOrderData,

    // State
    filters,
    pagination,
    uiState,

    // Direct access to UI state for easier destructuring
    expandedOrders: uiState.expandedOrders,
    editingOrder: uiState.editingOrder,
    isEditDialogOpen: uiState.isEditDialogOpen,
    printingOrderId: uiState.printingOrderId,

    // Filter Actions
    setSearchTerm,
    toggleFilter,
    clearAllFilters,
    clearSearch,
    setDateFrom,
    setDateTo,
    clearDateFilters,
    getFilterButtonVariant,

    // Pagination Actions
    handlePageChange,

    // Order Actions
    handleEditOrder,
    handlePrintOrder,
    handleClosePrint,
    handleCloseEdit,
    toggleOrderExpansion,
    convertToOrder,

    // UI Helpers
    getStatusBadgeVariant,
    getStatusBadgeClassName,
    getPaymentMethodDisplay: (paymentMethod: string) => {
      const base = getPaymentMethodDisplay(paymentMethod);
      // Icons will be added in the consuming component
      return {
        ...base,
        icon: () => null, // Placeholder, will be overridden in component
      };
    },
  };

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrdersContext must be used within an OrdersProvider");
  }
  return context;
}
