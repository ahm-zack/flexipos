"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus,
  Minus,
  Trash2,
  Package,
  AlertCircle,
  Banknote,
  CreditCard,
  Split,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "@/modules/orders-feature/hooks/use-orders";
import { Order, OrderItem } from "@/lib/orders";
import { createClient } from "@/utils/supabase/client";
import { useBusinessContext } from "@/modules/providers/components/business-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditableOrderItem extends OrderItem {
  quantity: number;
}

export function EditOrderDialog({
  order,
  open,
  onOpenChange,
}: EditOrderDialogProps) {
  const [items, setItems] = useState<EditableOrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mixed">(
    "cash",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const { businessId } = useBusinessContext();

  // Reset items and payment method when order changes
  useEffect(() => {
    if (order) {
      setItems(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (order.items as any[]).map((item: any) => {
          const unitPrice: number =
            (item.unitPrice as number) ?? (item.price as number) ?? 0;
          const qty: number = item.quantity ?? 1;
          return {
            ...item,
            unitPrice,
            quantity: qty,
            totalPrice: item.totalPrice ?? unitPrice * qty,
          };
        }),
      );
      setPaymentMethod(
        (((order as Record<string, unknown>).paymentMethod ||
          (order as Record<string, unknown>).payment_method) as
          | "cash"
          | "card"
          | "mixed") ?? "cash",
      );
    } else {
      setItems([]);
      setPaymentMethod("cash");
    }
  }, [order]);

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            }
          : item,
      ),
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleSave = async () => {
    if (!order || !user) return;

    setIsSubmitting(true);

    try {
      if (!businessId) throw new Error("No business context");
      const supabase = createClient();

      // If no items remain, cancel the order
      if (items.length === 0) {
        // Fetch full order to snapshot it
        const { data: originalOrder, error: fetchErr } = await supabase
          .from("orders")
          .select("*")
          .eq("id", order.id)
          .single();
        if (fetchErr || !originalOrder)
          throw new Error(fetchErr?.message ?? "Order not found");

        const { error: cancelErr } = await supabase
          .from("canceled_orders")
          .insert({
            business_id: businessId,
            original_order_id: order.id,
            canceled_by: user.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            order_data: originalOrder as any,
            reason: "All items removed during edit",
          });
        if (cancelErr) throw new Error(cancelErr.message);

        const { error: updateErr } = await supabase
          .from("orders")
          .update({ status: "canceled" })
          .eq("id", order.id);
        if (updateErr) throw new Error(updateErr.message);

        toast.success("Order canceled - all items were removed");
        onOpenChange(false);
        startTransition(() => {
          queryClient.invalidateQueries({ queryKey: orderKeys.all });
        });
        return;
      } else {
        // Build reason description based on what changed
        const changes: string[] = [];

        if (
          paymentMethod !==
          ((order as Record<string, unknown>).paymentMethod ??
            (order as Record<string, unknown>).payment_method)
        ) {
          changes.push(`payment method to ${paymentMethod}`);
        }

        const originalItems = order.items as Record<string, unknown>[];
        if (items.length !== originalItems.length) {
          changes.push("item quantities");
        } else {
          const quantityChanged = items.some((item) => {
            const originalItem = originalItems.find(
              (orig) => orig.id === item.id,
            );
            return (
              originalItem &&
              (originalItem.quantity as number) !== item.quantity
            );
          });
          if (quantityChanged) changes.push("item quantities");
        }

        const reason =
          changes.length > 0
            ? `Modified ${changes.join(" and ")} via edit dialog`
            : "Order modified via edit dialog";

        // Fetch current order snapshot before mutating
        const { data: originalOrder, error: fetchErr } = await supabase
          .from("orders")
          .select("*")
          .eq("id", order.id)
          .single();
        if (fetchErr || !originalOrder)
          throw new Error(fetchErr?.message ?? "Order not found");

        const newTotal = calculateTotal();

        // Record modification
        const { error: modifyErr } = await supabase
          .from("modified_orders")
          .insert({
            business_id: businessId,
            original_order_id: order.id,
            modified_by: user.id,
            modification_type: "multiple_changes",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            original_data: originalOrder as any,
            new_data: {
              items,
              total_amount: newTotal,
              payment_method: paymentMethod,
              reason,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          });
        if (modifyErr) throw new Error(modifyErr.message);

        // Update order
        const { error: updateErr } = await supabase
          .from("orders")
          .update({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: items as any,
            total_amount: newTotal,
            payment_method: paymentMethod,
            status: "modified",
          })
          .eq("id", order.id);
        if (updateErr) throw new Error(updateErr.message);

        toast.success("Order modified successfully");
      }

      // Close dialog first so Radix finishes its animation, then refresh list
      onOpenChange(false);
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
      });
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = () => {
    if (!order) return false;
    const o = order as Record<string, unknown>;
    const origPayment = (o.paymentMethod ?? o.payment_method) as string;
    if (paymentMethod !== origPayment) return true;
    const origItems = order.items as Record<string, unknown>[];
    if (items.length !== origItems.length) return true;
    return items.some((item) => {
      const originalItem = origItems.find((orig) => orig.id === item.id);
      return (
        !originalItem || (originalItem.quantity as number) !== item.quantity
      );
    });
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Edit Order #
            {
              ((order as Record<string, unknown>).orderNumber ??
                (order as Record<string, unknown>).order_number) as string
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment:</span>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {paymentMethod}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <span className="ml-2">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as "cash" | "card" | "mixed")
                  }
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex flex-col">
                    <Label
                      htmlFor="edit-cash"
                      className={cn(
                        "flex items-center space-x-2 p-3 border rounded-lg",
                        "hover:bg-muted/50 transition-colors cursor-pointer",
                        "touch-manipulation select-none active:scale-95",
                        "min-h-[56px] w-full",
                        paymentMethod === "cash" &&
                          "border-primary bg-primary/5 ring-1 ring-primary/20",
                      )}
                    >
                      <RadioGroupItem value="cash" id="edit-cash" />
                      <div className="flex items-center gap-2 flex-1">
                        <Banknote className="h-4 w-4" />
                        <span className="text-xs font-medium">Cash</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex flex-col">
                    <Label
                      htmlFor="edit-card"
                      className={cn(
                        "flex items-center space-x-2 p-3 border rounded-lg",
                        "hover:bg-muted/50 transition-colors cursor-pointer",
                        "touch-manipulation select-none active:scale-95",
                        "min-h-[56px] w-full",
                        paymentMethod === "card" &&
                          "border-primary bg-primary/5 ring-1 ring-primary/20",
                      )}
                    >
                      <RadioGroupItem value="card" id="edit-card" />
                      <div className="flex items-center gap-2 flex-1">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-xs font-medium">Card</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex flex-col">
                    <Label
                      htmlFor="edit-mixed"
                      className={cn(
                        "flex items-center space-x-2 p-3 border rounded-lg",
                        "hover:bg-muted/50 transition-colors cursor-pointer",
                        "touch-manipulation select-none active:scale-95",
                        "min-h-[56px] w-full",
                        paymentMethod === "mixed" &&
                          "border-primary bg-primary/5 ring-1 ring-primary/20",
                      )}
                    >
                      <RadioGroupItem value="mixed" id="edit-mixed" />
                      <div className="flex items-center gap-2 flex-1">
                        <Split className="h-4 w-4" />
                        <span className="text-xs font-medium">Mixed</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Order Items</h3>

            {items.length === 0 ? (
              <Card className="border-dashed border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                    No items remaining
                  </h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Saving will cancel this order
                  </p>
                </CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        <SaudiRiyalSymbol size={12} className="inline mr-1" />
                        {item.unitPrice.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
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
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold flex items-center gap-1">
                        <SaudiRiyalSymbol size={14} />
                        <span className="text-green-600">
                          {item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold flex items-center gap-1">
                  <SaudiRiyalSymbol size={18} />
                  <span className="text-green-600">
                    {calculateTotal().toFixed(2)}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !hasChanges()}>
            {isSubmitting
              ? "Saving..."
              : items.length === 0
                ? "Cancel Order"
                : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
