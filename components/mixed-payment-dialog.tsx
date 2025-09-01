"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaudiRiyalSymbol } from "@/components/currency";
import {
  Banknote,
  CreditCard,
  Split,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface MixedPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onConfirmPayment: (cashAmount: number, cardAmount: number) => void;
}

const QUICK_CASH_AMOUNTS = [20, 50, 100, 200];

export function MixedPaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  onConfirmPayment,
}: MixedPaymentDialogProps) {
  const [cashAmount, setCashAmount] = useState<string>("");
  const [cardAmount, setCardAmount] = useState<string>("");
  const [autoCalculateCard, setAutoCalculateCard] = useState<boolean>(true);
  const [isValidPayment, setIsValidPayment] = useState<boolean>(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCashAmount("");
      setCardAmount("");
      setAutoCalculateCard(true);
      setIsValidPayment(false);
    }
  }, [open]);

  // Auto-calculate card amount when cash amount changes (if auto-calculate is enabled)
  useEffect(() => {
    if (autoCalculateCard) {
      const cash = parseFloat(cashAmount) || 0;
      const remaining = Math.max(0, totalAmount - cash);
      setCardAmount(remaining > 0 ? remaining.toFixed(2) : "");
    }
  }, [cashAmount, totalAmount, autoCalculateCard]);

  // Validate payment amounts
  useEffect(() => {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    const total = cash + card;

    // Payment is valid if total equals order amount and both amounts are positive
    setIsValidPayment(
      Math.abs(total - totalAmount) < 0.01 &&
        cash > 0 &&
        card > 0 &&
        cash <= totalAmount &&
        card <= totalAmount
    );
  }, [cashAmount, cardAmount, totalAmount]);

  const handleQuickCashAmount = (amount: number) => {
    setCashAmount(amount.toString());
    setAutoCalculateCard(true);
  };

  const handleCashAmountChange = (value: string) => {
    setCashAmount(value);
    // Keep auto-calculate enabled when user types in cash field
    setAutoCalculateCard(true);
  };

  const handleCardAmountChange = (value: string) => {
    setCardAmount(value);
    // Disable auto-calculate when user manually enters card amount
    setAutoCalculateCard(false);
  };

  const handleConfirm = () => {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;

    if (isValidPayment) {
      onConfirmPayment(cash, card);
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValidPayment) {
      handleConfirm();
    }
  };

  const totalEntered =
    (parseFloat(cashAmount) || 0) + (parseFloat(cardAmount) || 0);
  const difference = totalEntered - totalAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <Split className="h-6 w-6 text-purple-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Mixed Payment
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Split payment between cash and card
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Total Display */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">
                Order Total
              </Label>
              <div className="flex items-center gap-1 text-lg font-bold">
                <SaudiRiyalSymbol size={16} />
                <span>{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Cash Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Cash Amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_CASH_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickCashAmount(amount)}
                  disabled={amount > totalAmount}
                  className={cn(
                    "h-10 transition-all duration-200",
                    parseInt(cashAmount) === amount &&
                      "bg-green-600 text-white border-green-600"
                  )}
                >
                  <SaudiRiyalSymbol size={12} className="mr-1" />
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Split Inputs */}
          <div className="space-y-4">
            {/* Cash Amount Input */}
            <div className="space-y-2">
              <Label
                htmlFor="cash-amount"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Banknote className="h-4 w-4 text-green-600" />
                Cash Amount
              </Label>
              <div className="relative">
                <SaudiRiyalSymbol className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cash-amount"
                  type="number"
                  placeholder="0.00"
                  value={cashAmount}
                  onChange={(e) => handleCashAmountChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 text-right text-lg font-medium"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                />
              </div>
            </div>

            {/* Card Amount Input */}
            <div className="space-y-2">
              <Label
                htmlFor="card-amount"
                className="text-sm font-medium flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4 text-blue-600" />
                Card Amount
                {autoCalculateCard && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    (Auto-calculated)
                  </span>
                )}
              </Label>
              <div className="relative">
                <SaudiRiyalSymbol className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="card-amount"
                  type="number"
                  placeholder="0.00"
                  value={cardAmount}
                  onChange={(e) => handleCardAmountChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "pl-10 text-right text-lg font-medium",
                    autoCalculateCard && "bg-muted/50"
                  )}
                  step="0.01"
                  min="0"
                  max={totalAmount}
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {(cashAmount || cardAmount) && (
            <div
              className={cn(
                "rounded-lg p-4 transition-all duration-300 border-2",
                isValidPayment
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                {isValidPayment ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <Label className="font-medium">
                  {isValidPayment
                    ? "Payment Split Valid"
                    : "Payment Amount Mismatch"}
                </Label>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Banknote className="h-3 w-3 text-green-600" />
                    Cash:
                  </span>
                  <span className="font-medium">
                    <SaudiRiyalSymbol size={12} className="inline mr-1" />
                    {(parseFloat(cashAmount) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-blue-600" />
                    Card:
                  </span>
                  <span className="font-medium">
                    <SaudiRiyalSymbol size={12} className="inline mr-1" />
                    {(parseFloat(cardAmount) || 0).toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Total Payment:</span>
                  <span className="font-medium">
                    <SaudiRiyalSymbol size={12} className="inline mr-1" />
                    {totalEntered.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Order Total:</span>
                  <span className="font-medium">
                    <SaudiRiyalSymbol size={12} className="inline mr-1" />
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Difference:</span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      Math.abs(difference) < 0.01
                        ? "text-green-600"
                        : difference > 0
                        ? "text-orange-600"
                        : "text-red-600"
                    )}
                  >
                    <SaudiRiyalSymbol size={16} />
                    {Math.abs(difference) < 0.01
                      ? "0.00"
                      : `${difference > 0 ? "+" : ""}${difference.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValidPayment || !cashAmount || !cardAmount}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </div>

          {/* Helpful Note */}
          <div className="text-center text-xs text-muted-foreground">
            💡 Tip: Enter cash amount and card amount will be calculated
            automatically
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
