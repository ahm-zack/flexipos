"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Cart, CartItem, CartContextType } from "../types/cart.types";

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

// Cart reducer
function cartReducer(
  state: { cart: Cart; isOpen: boolean },
  action: CartAction
): { cart: Cart; isOpen: boolean } {
  switch (action.type) {
    case "ADD_ITEM": {
      const wasEmpty = state.cart.items.length === 0;
      const existingItem = state.cart.items.find(
        (item) => item.id === action.payload.id
      );

      let newItems: CartItem[];
      if (existingItem) {
        // Update quantity if item exists
        newItems = state.cart.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.cart.items, { ...action.payload, quantity: 1 }];
      }

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

// Helper function to calculate cart totals
function calculateCartTotals(cart: Cart): Cart {
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...cart,
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    itemCount,
  };
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
