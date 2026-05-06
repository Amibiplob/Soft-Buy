"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface WishlistItem {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  inStock: boolean;
}

const initialItems: WishlistItem[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: "$59.99",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=220&fit=crop",
    inStock: true,
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: "$89.99",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=220&fit=crop",
    inStock: true,
  },
  {
    id: 3,
    name: "Travel Backpack",
    category: "Bags",
    price: "$39.99",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=220&fit=crop",
    inStock: true,
  },
  {
    id: 4,
    name: "Running Shoes",
    category: "Fashion",
    price: "$60.99",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=220&fit=crop",
    inStock: false,
  },
  {
    id: 5,
    name: "Sunglasses",
    category: "Fashion",
    price: "$19.99",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=220&fit=crop",
    inStock: true,
  },
  {
    id: 6,
    name: "Coffee Maker",
    category: "Home Living",
    price: "$40.99",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=220&fit=crop",
    inStock: true,
  },
];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <span className="text-sm text-gray-500">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Your wishlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-red-500" />
                </button>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className="bg-white text-gray-600 border-gray-300 font-medium"
                    >
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {item.category}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {item.name}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-base font-bold text-green-600">
                    {item.price}
                  </span>
                  <Button
                    size="sm"
                    disabled={!item.inStock}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 gap-1.5 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
