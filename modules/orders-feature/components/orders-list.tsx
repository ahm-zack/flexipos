"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import { Pagination } from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Printer,
  CreditCard,
  Banknote,
  Split,
  Truck,
} from "lucide-react";
import { getOrderStatusText } from "@/lib/orders/utils";
import { EditOrderDialog } from "@/components/edit-order-dialog";
import { cn } from "@/lib/utils";
import { useOrdersContext } from "../contexts/orders-context";
import { OrdersHeader } from "./orders-header";
import React, { useState, useMemo } from "react";
import { useOrders } from "../hooks/use-orders";
import { Dialog } from "@/components/ui/dialog";
import { RestaurantReceipt } from "@/components/restaurant-receipt";
import type { ApiOrderResponse } from "@/lib/order-service";

// Helper function to convert new Order type to ApiOrderResponse format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertOrderToApiOrderResponse = (order: any): ApiOrderResponse => {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName || null,
    items: order.items,
    totalAmount:
      typeof order.totalAmount === "string"
        ? parseFloat(order.totalAmount)
        : order.totalAmount,
    paymentMethod: order.paymentMethod,
    deliveryPlatform: order.deliveryPlatform,
    status: order.status,
    createdAt:
      order.createdAt instanceof Date
        ? order.createdAt.toISOString()
        : order.createdAt,
    updatedAt:
      order.updatedAt instanceof Date
        ? order.updatedAt.toISOString()
        : order.updatedAt,
    createdBy: order.createdBy,
  };
};

// Type for saved modifiers in order items
interface SavedModifier {
  id: string;
  name: string;
  type: "extra" | "without";
  price: number;
}

export function OrdersList() {
  const {
    // Context
    filters,
    expandedOrders,
    editingOrder,
    isEditDialogOpen,
    handleEditOrder,
    handlePrintOrder,
    handleCloseEdit,
    toggleOrderExpansion,
    getStatusBadgeVariant,
    getStatusBadgeClassName,
    clearAllFilters,
    // Print
    printingOrderId,
    printOrderData,
    handleClosePrint,
  } = useOrdersContext();

  // Local pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10); // You can make this dynamic if needed

  // Build apiFilters from context filters
  const apiFilters = useMemo(() => {
    let status: "completed" | "canceled" | "modified" | undefined = undefined;
    if (filters.activeFilters.has("completed")) status = "completed";
    if (filters.activeFilters.has("canceled")) status = "canceled";
    if (filters.activeFilters.has("modified")) status = "modified";
    let paymentMethod: "cash" | "card" | "mixed" | "delivery" | undefined =
      undefined;
    if (filters.activeFilters.has("cash")) paymentMethod = "cash";
    if (filters.activeFilters.has("card")) paymentMethod = "card";
    if (filters.activeFilters.has("mixed")) paymentMethod = "mixed";
    if (filters.activeFilters.has("delivery")) paymentMethod = "delivery";
    const orderNumber = filters.searchTerm || undefined;
    return {
      status,
      paymentMethod,
      orderNumber,
      dateFrom: filters.dateFrom ? filters.dateFrom.toISOString() : undefined,
      dateTo: filters.dateTo ? filters.dateTo.toISOString() : undefined,
      activeFiltersKey: Array.from(filters.activeFilters).sort().join(","),
    };
  }, [filters]);

  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrders(apiFilters, currentPage, limit);

  const getPaymentMethodDisplay = (
    paymentMethod: string,
    deliveryPlatform?: string
  ) => {
    switch (paymentMethod) {
      case "cash":
        return { icon: Banknote, text: "Cash", color: "text-green-600" };
      case "card":
        return { icon: CreditCard, text: "Card", color: "text-blue-600" };
      case "mixed":
        return { icon: Split, text: "Mixed", color: "text-purple-600" };
      case "delivery":
        const platformText = deliveryPlatform
          ? formatDeliveryPlatform(deliveryPlatform)
          : "";
        const displayText = platformText
          ? `Delivery(${platformText})`
          : "Delivery";
        return { icon: Truck, text: displayText, color: "text-yellow-600" };
      default:
        return { icon: Banknote, text: "Cash", color: "text-green-600" };
    }
  };

  // Helper function to format delivery platform names
  const formatDeliveryPlatform = (platform: string): string => {
    switch (platform) {
      case "keeta":
        return "Keeta";
      case "hunger_station":
        return "Hunger Station";
      case "jahez":
        return "Jahez";
      default:
        return platform;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mb-6">
        {/* Header Skeleton - matches OrdersHeader structure */}
        <div className="space-y-4">
          {/* Title Row Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="h-10 w-48 bg-muted rounded animate-pulse" />
          </div>

          {/* Search and Filters Row Skeleton */}
          <div className="flex flex-col gap-4">
            {/* Search Bar and Filter Buttons Row - Combined on lg+ screens */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              {/* Search Bar Skeleton */}
              <div className="relative w-full max-w-md">
                <div className="h-10 bg-muted rounded pl-10 animate-pulse" />
                {/* Clear button skeleton */}
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-muted rounded animate-pulse" />
              </div>

              {/* Filter Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-2 lg:flex-row lg:gap-2">
                <div className="h-9 w-36 bg-muted rounded animate-pulse" />
                <div className="h-9 w-36 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Date Range Filters Skeleton */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full">
              {/* From Date/Time Skeleton */}
              <div className="flex gap-2 flex-1">
                <div className="h-9 w-32 bg-muted rounded animate-pulse" />
                <div className="h-9 w-28 bg-muted rounded animate-pulse" />
              </div>
              {/* 'to' label skeleton */}
              <span className="h-6 w-8 bg-transparent" />
              {/* To Date/Time Skeleton */}
              <div className="flex gap-2 flex-1">
                <div className="h-9 w-32 bg-muted rounded animate-pulse" />
                <div className="h-9 w-28 bg-muted rounded animate-pulse" />
              </div>
              {/* Clear Date Filters Button Skeleton */}
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Orders Cards Skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-start gap-2">
                    <div className="h-6 w-24 bg-muted rounded" />
                    <div className="h-5 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-8 bg-muted rounded" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-12 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-12 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="pt-2">
                  <div className="h-4 w-20 bg-muted rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Orders</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-sm border-red-200 dark:border-red-800">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Error Loading Orders
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {error.message}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Title, Search, and Filters */}
      <OrdersHeader />

      {ordersData && ordersData.orders && ordersData.orders.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {ordersData.orders.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "group hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out bg-card cursor-pointer relative",
                  // Visually distinguish cancelled orders
                  order.status === "canceled" &&
                    "opacity-75 border border-red-200 dark:border-red-800"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex flex-col">
                        {order.dailySerial ? (
                          <>
                            <CardTitle className="text-lg font-semibold">
                              Daily: {order.dailySerial}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                              #{order.orderNumber}
                            </span>
                          </>
                        ) : (
                          <CardTitle className="text-lg font-semibold">
                            #{order.orderNumber}
                          </CardTitle>
                        )}
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        className={cn(
                          "transition-colors duration-200 group-hover:scale-105",
                          getStatusBadgeClassName(order.status)
                        )}
                      >
                        {getOrderStatusText(order.status)}
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200 opacity-60 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        {/* Only show Edit button for non-cancelled orders */}
                        {order.status == "completed" && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOrder(
                                convertOrderToApiOrderResponse(order)
                              );
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {/* Print is always available for all orders */}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintOrder(order.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-bold flex items-center gap-1 transition-transform duration-200 group-hover:scale-105">
                      <SaudiRiyalSymbol size={16} />
                      <span className="text-green-600">
                        {typeof order.totalAmount === "number"
                          ? order.totalAmount.toFixed(2)
                          : parseFloat(order.totalAmount).toFixed(2)}
                      </span>
                    </span>
                  </div>

                  {/* Discount Information */}
                  {order.discountAmount && order.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <div className="flex items-center gap-1">
                        <span className="text-red-600 font-medium">
                          -{order.discountAmount.toFixed(2)}
                        </span>
                        <SaudiRiyalSymbol size={12} />
                        {order.discountType && order.discountValue && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (
                            {order.discountType === "percentage"
                              ? `${order.discountValue}%`
                              : `${order.discountValue} SAR`}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="text-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="text-foreground">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {order.customerName && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="text-foreground truncate max-w-[150px]">
                        {order.customerName}
                      </span>
                    </div>
                  )}

                  {order.cashierName && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cashier</span>
                      <span className="text-foreground truncate max-w-[150px]">
                        {order.cashierName}
                      </span>
                    </div>
                  )}

                  {/* Payment Method Display */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment</span>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const paymentDisplay = getPaymentMethodDisplay(
                          order.paymentMethod || "cash",
                          order.deliveryPlatform || undefined
                        );
                        const IconComponent = paymentDisplay.icon;
                        return (
                          <>
                            <IconComponent
                              className={`h-4 w-4 ${paymentDisplay.color}`}
                            />
                            <span
                              className={`text-sm font-medium ${paymentDisplay.color}`}
                            >
                              {paymentDisplay.text}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Items
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {order.items.length}
                        </span>
                      </div>
                      <div className="space-y-1 transition-all duration-200 ease-in-out">
                        {(expandedOrders.has(order.id)
                          ? order.items
                          : order.items.slice(0, 2)
                        )
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          .map((item: any, index: number) => (
                            <div
                              key={index}
                              className="space-y-1 animate-in fade-in-0 duration-200"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-foreground truncate flex-1">
                                  {item.name}
                                </span>
                                <span className="text-muted-foreground ml-2">
                                  {item.quantity}x
                                </span>
                              </div>
                              {/* Display modifiers if they exist */}
                              {item.details?.modifiers &&
                                item.details.modifiers.length > 0 && (
                                  <div className="space-y-0.5">
                                    {item.details.modifiers.map(
                                      (
                                        modifier: SavedModifier,
                                        modIndex: number
                                      ) => (
                                        <div
                                          key={modIndex}
                                          className="flex items-center justify-between text-xs"
                                        >
                                          <span className="text-muted-foreground italic">
                                            {modifier.type === "extra"
                                              ? "+ "
                                              : "- "}
                                            {modifier.name}
                                          </span>
                                          {modifier.type === "extra" &&
                                            modifier.price > 0 && (
                                              <span className="text-muted-foreground text-xs flex items-center gap-0.5">
                                                +<SaudiRiyalSymbol size={10} />
                                                {modifier.price.toFixed(2)}
                                              </span>
                                            )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        {Array.isArray(order.items) &&
                          order.items.length > 2 && (
                            <div className="text-xs pt-1">
                              <button
                                onClick={() => toggleOrderExpansion(order.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors duration-150"
                              >
                                {expandedOrders.has(order.id)
                                  ? "Show less"
                                  : `+${order.items.length - 2} more`}
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {ordersData.total > limit && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(ordersData.total / limit)}
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          )}
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-sm">
            <CardContent className="p-8 text-center">
              {ordersData?.orders && ordersData.orders.length > 0 ? (
                // Has data but filtered out
                <>
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">
                    No matching orders
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No orders match your current search and filter criteria.
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear filters
                  </Button>
                </>
              ) : (
                // No data at all
                <>
                  <div className="text-4xl mb-4">�📦</div>
                  <h3 className="text-lg font-semibold mb-2">
                    No orders found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Orders will appear here once customers make purchases.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Print Receipt Dialog */}
      <Dialog open={!!printingOrderId} onOpenChange={handleClosePrint}>
        {printingOrderId && printOrderData && (
          <RestaurantReceipt
            order={printOrderData}
            onClose={handleClosePrint}
          />
        )}
      </Dialog>

      {/* Edit Order Dialog */}
      <EditOrderDialog
        order={editingOrder}
        open={isEditDialogOpen}
        onOpenChange={(open) => handleCloseEdit(open)}
      />
    </div>
  );
}
