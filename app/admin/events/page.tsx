"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEventDiscountStore } from "@/hooks/use-event-discount";
import { useState } from "react";
import { toast } from "sonner";
import { Percent, Calendar, Settings } from "lucide-react";

export default function EventDiscountPage() {
  const {
    isActive,
    discountPercentage,
    eventName,
    activate,
    deactivate,
    updateDiscount,
  } = useEventDiscountStore();

  const [tempEventName, setTempEventName] = useState(eventName);
  const [tempPercentage, setTempPercentage] = useState(
    discountPercentage.toString()
  );

  const handleUpdateDiscount = () => {
    const percentage = parseFloat(tempPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    if (!tempEventName.trim()) {
      toast.error("Please enter an event name");
      return;
    }

    updateDiscount(percentage, tempEventName.trim());
    toast.success("Event discount updated successfully!");
  };

  const handleActivate = () => {
    if (!tempEventName.trim()) {
      toast.error("Please enter an event name before activating");
      return;
    }

    const percentage = parseFloat(tempPercentage);
    if (isNaN(percentage) || percentage <= 0) {
      toast.error("Please set a valid discount percentage before activating");
      return;
    }

    // Update first, then activate
    updateDiscount(percentage, tempEventName.trim());
    activate();
    toast.success(
      `Event discount "${tempEventName}" activated at ${percentage}%!`
    );
  };

  const handleDeactivate = () => {
    deactivate();
    toast.success("Event discount deactivated");
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold">
            Event Discount Management
          </h1>
        </div>

        {/* Top Cards - How It Works and Current Status Side by Side */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* How It Works Card */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  • <strong>Event Name:</strong> This will be displayed on
                  receipts and order summaries
                </p>
                <p>
                  • <strong>Discount Percentage:</strong> Applied automatically
                  to all orders when active
                </p>
                <p>
                  • <strong>Global Application:</strong> The discount applies
                  site-wide to all cart operations
                </p>
                <p>
                  • <strong>Order History:</strong> All orders will record the
                  event discount for tracking
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Make sure to set both the event name
                  and percentage before activating. The discount will be applied
                  immediately to all new orders.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Event Discount Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? "Currently active" : "Currently inactive"}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium text-center sm:text-left ${
                    isActive
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </div>
              </div>

              {isActive && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Percent className="h-4 w-4" />
                    <span className="font-medium">
                      &ldquo;{eventName}&rdquo; - {discountPercentage}% discount
                      active
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    All orders will automatically receive this discount
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Cards - Configuration and Control */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Event Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  placeholder="e.g., Grand Opening, Black Friday, etc."
                  value={tempEventName}
                  onChange={(e) => setTempEventName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <div className="relative">
                  <Input
                    id="discountPercentage"
                    type="number"
                    placeholder="Enter percentage (0-100)"
                    min="0"
                    max="100"
                    step="0.1"
                    value={tempPercentage}
                    onChange={(e) => setTempPercentage(e.target.value)}
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button onClick={handleUpdateDiscount} className="w-full">
                Update Discount Settings
              </Button>
            </CardContent>
          </Card>

          {/* Control Card */}
          <Card>
            <CardHeader>
              <CardTitle>Activation Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    Event Discount Active
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle to activate/deactivate the event discount
                  </p>
                </div>
                <div className="flex justify-center sm:justify-end">
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        handleActivate();
                      } else {
                        handleDeactivate();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleActivate}
                  disabled={isActive}
                  className="w-full"
                  variant={isActive ? "secondary" : "default"}
                >
                  Activate Event
                </Button>
                <Button
                  onClick={handleDeactivate}
                  disabled={!isActive}
                  className="w-full"
                  variant={isActive ? "destructive" : "secondary"}
                >
                  Deactivate Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
