"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  inStock: boolean;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  fetching: boolean;
  toggleItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const refreshWishlist = async () => {
    if (status !== "authenticated") {
      setItems([]);
      setFetching(false);
      return;
    }
    try {
      setFetching(true);
      const res = await fetch("/api/wishlist");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [status]);

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  const toggleItem = async (item: WishlistItem) => {
    if (status !== "authenticated") {
      console.warn("Must be logged in to use wishlist");
      return;
    }

    setLoading(true);
    const alreadyIn = isInWishlist(item.id);

    setItems((prev) =>
      alreadyIn ? prev.filter((i) => i.id !== item.id) : [...prev, item],
    );

    try {
      const res = await fetch("/api/wishlist", {
        method: alreadyIn ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      if (!res.ok) throw new Error("Wishlist update failed");
    } catch (err) {
      console.error(err);
      setItems((prev) =>
        alreadyIn ? [...prev, item] : prev.filter((i) => i.id !== item.id),
      );
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    setLoading(true);
    const removed = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: { id } }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
    } catch (err) {
      console.error(err);
      if (removed) setItems((prev) => [...prev, removed]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        fetching,
        toggleItem,
        removeItem,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
