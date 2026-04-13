import { useCallback } from "react";
import { downloadReceiptPDF } from "@/components/restaurant-receipt";
import { Order } from "@/lib/orders";
import { RESTAURANT_CONFIG, type RestaurantConfig } from "@/lib/restaurant-config";
import { useBusiness } from "@/hooks/useBusinessId";
import { toRestaurantConfig } from "@/lib/business-profile";

export function useReceiptDownload() {
  const { business } = useBusiness();

  const downloadReceipt = useCallback(
    async (
      order: Order,
      options?: {
        restaurantInfo?: Partial<RestaurantConfig>;
        cashierName?: string;
      }
    ) => {
      try {
        await downloadReceiptPDF(
          order,
          {
            ...RESTAURANT_CONFIG,
            ...toRestaurantConfig(business),
            ...options?.restaurantInfo,
          },
          options?.cashierName
        );
      } catch (error) {
        console.error("Failed to download receipt:", error);
        throw error;
      }
    },
    [business]
  );

  return { downloadReceipt };
}
