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
import { Banknote, Calculator, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CashCalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onCalculateChange: (cashReceived: number, change: number) => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

export function CashCalculatorDialog({
  open,
  onOpenChange,
  totalAmount,
  onCalculateChange,
}: CashCalculatorDialogProps) {
  const [cashReceived, setCashReceived] = useState<string>("");
  const [calculatedChange, setCalculatedChange] = useState<number>(0);
  const [isValidAmount, setIsValidAmount] = useState<boolean>(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCashReceived("");
      setCalculatedChange(0);
      setIsValidAmount(false);
    }
  }, [open]);

  // Calculate change whenever cash received changes
  useEffect(() => {
    const amount = parseFloat(cashReceived) || 0;
    const change = amount - totalAmount;
    setCalculatedChange(change);
    setIsValidAmount(amount >= totalAmount);
  }, [cashReceived, totalAmount]);

  const handleQuickAmount = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleCalculate = () => {
    const amount = parseFloat(cashReceived) || 0;
    if (amount >= totalAmount) {
      onCalculateChange(amount, calculatedChange);
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValidAmount) {
      handleCalculate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Cash Payment Calculator
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Calculate change for cash payment
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

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Amounts</Label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className={cn(
                    "h-10 transition-all duration-200",
                    parseInt(cashReceived) === amount &&
                      "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  <SaudiRiyalSymbol size={12} className="mr-1" />
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Cash Received Input */}
          <div className="space-y-2">
            <Label htmlFor="cash-received" className="text-sm font-medium">
              Cash Received
            </Label>
            <div className="relative">
              <Banknote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cash-received"
                type="number"
                placeholder="0.00"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 text-right text-lg font-medium"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Change Calculation Display */}
          {cashReceived && (
            <div
              className={cn(
                "rounded-lg p-4 transition-all duration-300 border-2",
                isValidAmount
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isValidAmount ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <Label className="font-medium">
                  {isValidAmount ? "Change to Give" : "Insufficient Amount"}
                </Label>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cash Received:</span>
                  <span className="font-medium">
                    <SaudiRiyalSymbol size={12} className="inline mr-1" />
                    {parseFloat(cashReceived).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Order Total:</span>
                  <span className="font-medium">
                    <SaudiRiyalSymbol size={12} className="inline mr-1" />
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Change:</span>
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        isValidAmount ? "text-green-600" : "text-red-600"
                      )}
                    >
                      <SaudiRiyalSymbol size={16} />
                      {Math.abs(calculatedChange).toFixed(2)}
                      {!isValidAmount && " (Short)"}
                    </span>
                  </div>
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
              onClick={handleCalculate}
              disabled={!isValidAmount || !cashReceived}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          </div>

          {/* Helpful Note */}
          <div className="text-center text-xs text-muted-foreground">
            💡 Tip: Use quick amounts or enter custom amount above
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
