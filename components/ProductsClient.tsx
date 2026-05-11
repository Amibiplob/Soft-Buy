"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  Check,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/data/products";
import Link from "next/link";

export default function ProductsClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const { addItem, items } = useCart();

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const filtered = useMemo(() => {
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    if (category !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }
    if (sort === "price-asc")
      return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc")
      return [...result].sort((a, b) => b.price - a.price);
    if (sort === "name-asc")
      return [...result].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "name-desc")
      return [...result].sort((a, b) => b.title.localeCompare(a.title));
    if (sort === "rating-asc")
      return [...result].sort((a, b) => a.rating - b.rating);
    if (sort === "rating-desc")
      return [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, search, category, sort]);

  const inCart = (id: string) => items.some((i) => i.id === id);
  console.log(filtered);
  return (
    <>
      {/* Filters — no cart count here */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SlidersHorizontal className="mr-2 size-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="rating-asc">Rating: Low → High</SelectItem>
            <SelectItem value="rating-desc">Rating: High → Low</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          No products match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="group flex flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <Link
                href={`/products/${product._id}`}
                className="relative aspect-square overflow-hidden rounded-t-xl bg-muted"
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {product.category}
                  </span>
                  <span className="flex items-center font-medium tracking-wide">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1">{product.rating}</span>
                  </span>
                </div>
                <Link
                  href={`/products/${product._id}`}
                  className="font-semibold leading-tight hover:text-green-900"
                >
                  {product.title}
                </Link>
                {product.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-lg font-bold">
                    ${product.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant={inCart(product._id) ? "secondary" : "default"}
                    onClick={() =>
                      addItem({
                        id: product._id,
                        name: product.title,
                        price: product.price,
                        image: product.image ?? "",
                      })
                    }
                  >
                    {inCart(product._id) ? (
                      <>
                        <Check className="mr-1.5 size-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-1.5 size-4" /> Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
