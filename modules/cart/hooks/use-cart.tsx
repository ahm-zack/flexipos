"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  Cart,
  CartItem,
  CartContextType,
  CartItemModifier,
} from "../types/cart.types";

// Cart reducer actions
type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: Cart }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "TOGGLE_CART" };

// Initial cart state
const initialCart: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Initial context state
const initialState = {
  cart: initialCart,
  isOpen: false,
};

// Helper function to create a unique hash for item + modifiers combination
function createItemHash(item: CartItem): string {
  // Include base item ID and name
  const baseHash = `${item.id}-${item.name}`;

  // Sort modifiers for consistent hashing
  const sortedModifiers = [...(item.modifiers || [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Create modifier hash including name, type, and price
  const modifierHash = sortedModifiers
    .map((m) => `${m.name}-${m.type}-${m.price}`)
    .join(",");

  return `${baseHash}|${modifierHash}`;
}

// Helper function to calculate modifiers total
function calculateModifiersTotal(modifiers: CartItemModifier[]): number {
  return (
    modifiers?.reduce((sum, modifier) => {
      return sum + (modifier.type === "extra" ? modifier.price : 0);
    }, 0) || 0
  );
}

// Helper function to calculate cart totals
function calculateCartTotals(cart: Cart): Cart {
  const total = cart.items.reduce((sum, item) => {
    const basePrice = item.price * item.quantity;
    const modifiersPrice = (item.modifiersTotal || 0) * item.quantity;
    return sum + basePrice + modifiersPrice;
  }, 0);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...cart,
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    itemCount,
  };
}

// Cart reducer
function cartReducer(
  state: { cart: Cart; isOpen: boolean },
  action: CartAction
): { cart: Cart; isOpen: boolean } {
  switch (action.type) {
    case "ADD_ITEM": {
      const wasEmpty = state.cart.items.length === 0;

      // Calculate modifiers total for the new item
      const modifiersTotal = calculateModifiersTotal(
        action.payload.modifiers || []
      );
      const newItemWithModifiersTotal = {
        ...action.payload,
        modifiersTotal,
      };

      const hash = createItemHash(newItemWithModifiersTotal as CartItem);

      // Check if item with same base item + modifiers exists
      const existingItemIndex = state.cart.items.findIndex(
        (item) => createItemHash(item) === hash
      );

      if (existingItemIndex !== -1) {
        // If item with same modifiers exists, increase quantity
        const newItems = state.cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        const newCart = calculateCartTotals({ ...state.cart, items: newItems });
        return { ...state, cart: newCart };
      }

      // If item doesn't exist or has different modifiers, add as new item
      const newItems = [
        ...state.cart.items,
        { ...newItemWithModifiersTotal, quantity: 1 },
      ];

      const newCart = calculateCartTotals({ ...state.cart, items: newItems });

      // Auto-open cart when first item is added to empty cart
      const shouldAutoOpen = wasEmpty && !state.isOpen;

      return {
        ...state,
        cart: newCart,
        isOpen: shouldAutoOpen || state.isOpen,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.cart.items.filter(
        (item) => item.id !== action.payload
      );
      const newCart = calculateCartTotals({ ...state.cart, items: newItems });

      // Auto-close cart when it becomes empty
      const shouldAutoClose = newCart.items.length === 0;

      return {
        ...state,
        cart: newCart,
        isOpen: shouldAutoClose ? false : state.isOpen,
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.cart.items.filter(
          (item) => item.id !== action.payload.id
        );
        const newCart = calculateCartTotals({ ...state.cart, items: newItems });

        // Auto-close cart when it becomes empty
        const shouldAutoClose = newCart.items.length === 0;

        return {
          ...state,
          cart: newCart,
          isOpen: shouldAutoClose ? false : state.isOpen,
        };
      }

      const newItems = state.cart.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const newCart = calculateCartTotals({ ...state.cart, items: newItems });
      return { ...state, cart: newCart };
    }

    case "CLEAR_CART":
      return { ...state, cart: initialCart, isOpen: false };

    case "LOAD_CART":
      return { ...state, cart: action.payload };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("lazaza-cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: parsedCart });
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("lazaza-cart", JSON.stringify(state.cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state.cart]);

  // Context value
  const contextValue: CartContextType = {
    cart: state.cart,
    addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
    removeItem: (itemId) => dispatch({ type: "REMOVE_ITEM", payload: itemId }),
    updateQuantity: (itemId, quantity) =>
      dispatch({ type: "UPDATE_QUANTITY", payload: { id: itemId, quantity } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    isOpen: state.isOpen,
    openCart: () => dispatch({ type: "OPEN_CART" }),
    closeCart: () => dispatch({ type: "CLOSE_CART" }),
    toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
