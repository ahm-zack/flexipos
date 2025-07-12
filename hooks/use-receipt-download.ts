import { useCallback } from "react";
import { downloadReceiptPDF } from "@/components/restaurant-receipt";
import { Order } from "@/lib/orders";
import { RESTAURANT_CONFIG, type RestaurantConfig } from "@/lib/restaurant-config";

export function useReceiptDownload() {
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
          { ...RESTAURANT_CONFIG, ...options?.restaurantInfo },
          options?.cashierName
        );
      } catch (error) {
        console.error("Failed to download receipt:", error);
        throw error;
      }
    },
    []
  );

  return { downloadReceipt };
}
