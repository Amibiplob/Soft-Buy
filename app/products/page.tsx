"use client";

import { useEffect, useMemo, useState } from "react";
import productsData from "@/public/products.json";

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

// ⚡ Debounce
function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
type Products = {
  id: string | number;
  title: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  details: string;
};
export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("all");

  // 🛒 Cart with quantity
const [cart, setCart] = useState<(Products & { qty: number })[]>([]);

  const addToCart = (product: Products) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p,
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

  const filteredProducts = productsData.filter((p: Products) => {
    return (
      p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      (category === "all" || p.category === category) &&
      (!minPrice || p.price >= Number(minPrice)) &&
      (!maxPrice || p.price <= Number(maxPrice)) &&
      (rating === "all" || p.rating >= Number(rating))
    );
  });

  const categories = [
    "all",
    ...new Set(productsData.map((p: Products) => p.category)),
  ];

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
        <div className="space-y-1 w-full">
          <label className="text-sm font-medium">Search</label>
          <Input
            className="w-full"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-1 w-full">
          <label className="text-sm font-medium">Category</label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="w-full">
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
        </div>

        {/* Min Price */}
        <div className="space-y-1 w-full">
          <label className="text-sm font-medium">Min Price</label>
          <Input
            className="w-full"
            type="number"
            placeholder="0"
            value={minPrice}
            min="0"
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        {/* Max Price */}
        <div className="space-y-1 w-full">
          <label className="text-sm font-medium">Max Price</label>
          <Input
            className="w-full"
            type="number"
            placeholder="1000"
            value={maxPrice}
            min="0"
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Rating */}
        <div className="space-y-1 w-full">
          <label className="text-sm font-medium">Rating</label>
          <Select onValueChange={setRating} value={rating}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4">4★ & above</SelectItem>
              <SelectItem value="3">3★ & above</SelectItem>
              <SelectItem value="2">2★ & above</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset */}
        <div className="flex items-end">
          <Button
            onClick={resetFilters}
            variant="destructive"
            className="w-full"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: Products) => (
            <Card
              key={product.id}
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
                  <span className="font-bold text-primary whitespace-nowrap">
                    ${product.price}
                  </span>

                  <span className="text-sm whitespace-nowrap">
                    ⭐ {product.rating}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button className="flex-1">View Details</Button>
                  <Button className="flex-1" onClick={() => addToCart(product)}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}
