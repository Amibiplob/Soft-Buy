"use client";

import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { items, fetching, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: (typeof items)[number]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

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
                    ${item.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    disabled={!item.inStock}
                    onClick={() => handleAddToCart(item)}
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
