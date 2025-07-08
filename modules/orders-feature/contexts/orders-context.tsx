/**
 * Orders Context - Manages orders list state and functionality
 * Provides centralized state management for orders filtering, pagination, and actions
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
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

interface OrdersUIState {
  expandedOrders: Set<string>;
  editingOrder: Order | null;
  isEditDialogOpen: boolean;
  printingOrderId: string | null;
}

interface OrdersContextValue {
  // Data
  hasActiveFilters: boolean;
  printOrderData: ReturnType<typeof useOrderForReceipt>["data"];

  // Filters
  filters: OrdersFilters;
  setSearchTerm: (term: string) => void;
  toggleFilter: (filterKey: string) => void;
  clearAllFilters: () => void;
  clearSearch: () => void;
  setDateFrom: (date: Date | undefined) => void;
  setDateTo: (date: Date | undefined) => void;
  clearDateFilters: () => void;
  getFilterButtonVariant: (filterKey: string) => "default" | "outline";

  // UI State
  uiState: OrdersUIState;
  expandedOrders: Set<string>;
  editingOrder: Order | null;
  isEditDialogOpen: boolean;
  printingOrderId: string | null;

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

  const [uiState, setUIState] = useState<OrdersUIState>({
    expandedOrders: new Set<string>(),
    editingOrder: null,
    isEditDialogOpen: false,
    printingOrderId: null,
  });

  // Compute if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.searchTerm ||
          filters.activeFilters.size > 0 ||
          filters.dateFrom ||
          filters.dateTo
      ),
    [
      filters.searchTerm,
      filters.activeFilters,
      filters.dateFrom,
      filters.dateTo,
    ]
  );

  const { data: printOrderData } = useOrderForReceipt(
    uiState.printingOrderId || ""
  );

  // Filter Actions
  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const toggleFilter = useCallback((filterKey: string) => {
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
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      activeFilters: new Set(),
      dateFrom: undefined,
      dateTo: undefined,
    });
  }, []);

  const clearSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchTerm: "" }));
  }, []);

  const setDateFrom = useCallback((date: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateFrom: date }));
  }, []);

  const setDateTo = useCallback((date: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateTo: date }));
  }, []);

  const clearDateFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, dateFrom: undefined, dateTo: undefined }));
  }, []);

  const getFilterButtonVariant = useCallback(
    (filterKey: string) => {
      return filters.activeFilters.has(filterKey) ? "default" : "outline";
    },
    [filters.activeFilters]
  );

  // Order Actions
  const convertToOrder = useCallback(
    (apiOrder: ApiOrderResponse): Order => ({
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
    }),
    []
  );

  const handleEditOrder = useCallback(
    (apiOrder: ApiOrderResponse) => {
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
    },
    [convertToOrder]
  );

  const handlePrintOrder = useCallback((orderId: string) => {
    setUIState((prev) => ({ ...prev, printingOrderId: orderId }));
  }, []);

  const handleClosePrint = useCallback(() => {
    setUIState((prev) => ({ ...prev, printingOrderId: null }));
  }, []);

  const handleCloseEdit = useCallback((open: boolean) => {
    if (!open) {
      setUIState((prev) => ({
        ...prev,
        editingOrder: null,
        isEditDialogOpen: false,
      }));
    }
  }, []);

  const toggleOrderExpansion = useCallback((orderId: string) => {
    setUIState((prev) => {
      const newExpanded = new Set(prev.expandedOrders);
      if (newExpanded.has(orderId)) {
        newExpanded.delete(orderId);
      } else {
        newExpanded.add(orderId);
      }
      return { ...prev, expandedOrders: newExpanded };
    });
  }, []);

  // UI Helpers
  const getStatusBadgeVariant = useCallback((status: string) => {
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
  }, []);

  const getStatusBadgeClassName = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-700 text-white";
      case "modified":
        return "bg-purple-700 text-white";
      default:
        return "";
    }
  }, []);

  const getPaymentMethodDisplay = useCallback((paymentMethod: string) => {
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
  }, []);

  const contextValue: OrdersContextValue = useMemo(
    () => ({
      // Data
      hasActiveFilters,
      printOrderData,
      // Filters
      filters,
      setSearchTerm,
      toggleFilter,
      clearAllFilters,
      clearSearch,
      setDateFrom,
      setDateTo,
      clearDateFilters,
      getFilterButtonVariant,
      // UI State
      uiState,
      expandedOrders: uiState.expandedOrders,
      editingOrder: uiState.editingOrder,
      isEditDialogOpen: uiState.isEditDialogOpen,
      printingOrderId: uiState.printingOrderId,
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
        return {
          ...base,
          icon: () => null, // Placeholder, will be overridden in component
        };
      },
    }),
    [
      hasActiveFilters,
      printOrderData,
      filters,
      uiState,
      setSearchTerm,
      toggleFilter,
      clearAllFilters,
      clearSearch,
      setDateFrom,
      setDateTo,
      clearDateFilters,
      getFilterButtonVariant,
      handleEditOrder,
      handlePrintOrder,
      handleClosePrint,
      handleCloseEdit,
      toggleOrderExpansion,
      convertToOrder,
      getStatusBadgeVariant,
      getStatusBadgeClassName,
      getPaymentMethodDisplay,
    ]
  );

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
