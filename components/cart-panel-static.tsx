/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  ShoppingBag,
  Trash2,
  Banknote,
  CreditCard,
  Split,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { PriceDisplay } from "@/components/currency";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateOrder } from "@/modules/orders-feature";
import { toast } from "sonner";
import { useState } from "react";

export function CartPanelStatic() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mixed">(
    "cash"
  );
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const createOrder = useCreateOrder();

  const handleProceedToCheckout = async () => {
    if (!currentUser) {
      toast.error("Please log in to create an order");
      return;
    }
    const orderData = {
      items: cart.items,
      totalAmount: cart.total,
      paymentMethod,
      createdBy: currentUser.id,
      customerName: undefined,
    };
    createOrder.mutate(orderData, {
      onSuccess: async (data) => {
        toast.success(`Order #${data.orderNumber} created successfully!`);
        clearCart();
        // Convert the order data to ApiOrder format for the PDF
        const apiOrder = {
          id: data.id,
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          items: data.items,
          totalAmount:
            typeof data.totalAmount === "string"
              ? parseFloat(data.totalAmount)
              : data.totalAmount,
          paymentMethod: data.paymentMethod,
          status: data.status,
          createdAt:
            data.createdAt instanceof Date
              ? data.createdAt.toISOString()
              : data.createdAt,
          updatedAt:
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt,
          createdBy: data.createdBy,
        };
        const { downloadReceiptPDF } = await import(
          "@/components/restaurant-receipt"
        );
        // Map items to expected receipt format
        const mappedItems = Array.isArray(apiOrder.items)
          ? apiOrder.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              type: item.type ?? "unknown",
              nameAr: item.nameAr ?? "",
              unitPrice: item.unitPrice ?? item.price ?? 0,
              totalPrice: item.totalPrice ?? (item.price ?? 0) * item.quantity,
              details: item.details ?? {},
            }))
          : [];
        await downloadReceiptPDF({
          ...apiOrder,
          items: mappedItems,
          customerName:
            apiOrder.customerName === null ? undefined : apiOrder.customerName,
        });
      },
      onError: (error) => {
        toast.error(`Failed to create order: ${error.message}`);
      },
    });
  };

  return (
    <div className="h-full w-full bg-background border-l shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-6">
        <ShoppingBag className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Your Order</h2>
      </div>
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some delicious items to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {/* Modifiers Display */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.modifiers.map((modifier) => (
                          <div
                            key={modifier.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground flex items-center gap-1">
                              {modifier.type === "extra" ? (
                                <span className="text-green-600">+</span>
                              ) : (
                                <span className="text-red-600">-</span>
                              )}
                              {modifier.name}
                            </span>
                            {modifier.type === "extra" && (
                              <span className="text-green-600 font-medium">
                                +
                                <PriceDisplay
                                  price={modifier.price}
                                  symbolSize={10}
                                  className="text-xs"
                                />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary">
                          <PriceDisplay
                            price={
                              (item.price + (item.modifiersTotal || 0)) *
                              item.quantity
                            }
                            symbolSize={14}
                            variant="primary"
                            className="font-semibold"
                          />
                        </span>
                        {item.modifiersTotal && item.modifiersTotal > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Base:{" "}
                            <PriceDisplay
                              price={item.price * item.quantity}
                              symbolSize={10}
                              className="text-xs"
                            />
                            {" + "}Extras:{" "}
                            <PriceDisplay
                              price={item.modifiersTotal * item.quantity}
                              symbolSize={10}
                              className="text-xs text-green-600"
                            />
                          </span>
                        )}
                      </div>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove {item.name}</span>
                  </Button>
                </div>
              </Card>
            ))}
            {/* Clear Cart Button */}
            {cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="w-full text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Footer - Total & Checkout */}
      {cart.items.length > 0 && (
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({cart.itemCount} items)</span>
              <PriceDisplay price={cart.total} symbolSize={14} />
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (15% included)</span>
              <PriceDisplay
                price={(cart.total * 0.15) / 1.15}
                symbolSize={14}
              />
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <PriceDisplay
                price={cart.total}
                symbolSize={16}
                className="font-semibold text-lg"
              />
            </div>
          </div>
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium mb-2 block">
              Payment Method
            </Label>
            <div className="flex gap-3 justify-center">
              {[
                {
                  value: "cash",
                  label: "Cash",
                  icon: <Banknote className="h-5 w-5" />,
                  color: "bg-green-100 text-green-700 border-green-300",
                  active: "bg-green-600 text-white border-green-600 shadow-lg",
                },
                {
                  value: "card",
                  label: "Card",
                  icon: <CreditCard className="h-5 w-5" />,
                  color: "bg-blue-100 text-blue-700 border-blue-300",
                  active: "bg-blue-600 text-white border-blue-600 shadow-lg",
                },
                {
                  value: "mixed",
                  label: "Mixed",
                  icon: <Split className="h-5 w-5" />,
                  color: "bg-purple-100 text-purple-700 border-purple-300",
                  active:
                    "bg-purple-600 text-white border-purple-600 shadow-lg",
                },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(method.value as "cash" | "card" | "mixed")
                  }
                  className={`flex-1 flex flex-col items-center gap-1 py-4 px-2 rounded-xl border font-semibold transition-all duration-200 cursor-pointer
                    ${
                      paymentMethod === method.value
                        ? method.active
                        : method.color
                    }
                    hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${
                      method.value === "cash"
                        ? "green"
                        : method.value === "card"
                        ? "blue"
                        : "purple"
                    }-400
                  `}
                >
                  {method.icon}
                  <span className="text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Button
            className="w-full h-12 text-lg font-semibold"
            size="lg"
            onClick={handleProceedToCheckout}
            disabled={createOrder.isPending || userLoading || !currentUser}
          >
            {createOrder.isPending
              ? "Creating Order..."
              : userLoading
              ? "Loading..."
              : !currentUser
              ? "Please Login to Checkout"
              : "Proceed to Checkout"}
          </Button>
        </div>
      )}
    </div>
  );
}
