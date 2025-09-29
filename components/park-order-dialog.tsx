"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingCircle, User, Phone, MapPin, FileText } from "lucide-react";
import { useParkedOrders } from "@/hooks/use-parked-orders";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { CartItem } from "@/modules/cart/types/cart.types";

interface ParkOrderDialogProps {
  cartData: {
    items: CartItem[];
    total: number;
    itemCount: number;
  };
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: "cash" | "card" | "mixed" | "delivery";
  discountData?: {
    type: "percentage" | "amount";
    value: string;
    amount: number;
  };
  onParkSuccess: () => void;
  trigger?: React.ReactNode;
}

export function ParkOrderDialog({
  cartData,
  customerName: initialCustomerName = "",
  customerPhone: initialCustomerPhone = "",
  customerAddress: initialCustomerAddress = "",
  paymentMethod,
  discountData,
  onParkSuccess,
  trigger,
}: ParkOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone);
  const [customerAddress, setCustomerAddress] = useState(
    initialCustomerAddress
  );
  const [note, setNote] = useState("");
  const [isParking, setIsParking] = useState(false);

  const { parkOrder } = useParkedOrders();
  const { user } = useCurrentUser();

  const handleParkOrder = async () => {
    if (cartData.items.length === 0) {
      toast.error("Cannot park an empty cart");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to park orders");
      return;
    }

    setIsParking(true);

    try {
      await parkOrder({
        cartData,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        paymentMethod,
        discountData,
        note: note.trim() || undefined,
        parkedBy: user.id,
      });

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setNote("");
      setIsOpen(false);

      // Call success callback to clear cart
      onParkSuccess();
    } catch (error) {
      console.error("Error parking order:", error);
      toast.error("Failed to park order");
    } finally {
      setIsParking(false);
    }
  };

  const resetForm = () => {
    setCustomerName(initialCustomerName);
    setCustomerPhone(initialCustomerPhone);
    setCustomerAddress(initialCustomerAddress);
    setNote("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ParkingCircle className="h-4 w-4 mr-2" />
            Park Order
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ParkingCircle className="h-5 w-5" />
            Park Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-sm font-medium mb-2">Order Summary</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Items: {cartData.itemCount}</div>
              <div>Total: {cartData.total.toFixed(2)} SAR</div>
              <div>Payment: {paymentMethod}</div>
              {discountData && (
                <div className="text-green-600">
                  Discount:{" "}
                  {discountData.type === "percentage"
                    ? `${discountData.value}%`
                    : `${discountData.amount.toFixed(2)} SAR`}
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Customer Information (Optional)
            </Label>

            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Note (Optional)
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="note"
                placeholder="Add any notes about this order..."
                value={note}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNote(e.target.value)
                }
                className="pl-10"
                maxLength={200}
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {note.length}/200 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isParking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleParkOrder}
              disabled={isParking || cartData.items.length === 0}
              className="flex-1"
            >
              {isParking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Parking...
                </>
              ) : (
                <>
                  <ParkingCircle className="h-4 w-4 mr-2" />
                  Park Order
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2">
            💡 <strong>Tip:</strong> Parked orders are saved locally and will be
            available until you clear them or they expire after 24 hours.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
