"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ParkingCircle,
  Search,
  Clock,
  User,
  Phone,
  ShoppingBag,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Package,
  RefreshCw,
} from "lucide-react";
import { useParkedOrders, ParkedOrder } from "@/hooks/use-parked-orders";
import { PriceDisplay } from "@/components/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ParkedOrdersPanelProps {
  onRestoreOrder: (order: ParkedOrder) => void;
  trigger?: React.ReactNode;
}

export function ParkedOrdersPanel({
  onRestoreOrder,
  trigger,
}: ParkedOrdersPanelProps) {
  const {
    parkedOrders,
    isLoading,
    removeParkedOrder,
    getOrderDuration,
    searchParkedOrders,
    clearAllParkedOrders,
    refreshParkedOrders,
  } = useParkedOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredOrders = searchParkedOrders(searchQuery);

  // Refresh parked orders when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      refreshParkedOrders();
    }
  }, [isDialogOpen, refreshParkedOrders]);

  const handleRestoreOrder = (order: ParkedOrder) => {
    onRestoreOrder(order);
    removeParkedOrder(order.id);
    setIsDialogOpen(false);
    toast.success(
      `Order restored${order.customerName ? ` for ${order.customerName}` : ""}`,
      {
        description: "The parked order has been restored to your cart.",
      }
    );
  };

  const handleRemoveOrder = (order: ParkedOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to remove the parked order${
          order.customerName ? ` for ${order.customerName}` : ""
        }?`
      )
    ) {
      removeParkedOrder(order.id);
    }
  };

  const getUrgencyLevel = (order: ParkedOrder) => {
    const duration = getOrderDuration(order);
    const minutes = parseInt(duration);

    if (duration.includes("h") || minutes > 30) return "high";
    if (minutes > 15) return "medium";
    return "low";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="relative">
            <ParkingCircle className="h-4 w-4 mr-2" />
            Parked Orders
            {parkedOrders.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {parkedOrders.length}
              </Badge>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ParkingCircle className="h-5 w-5" />
            Parked Orders ({parkedOrders.length})
          </DialogTitle>
        </DialogHeader>

        {/* Search and Actions */}
        <div className="flex gap-2 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, phone, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshParkedOrders();
              setSearchQuery(""); // Clear search when refreshing
            }}
            className="hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {parkedOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to clear all parked orders?"
                  )
                ) {
                  clearAllParkedOrders();
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <Separator />

        {/* Parked Orders List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              {searchQuery ? (
                <>
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No parked orders match your search
                  </p>
                </>
              ) : (
                <>
                  <Package className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No parked orders</p>
                  <p className="text-sm text-muted-foreground">
                    Orders will appear here when you park them
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-1">
              {filteredOrders.map((order) => {
                const urgency = getUrgencyLevel(order);
                const duration = getOrderDuration(order);

                return (
                  <Card
                    key={order.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:border-primary/20",
                      urgency === "high" && "border-red-200 bg-red-50/50",
                      urgency === "medium" &&
                        "border-yellow-200 bg-yellow-50/50"
                    )}
                    onClick={() => handleRestoreOrder(order)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {order.customerName && (
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {order.customerName}
                              </span>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {order.customerPhone}
                              </span>
                            </div>
                          )}
                          <Badge
                            variant="outline"
                            className={getUrgencyColor(urgency)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {duration}
                          </Badge>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Items: {order.cartData.itemCount}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-muted-foreground">
                                Total:
                              </span>
                              <PriceDisplay
                                price={order.cartData.total}
                                symbolSize={12}
                                className="font-medium"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Payment: {order.paymentMethod}
                            </div>
                            {order.discountData && (
                              <div className="text-green-600 text-xs">
                                Discount:{" "}
                                {order.discountData.type === "percentage"
                                  ? `${order.discountData.value}%`
                                  : `${order.discountData.amount} SAR`}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Items: </span>
                          {order.cartData.items
                            .slice(0, 3)
                            .map((item, index) => (
                              <span key={item.id}>
                                {index > 0 && ", "}
                                {item.quantity}x {item.name}
                              </span>
                            ))}
                          {order.cartData.items.length > 3 && (
                            <span>
                              {" "}
                              +{order.cartData.items.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Note */}
                        {order.note && (
                          <div className="text-xs bg-muted/50 rounded p-2">
                            <span className="font-medium">Note: </span>
                            {order.note}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="text-xs text-muted-foreground">
                          Parked: {order.timestamp.toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreOrder(order);
                          }}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-red-600 hover:text-red-700"
                          onClick={(e) => handleRemoveOrder(order, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Urgency Warning */}
                    {urgency === "high" && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">
                            Long wait time - Customer may be waiting!
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
