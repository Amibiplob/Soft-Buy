"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingCart,
  Check,
  Heart,
  Zap,
  Star,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Product } from "@/types/product";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { addItem, items } = useCart();
  const { toggleItem, isInWishlist, loading: wishlistLoading } = useWishlist();

  const isProductInCart = items.some((item) => item.id === product?._id);
  const isWishlisted = product ? isInWishlist(product._id) : false;
  const outOfStock = (product?.stock ?? 0) <= 0;
  const lowStock = !outOfStock && (product?.stock ?? 0) <= 5;
  const gallery =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Not found");

        const data = await res.json();
        setProduct(data);
        setActiveImage(data.image ?? null);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id,
        name: product.title,
        price: product.price,
        image: product.image ?? "",
      });
    }
  };

  const handleBuyNow = () => {
    if (!product || outOfStock) return;
    setBuying(true);

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id,
        name: product.title,
        price: product.price,
        image: product.image ?? "",
      });
    }

    router.push(`/checkout?buyNow=${product._id}`);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6">Product not found</p>;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="size-3.5" />
        <span>{product.category}</span>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{product.title}</span>
      </div>

      {/* Product */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <Card className="relative overflow-hidden rounded-lg shadow-lg">
            <button
              onClick={() =>
                toggleItem({
                  id: product._id,
                  name: product.title,
                  price: product.price,
                  image: product.image ?? "",
                  category: product.category,
                  inStock: !outOfStock,
                })
              }
              disabled={wishlistLoading}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 shadow-md transition-transform hover:scale-110 disabled:opacity-50"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"
                }`}
              />
            </button>

            {outOfStock && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">
                Out of Stock
              </span>
            )}

            <div className="relative aspect-square w-full bg-muted">
              <Image
                src={activeImage || product.image}
                alt={product.title}
                fill
                className={`object-cover ${outOfStock ? "opacity-60 grayscale" : ""}`}
                priority
              />
            </div>
          </Card>

          {gallery.length > 1 && (
            <div className="flex gap-2">
              {gallery.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`relative size-16 overflow-hidden rounded-md border-2 transition-colors ${
                    activeImage === img
                      ? "border-green-600"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </span>
            <h1 className="text-3xl font-semibold leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
            </div>
          </div>

          <p className="text-2xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </p>

          {/* Stock status */}
          <div>
            {outOfStock ? (
              <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                Out of stock
              </span>
            ) : lowStock ? (
              <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                In stock
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          <p className="text-sm text-muted-foreground">
            Added on {product.added_on}
          </p>

          <Separator />

          <p>{product.details}</p>

          {product.key_features?.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Key Features</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {product.key_features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center rounded-md border">
                <button
                  className="p-2 disabled:opacity-40"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  className="p-2 disabled:opacity-40"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="py-6 text-base transition-all"
              variant={isProductInCart ? "secondary" : "default"}
              disabled={outOfStock}
              style={{
                backgroundColor:
                  !isProductInCart && !outOfStock ? "#16a34a" : undefined,
              }}
              onClick={handleAddToCart}
            >
              {outOfStock ? (
                "Unavailable"
              ) : isProductInCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" /> In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </>
              )}
            </Button>

            <Button
              className="py-6 text-base text-white transition-all bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300"
              onClick={handleBuyNow}
              disabled={buying || outOfStock}
            >
              <Zap className="mr-2 h-5 w-5" />
              {outOfStock
                ? "Unavailable"
                : buying
                  ? "Redirecting..."
                  : "Buy Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
