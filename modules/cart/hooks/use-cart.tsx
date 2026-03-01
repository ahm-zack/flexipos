"use client";

/**
 * use-cart.tsx
 * ------------
 * Thin adapter around the Zustand cart store.
 * Keeps the original `useCart()` hook API and `CartProvider` export
 * so every existing consumer works without any import changes.
 */

import React from "react";
import { useCartStore } from "../store/cart-store";
import type { CartContextType } from "../types/cart.types";

/** Drop-in replacement for the old context-based hook. */
export function useCart(): CartContextType {
  return useCartStore();
}

/**
 * CartProvider is now a no-op passthrough.
 * Zustand stores don't need a React provider — this is kept purely
 * so existing `<CartProvider>` usage in the tree compiles unchanged.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
