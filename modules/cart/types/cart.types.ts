export interface CartItemModifier {
  id: string;
  name: string;
  type: 'extra' | 'without';
  price: number;
}

export interface CartItem {
  id: string;
  /**
   * The raw product id (stable, no modifier suffix).
   * Used for stock tracking across modifier variants.
   */
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
  image?: string;
  modifiers?: CartItemModifier[];
  modifiersTotal?: number;
  /** null = unlimited stock; undefined = not tracked; 0 = out of stock */
  stockQuantity?: number | null;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}
