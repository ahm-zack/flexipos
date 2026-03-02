/**
 * Global stock store — tracks available quantities in memory.
 *
 * Strategy:
 *  • `initializeStock` is called when products load from the server.
 *    It sets DB quantities, then subtracts whatever is already in the
 *    persisted cart (handles page-reload scenarios).
 *  • `decrementStock` is called when an item is added to the cart.
 *  • `incrementStock` is called when an item is removed or its qty reduced.
 *  • On checkout we call the DB batch-deduct API once, so the DB catches up.
 *
 * Rules:
 *  • null  → unlimited (untracked product) — store is a no-op for these.
 *  • 0     → out of stock.
 *  • N > 0 → N units available.
 */

import { create } from "zustand";
import type { CartItem } from "@/modules/cart/types/cart.types";

/** Extract the raw product id from a cart item id (may have __modifier suffix). */
export function getProductIdFromItemId(itemId: string): string {
    return itemId.split("__")[0];
}

interface StockState {
    /**
     * Available quantities keyed by productId.
     * undefined  → product not in store (fallback to prop)
     * null       → unlimited / untracked
     * number     → remaining units
     */
    quantities: Record<string, number | null>;

    /**
     * Load initial stock from freshly-fetched product list.
     * Pass current cart items so already-in-cart quantities are subtracted
     * (important on page reload when the cart is pre-populated from localStorage).
     *
     * Safe to call again when products re-fetch — resets to DB values then
     * re-applies the current cart offset.
     */
    initializeStock: (
        products: Array<{ id: string; stockQuantity?: number | null }>,
        cartItems?: CartItem[],
    ) => void;

    /** Deduct `qty` from the available count (called on addItem). */
    decrementStock: (productId: string, qty: number) => void;

    /** Restore `qty` to the available count (called on removeItem / reduce qty). */
    incrementStock: (productId: string, qty: number) => void;

    /** Clear the store (called when products list unmounts or after checkout). */
    resetStock: () => void;
}

export const useStockStore = create<StockState>((set, get) => ({
    quantities: {},

    initializeStock: (products, cartItems = []) => {
        // 1. Seed from DB values
        const quantities: Record<string, number | null> = {};
        for (const p of products) {
            // stockQuantity: undefined means the column exists but wasn't loaded — treat as null
            quantities[p.id] =
                p.stockQuantity !== undefined ? (p.stockQuantity ?? null) : null;
        }

        // 2. Subtract quantities already sitting in the persisted cart
        for (const item of cartItems) {
            const productId = item.productId ?? getProductIdFromItemId(item.id);
            if (productId in quantities && quantities[productId] !== null) {
                quantities[productId] = Math.max(
                    0,
                    (quantities[productId] as number) - item.quantity,
                );
            }
        }

        set({ quantities });
    },

    decrementStock: (productId, qty) => {
        const { quantities } = get();
        if (!(productId in quantities) || quantities[productId] === null) return;
        set((state) => ({
            quantities: {
                ...state.quantities,
                [productId]: Math.max(
                    0,
                    (state.quantities[productId] as number) - qty,
                ),
            },
        }));
    },

    incrementStock: (productId, qty) => {
        const { quantities } = get();
        if (!(productId in quantities) || quantities[productId] === null) return;
        set((state) => ({
            quantities: {
                ...state.quantities,
                [productId]: (state.quantities[productId] as number) + qty,
            },
        }));
    },

    resetStock: () => set({ quantities: {} }),
}));
