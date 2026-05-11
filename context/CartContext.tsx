"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string; // optional
  quantity: number;
  title?: string; // optional
  details?: string; // optional
  rating?: number; // optional
  category?: string; // optional
  added_on?: string; // optional
  key_features?: string[]; // optional
  userId?: string; // optional
}

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD": {
      const existing = state.find((i) => i.id === action.item.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...state, { ...action.item, quantity: 1 }];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "SET_QTY":
      if (action.quantity <= 0) return state.filter((i) => i.id !== action.id);
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: action.quantity } : i,
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Hydrate from localStorage once on mount (client-only, no SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("softbuy_cart");
      if (saved) dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
    } catch {
      // corrupted data — ignore
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem("softbuy_cart", JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem: (item) => dispatch({ type: "ADD", item }),
        removeItem: (id) => dispatch({ type: "REMOVE", id }),
        setQuantity: (id, quantity) =>
          dispatch({ type: "SET_QTY", id, quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside <CartProvider>");
  return ctx;
}
