"use client";
import { useOrders } from "../hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import { getOrderStatusText } from "@/lib/orders/utils";
import { useState } from "react";

export function OrdersList() {
  const { data, isLoading, error } = useOrders();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Orders</h1>
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
          <div className="px-3 py-1 bg-muted rounded-full">
            <span className="text-sm font-medium text-muted-foreground">
              {data.total} total orders
            </span>
          </div>
        )}
      </div>

      {data && data.orders && data.orders.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.orders.map((order) => (
            <Card
              key={order.id}
              className="hover:shadow-md transition-shadow duration-200 bg-card border border-border"
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col items-start gap-2">
                  <CardTitle className="text-lg font-semibold">
                    #{order.orderNumber}
                  </CardTitle>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getOrderStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold flex items-center gap-1">
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
