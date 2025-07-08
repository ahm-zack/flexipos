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
} from "lucide-react";
import { getOrderStatusText } from "@/lib/orders/utils";
import { EditOrderDialog } from "@/components/edit-order-dialog";
import { RestaurantReceipt } from "@/components/restaurant-receipt";
import { useOrderForReceipt } from "@/hooks/use-order-receipt";
import { cn } from "@/lib/utils";
import { useOrdersContext } from "../contexts/orders-context";
import { OrdersHeader } from "./orders-header";

// Type for saved modifiers in order items
interface SavedModifier {
  id: string;
  name: string;
  type: "extra" | "without";
  price: number;
}

export function OrdersList() {
  const {
    // Data
    ordersData,
    isLoading,
    error,
    // UI State
    expandedOrders,
    editingOrder,
    isEditDialogOpen,
    printingOrderId,
    // Actions
    handlePageChange,
    handleEditOrder,
    handlePrintOrder,
    handleClosePrint,
    handleCloseEdit,
    toggleOrderExpansion,
    // UI Helpers
    getStatusBadgeVariant,
    getStatusBadgeClassName,
    // Context state
    pagination,
    clearAllFilters,
  } = useOrdersContext();

  // Fetch order details for printing
  const { data: printOrderData } = useOrderForReceipt(printingOrderId || "");

  const getPaymentMethodDisplay = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
        return { icon: Banknote, text: "Cash", color: "text-green-600" };
      case "card":
        return { icon: CreditCard, text: "Card", color: "text-blue-600" };
      case "mixed":
        return { icon: Split, text: "Mixed", color: "text-purple-600" };
      default:
        return { icon: Banknote, text: "Cash", color: "text-green-600" };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mb-6">
        {/* Header Skeleton - matches OrdersHeader structure */}
        <div className="space-y-4">
          {/* Title and Stats Row Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="h-9 bg-muted rounded w-32 animate-pulse"></div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-muted rounded-full animate-pulse">
                <div className="h-5 bg-muted rounded w-20"></div>
              </div>
              <div className="px-3 py-1 bg-muted rounded-full animate-pulse">
                <div className="h-5 bg-muted rounded w-16"></div>
              </div>
            </div>
          </div>

          {/* Search and Filters Row Skeleton */}
          <div className="flex flex-col gap-4">
            {/* Search Bar and Filter Buttons Row */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              {/* Search Bar Skeleton */}
              <div className="relative w-full max-w-md">
                <div className="h-10 bg-muted rounded border animate-pulse"></div>
              </div>

              {/* Filter Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-2 lg:flex-row lg:gap-2">
                <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-9 bg-muted rounded w-20 animate-pulse"></div>
              </div>
            </div>

            {/* Date and Time Filters Row Skeleton */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="flex flex-col sm:flex-row gap-2 lg:flex-row lg:gap-2">
                <div className="h-9 bg-muted rounded w-28 animate-pulse"></div>
                <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-9 bg-muted rounded w-28 animate-pulse"></div>
                <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
              </div>
            </div>

            {/* Active Filters Row Skeleton */}
            <div className="flex flex-wrap gap-2">
              <div className="h-7 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-7 bg-muted rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Orders Cards Skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-muted rounded w-28"></div>
                  <div className="h-5 bg-muted rounded w-20"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="pt-2 border-t">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
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
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ordersData.orders.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "group hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out bg-card border border-border cursor-pointer relative",
                  // Visually distinguish cancelled orders
                  order.status === "canceled" &&
                    "opacity-75 border-red-200 dark:border-red-800"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col items-start gap-2">
                      <CardTitle className="text-lg font-semibold">
                        #{order.orderNumber}
                      </CardTitle>
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
                              handleEditOrder(order);
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
                        {order.totalAmount.toFixed(2)}
                      </span>
                    </span>
                  </div>

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
                          order.paymentMethod || "cash"
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

                  {order.items && order.items.length > 0 && (
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
                        ).map((item, index) => (
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
                        {order.items.length > 2 && (
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

          {ordersData.total > pagination.limit && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={Math.ceil(ordersData.total / pagination.limit)}
              onPageChange={handlePageChange}
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

      {/* Edit Order Dialog */}
      <EditOrderDialog
        order={editingOrder}
        open={isEditDialogOpen}
        onOpenChange={(open) => handleCloseEdit(open)}
      />

      {/* Restaurant Receipt */}
      {printingOrderId && printOrderData && (
        <RestaurantReceipt
          order={{
            id: printOrderData.id,
            orderNumber: printOrderData.orderNumber,
            customerName: printOrderData.customerName || undefined,
            items: printOrderData.items,
            totalAmount: printOrderData.totalAmount,
            paymentMethod: printOrderData.paymentMethod,
            status: printOrderData.status,
            createdAt: printOrderData.createdAt,
            updatedAt: printOrderData.updatedAt,
            createdBy: printOrderData.createdBy,
          }}
          cashierName={printOrderData.cashierName}
          onClose={handleClosePrint}
        />
      )}
    </div>
  );
}
