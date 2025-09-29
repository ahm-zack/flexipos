import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

interface DeliveryPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (platform: "keeta" | "hunger_station" | "jahez") => void;
  selectedPlatform?: "keeta" | "hunger_station" | "jahez";
}

export function DeliveryPlatformDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedPlatform,
}: DeliveryPlatformDialogProps) {
  const [platform, setPlatform] = useState<
    "keeta" | "hunger_station" | "jahez"
  >(selectedPlatform || "keeta");

  const platforms = [
    {
      value: "keeta" as const,
      label: "Keeta",
      icon: "🟡",
    },
    {
      value: "hunger_station" as const,
      label: "Hunger Station",
      icon: "🟢",
    },
    {
      value: "jahez" as const,
      label: "Jahez",
      icon: "🔴",
    },
  ];

  const handleConfirm = () => {
    onConfirm(platform);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-foreground" />
            Select Delivery Platform
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Choose the delivery platform for this order:
          </div>

          <div className="grid gap-3">
            {platforms.map((platformOption) => (
              <button
                key={platformOption.value}
                type="button"
                onClick={() => setPlatform(platformOption.value)}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer text-left hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20
                  ${
                    platform === platformOption.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:bg-muted/50"
                  }
                `}
              >
                <span className="text-xl">{platformOption.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {platformOption.label}
                  </div>
                </div>
                {platform === platformOption.value && (
                  <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            <Truck className="h-4 w-4 mr-2" />
            Confirm Platform
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
