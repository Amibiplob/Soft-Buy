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
  price: number;
  image: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  toggleItem: (item: WishlistItem) => Promise<void>;
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

  const refreshWishlist = async () => {
    if (status !== "authenticated") {
      setItems([]);
      return;
    }
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [status]);

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  const toggleItem = async (item: WishlistItem) => {
    if (status !== "authenticated") {
      // Optional: redirect to login instead
      console.warn("Must be logged in to use wishlist");
      return;
    }

    setLoading(true);
    const alreadyIn = isInWishlist(item.id);

    // optimistic update
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
      // revert on failure
      setItems((prev) =>
        alreadyIn ? [...prev, item] : prev.filter((i) => i.id !== item.id),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, loading, toggleItem, isInWishlist, refreshWishlist }}
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
