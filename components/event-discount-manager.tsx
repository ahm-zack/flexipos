"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEventDiscountStore } from "@/hooks/use-event-discount";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import {
  Percent,
  Calendar,
  User,
  Clock,
  Zap,
  ZapOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function EventDiscountManager() {
  const { user } = useCurrentUser();
  const {
    isActive,
    discountPercentage,
    eventName,
    activatedBy,
    activatedAt,
    activateEventDiscount,
    deactivateEventDiscount,
    updateDiscountPercentage,
  } = useEventDiscountStore();

  const [inputPercentage, setInputPercentage] = useState<string>("");
  const [inputEventName, setInputEventName] = useState<string>("");

  const handleActivate = () => {
    const percentage = parseFloat(inputPercentage);

    if (!percentage || percentage <= 0 || percentage > 100) {
      toast.error("Please enter a valid percentage between 1-100");
      return;
    }

    if (!inputEventName.trim()) {
      toast.error("Please enter an event name");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to activate event discounts");
      return;
    }

    activateEventDiscount(percentage, inputEventName.trim(), user.email);

    toast.success(
      `🎉 Event discount activated! ${percentage}% off for "${inputEventName.trim()}"`,
      { duration: 5000 }
    );

    // Clear inputs
    setInputPercentage("");
    setInputEventName("");
  };

  const handleDeactivate = () => {
    deactivateEventDiscount();
    toast.success("Event discount deactivated", { duration: 3000 });
  };

  const handleUpdatePercentage = () => {
    const percentage = parseFloat(inputPercentage);

    if (!percentage || percentage <= 0 || percentage > 100) {
      toast.error("Please enter a valid percentage between 1-100");
      return;
    }

    updateDiscountPercentage(percentage);
    toast.success(`Updated event discount to ${percentage}%`);
    setInputPercentage("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Event Discount Manager</CardTitle>
          </div>
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-600" : ""}
          >
            {isActive ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <ZapOff className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Apply site-wide percentage discounts for special events
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        {isActive && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-900 dark:text-green-100">
                Active Event Discount
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Event:</span>
                  <span>{eventName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Discount:</span>
                  <span className="font-bold text-green-700 dark:text-green-300">
                    {discountPercentage}% OFF
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Activated by:</span>
                  <span>{activatedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="font-medium">Since:</span>
                  <span>
                    {activatedAt && new Date(activatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Controls */}
        <div className="space-y-4">
          {!isActive ? (
            // Activation Form
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    placeholder="e.g., Grand Opening, Holiday Sale"
                    value={inputEventName}
                    onChange={(e) => setInputEventName(e.target.value)}
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPercentage">
                    Discount Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="discountPercentage"
                      type="number"
                      placeholder="20"
                      min="1"
                      max="100"
                      value={inputPercentage}
                      onChange={(e) => setInputPercentage(e.target.value)}
                      className="pr-8"
                    />
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleActivate}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Activate Event Discount
              </Button>
            </>
          ) : (
            // Update & Deactivate Controls
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="updatePercentage">
                    Update Discount Percentage
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="updatePercentage"
                        type="number"
                        placeholder={discountPercentage.toString()}
                        min="1"
                        max="100"
                        value={inputPercentage}
                        onChange={(e) => setInputPercentage(e.target.value)}
                        className="pr-8"
                      />
                      <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button onClick={handleUpdatePercentage} variant="outline">
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDeactivate}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <ZapOff className="h-4 w-4 mr-2" />
                  Deactivate Event Discount
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Event discounts apply automatically to
              all orders. Make sure to deactivate when the event ends to avoid
              unintended discounts.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
