"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// ⚡ Debounce hook
function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

// Product type
type Products = {
  _id?: string;
  id?: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  details: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("all");

  // 🛒 Cart
  const [cart, setCart] = useState<(Products & { qty: number })[]>([]);

  // 📦 Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ➕ Add to cart
  const addToCart = (product: Products) => {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);

      if (existing) {
        return prev.map((p) =>
          p._id === product._id ? { ...p, qty: p.qty + 1 } : p,
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  // 🔄 Reset filters
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setRating("all");
  };

  // 🔍 Filtering
  const filteredProducts = products.filter((p) => {
    return (
      p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      (category === "all" || p.category === category) &&
      (!minPrice || p.price >= Number(minPrice)) &&
      (!maxPrice || p.price <= Number(maxPrice)) &&
      (rating === "all" || p.rating >= Number(rating))
    );
  });

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  return (
    <div className="container py-6 px-5 md:px-0 mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Products</h1>
        <div className="font-medium">Cart: {cartCount}</div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Search */}
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category */}
        <Select onValueChange={setCategory} value={category}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Min Price */}
        <Input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        {/* Max Price */}
        <Input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        {/* Rating */}
        <Select onValueChange={setRating} value={rating}>
          <SelectTrigger>
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="4">4★ & above</SelectItem>
            <SelectItem value="3">3★ & above</SelectItem>
            <SelectItem value="2">2★ & above</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        <Button onClick={resetFilters} variant="destructive">
          Reset
        </Button>
      </div>

      {/* Products */}
      {loading ? (
        <p className="text-center">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Card
                key={product._id || product.id}
                className="rounded-xl shadow-sm hover:shadow-md transition"
              >
                <CardContent className="p-4 space-y-3 flex flex-col h-full">
                  <div className="relative w-full h-48">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>

                  <h2 className="font-semibold text-lg truncate">
                    {product.title}
                  </h2>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.details}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      ${product.price}
                    </span>
                    <span>⭐ {product.rating}</span>
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Link href={`/products/${product._id || product.id}`}>
                      <Button className="flex-1">View</Button>
                    </Link>

                    <Button
                      className="flex-1"
                      onClick={() => addToCart(product)}
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No products found</p>
          )}
        </div>
      )}
    </div>
  );
}
