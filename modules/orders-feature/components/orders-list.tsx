"use client";
import { useOrders } from "../hooks/use-orders";
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
import { useState } from "react";

export function OrdersList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const limit = 10;

  const { data, isLoading, error } = useOrders({}, currentPage, limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedOrders(new Set()); // Reset expanded orders when changing page

    // Scroll to top of orders list when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditOrder = (orderId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit order:", orderId);
  };

  const handlePrintOrder = (orderId: string) => {
    // TODO: Implement print functionality
    console.log("Print order:", orderId);
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Orders</h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-muted rounded-full">
              <span className="text-sm font-medium text-muted-foreground">
                Loading...
              </span>
            </div>
          </div>
        </div>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        {data?.total && (
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-muted rounded-full">
              <span className="text-sm font-medium text-muted-foreground">
                {data.total} total orders
              </span>
            </div>
            <div className="px-3 py-1 bg-muted rounded-full">
              <span className="text-sm font-medium text-muted-foreground">
                Page {data.page} of {Math.ceil(data.total / data.limit)}
              </span>
            </div>
          </div>
        )}
      </div>

      {data && data.orders && data.orders.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.orders.map((order) => (
              <Card
                key={order.id}
                className="group hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out bg-card border border-border cursor-pointer relative"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col items-start gap-2">
                      <CardTitle className="text-lg font-semibold">
                        #{order.orderNumber}
                      </CardTitle>
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        className="transition-colors duration-200 group-hover:scale-105"
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
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
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
                            className="flex items-center justify-between text-xs animate-in fade-in-0 duration-200"
                          >
                            <span className="text-foreground truncate flex-1">
                              {item.name}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {item.quantity}x
                            </span>
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

          {data.total > data.limit && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(data.total / data.limit)}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          )}
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-sm text-muted-foreground">
                Orders will appear here once customers make purchases.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
