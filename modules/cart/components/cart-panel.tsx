"use client";

import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "../hooks/use-cart";
import { PriceDisplay } from "@/components/currency";
import { cn } from "@/lib/utils";
import { useCreateOrder } from "@/modules/orders-feature";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "@/modules/orders-feature/hooks/use-orders";

interface CartPanelProps {
  className?: string;
}

export function CartPanel({ className }: CartPanelProps) {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, clearCart } =
    useCart();

  const createOrder = useCreateOrder();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  // Handle order creation
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      toast.error("Please log in to create an order");
      return;
    }

    // Transform cart items to order items format
    const orderItems = cart.items.map((item) => ({
      id: item.id,
      type: "pizza" as const, // You might want to add type to your cart items
      name: item.name,
      nameAr: item.name, // You might want to add Arabic name to cart items
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      details: {
        category: item.category,
        description: item.description,
      },
    }));

    const orderData = {
      items: orderItems,
      totalAmount: cart.total,
      createdBy: currentUser.id, // Use the actual authenticated user's ID
      customerName: undefined, // Optional: add customer name input if needed
    };

    createOrder.mutate(orderData, {
      onSuccess: (data) => {
        toast.success(`Order #${data.orderNumber} created successfully!`);
        clearCart();
        closeCart();
        // Invalidate orders cache to refresh the orders list
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
      },
      onError: (error) => {
        toast.error(`Failed to create order: ${error.message}`);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={closeCart}
      />

      {/* Cart Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50",
          "transform transition-transform duration-300 ease-in-out",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Your Order</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeCart}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close cart</span>
          </Button>
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
              <Button onClick={closeCart} variant="outline">
                Continue Shopping
              </Button>
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
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-semibold text-primary">
                          <PriceDisplay
                            price={item.price * item.quantity}
                            symbolSize={14}
                            variant="primary"
                            className="font-semibold"
                          />
                        </span>

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
          <div className="border-t p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({cart.itemCount} items)</span>
                <PriceDisplay price={cart.total} symbolSize={14} />
              </div>
              <div className="flex justify-between text-sm">
                <span>VAT (15%)</span>
                <PriceDisplay price={cart.total * 0.15} symbolSize={14} />
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <PriceDisplay
                  price={cart.total * 1.15}
                  symbolSize={16}
                  className="font-semibold text-lg"
                />
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
    </>
  );
}
