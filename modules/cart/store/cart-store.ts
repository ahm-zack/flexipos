import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Cart, CartItem, CartItemModifier } from "../types/cart.types";
import {
    useStockStore,
    getProductIdFromItemId,
} from "@/modules/stock/store/stock-store";

// ── Helpers ────────────────────────────────────────────────────────────────

function createItemHash(item: CartItem): string {
    const baseHash = `${item.id}-${item.name}`;
    const sortedModifiers = [...(item.modifiers || [])].sort((a, b) =>
        a.name.localeCompare(b.name),
    );
    const modifierHash = sortedModifiers
        .map((m) => `${m.name}-${m.type}-${m.price}`)
        .join(",");
    return `${baseHash}|${modifierHash}`;
}

function calculateModifiersTotal(modifiers: CartItemModifier[]): number {
    return (
        modifiers?.reduce(
            (sum, m) => sum + (m.type === "extra" ? m.price : 0),
            0,
        ) ?? 0
    );
}

function recalcTotals(cart: Cart): Cart {
    const total = cart.items.reduce((sum, item) => {
        return (
            sum +
            item.price * item.quantity +
            (item.modifiersTotal ?? 0) * item.quantity
        );
    }, 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    return { ...cart, total: Math.round(total * 100) / 100, itemCount };
}

const EMPTY_CART: Cart = { items: [], total: 0, itemCount: 0 };

// ── Store ──────────────────────────────────────────────────────────────────

export interface CartStore {
    cart: Cart;
    isOpen: boolean;

    addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            cart: EMPTY_CART,
            isOpen: false,

            addItem: (payload, qty = 1) =>
                set((state) => {
                    const wasEmpty = state.cart.items.length === 0;
                    const modifiersTotal = calculateModifiersTotal(
                        payload.modifiers ?? [],
                    );
                    const incoming = { ...payload, modifiersTotal } as CartItem;
                    const hash = createItemHash(incoming);

                    const existingIdx = state.cart.items.findIndex(
                        (i) => createItemHash(i) === hash,
                    );

                    let newItems: CartItem[];
                    if (existingIdx !== -1) {
                        newItems = state.cart.items.map((item, idx) =>
                            idx === existingIdx
                                ? { ...item, quantity: item.quantity + qty }
                                : item,
                        );
                    } else {
                        newItems = [...state.cart.items, { ...incoming, quantity: qty }];
                    }

                    // Decrement global stock (no-op for unlimited products)
                    const productId =
                        payload.productId ?? getProductIdFromItemId(payload.id);
                    useStockStore.getState().decrementStock(productId, qty);

                    const newCart = recalcTotals({ ...state.cart, items: newItems });
                    const shouldAutoOpen = wasEmpty && !state.isOpen;
                    return {
                        cart: newCart,
                        isOpen: shouldAutoOpen || state.isOpen,
                    };
                }),

            removeItem: (itemId) =>
                set((state) => {
                    const removedItem = state.cart.items.find((i) => i.id === itemId);
                    if (removedItem) {
                        const productId =
                            removedItem.productId ??
                            getProductIdFromItemId(removedItem.id);
                        // Restore stock when item is fully removed
                        useStockStore
                            .getState()
                            .incrementStock(productId, removedItem.quantity);
                    }
                    const newItems = state.cart.items.filter((i) => i.id !== itemId);
                    const newCart = recalcTotals({ ...state.cart, items: newItems });
                    return {
                        cart: newCart,
                        isOpen: newCart.items.length === 0 ? false : state.isOpen,
                    };
                }),

            updateQuantity: (itemId, quantity) =>
                set((state) => {
                    const existingItem = state.cart.items.find(
                        (i) => i.id === itemId,
                    );

                    if (!existingItem) {
                        return state;
                    }

                    const productId =
                        existingItem.productId ??
                        getProductIdFromItemId(existingItem.id);
                    const stockStore = useStockStore.getState();

                    if (quantity <= 0) {
                        // Fully removing: restore all of this item's stock
                        stockStore.incrementStock(
                            productId,
                            existingItem.quantity,
                        );
                        const newItems = state.cart.items.filter(
                            (i) => i.id !== itemId,
                        );
                        const newCart = recalcTotals({
                            ...state.cart,
                            items: newItems,
                        });
                        return {
                            cart: newCart,
                            isOpen:
                                newCart.items.length === 0
                                    ? false
                                    : state.isOpen,
                        };
                    }

                    // Partial change: sync the delta
                    const diff = quantity - existingItem.quantity;
                    if (diff > 0) {
                        stockStore.decrementStock(productId, diff);
                    } else if (diff < 0) {
                        stockStore.incrementStock(productId, -diff);
                    }

                    const newItems = state.cart.items.map((i) =>
                        i.id === itemId ? { ...i, quantity } : i,
                    );
                    return {
                        cart: recalcTotals({ ...state.cart, items: newItems }),
                    };
                }),

            clearCart: () => set({ cart: EMPTY_CART, isOpen: false }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
        }),
        {
            name: "flexipos-cart",
            // Only persist the cart items, not the open/close UI state
            partialize: (state) => ({ cart: state.cart }),
        },
    ),
);
