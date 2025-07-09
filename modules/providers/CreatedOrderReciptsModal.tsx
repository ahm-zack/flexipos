"use client";

import { ReceiptModal } from "../cart/components/cart-panel";
import { useCreatedOrderStore } from "../cart/hooks/useCreatedOrderStore";

export function CreatedOrderReciptModal() {
  const { createdOrder, setCreatedOrder } = useCreatedOrderStore();
  console.log("CreatedOrderReciptModal", createdOrder);
  if (!createdOrder) return null;
  return (
    <ReceiptModal
      order={createdOrder}
      onClose={() => {
        setCreatedOrder(null);
      }}
    />
  );
}
