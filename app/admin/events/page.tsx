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
import { useTranslations } from "next-intl";

export default function EventDiscountPage() {
  const t = useTranslations("events");
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
      toast.error(t("toasts.invalidPercentage"));
      return;
    }

    if (!tempEventName.trim()) {
      toast.error(t("toasts.missingName"));
      return;
    }

    updateDiscount(percentage, tempEventName.trim());
    toast.success(t("toasts.updated"));
  };

  const handleActivate = () => {
    if (!tempEventName.trim()) {
      toast.error(t("toasts.missingNameBeforeActivate"));
      return;
    }

    const percentage = parseFloat(tempPercentage);
    if (isNaN(percentage) || percentage <= 0) {
      toast.error(t("toasts.missingPercentageBeforeActivate"));
      return;
    }

    // Update first, then activate
    updateDiscount(percentage, tempEventName.trim());
    activate();
    toast.success(t("toasts.activated", { name: tempEventName, percentage }));
  };

  const handleDeactivate = () => {
    deactivate();
    toast.success(t("toasts.deactivated"));
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t("title")}
          </h1>
        </div>

        {/* Top Cards - How It Works and Current Status Side by Side */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* How It Works Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("howItWorks")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p>
                  &bull; <strong>{t("eventName")}:</strong>{" "}
                  {t("howItWorksItems.eventName")}
                </p>
                <p>
                  &bull; <strong>{t("discountPercentage")}:</strong>{" "}
                  {t("howItWorksItems.percentage")}
                </p>
                <p>
                  &bull; <strong>{t("globalApplication")}:</strong>{" "}
                  {t("howItWorksItems.global")}
                </p>
                <p>
                  &bull; <strong>{t("orderHistory")}:</strong>{" "}
                  {t("howItWorksItems.history")}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>{t("tipLabel")}</strong> {t("tip")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("currentStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{t("statusLabel")}</p>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? t("currentlyActive") : t("currentlyInactive")}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium text-center sm:text-left ${
                    isActive
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {isActive ? t("active") : t("inactive")}
                </div>
              </div>

              {isActive && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Percent className="h-4 w-4" />
                    <span className="font-medium">
                      {t("discountActive", { name: eventName, percentage: discountPercentage })}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {t("allOrdersDiscount")}
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
              <CardTitle>{t("configuration")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">{t("eventName")}</Label>
                <Input
                  id="eventName"
                  placeholder={t("eventNamePlaceholder")}
                  value={tempEventName}
                  onChange={(e) => setTempEventName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">{t("discountPercentage")}</Label>
                <div className="relative">
                  <Input
                    id="discountPercentage"
                    type="number"
                    placeholder={t("percentagePlaceholder")}
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
                {t("updateSettings")}
              </Button>
            </CardContent>
          </Card>

          {/* Control Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("activationControl")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    {t("toggleLabel")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("toggleDesc")}
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
                  {t("activate")}
                </Button>
                <Button
                  onClick={handleDeactivate}
                  disabled={!isActive}
                  className="w-full"
                  variant={isActive ? "destructive" : "secondary"}
                >
                  {t("deactivate")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
