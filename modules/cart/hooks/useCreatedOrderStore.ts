import { ApiOrder } from "@/modules/orders-feature";
import { create } from "zustand";

interface CreatedOrderStore {
  createdOrder: ApiOrder | null;
  setCreatedOrder: (order: ApiOrder | null) => void;
}

export const useCreatedOrderStore = create<CreatedOrderStore>((set) => ({
  createdOrder: null,
  setCreatedOrder: (order) => set({ createdOrder: order })
}));