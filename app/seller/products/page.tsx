"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const TABS = [
  "All Products (24)",
  "Active (20)",
  "Inactive (0)",
  "Out of Stock (4)",
];

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: "$59.99",
    stock: 45,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=44&h=44&fit=crop",
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: "$89.99",
    stock: 32,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=44&h=44&fit=crop",
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Fashion",
    price: "$60.99",
    stock: 0,
    status: "Out of Stock",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=44&h=44&fit=crop",
  },
  {
    id: 4,
    name: "Travel Backpack",
    category: "Bags",
    price: "$39.99",
    stock: 15,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=44&h=44&fit=crop",
  },
  {
    id: 5,
    name: "Coffee Maker",
    category: "Home Living",
    price: "$40.99",
    stock: 8,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=44&h=44&fit=crop",
  },
  {
    id: 6,
    name: "Sunglasses",
    category: "Fashion",
    price: "$19.99",
    stock: 60,
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=44&h=44&fit=crop",
  },
];

const statusStyle: Record<string, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  "Out of Stock": "bg-red-100 text-red-700 border-red-200",
  Inactive: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ProductsPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const rows = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === i
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 h-9 text-sm border-gray-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-gray-200 text-gray-600 text-sm h-9"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "Product",
                    "Category",
                    "Price",
                    "Stock",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                        <span className="font-semibold text-gray-800">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {p.category}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {p.price}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{p.stock}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${statusStyle[p.status]}`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-7 h-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-7 h-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-7 h-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing 1 to {rows.length} of {products.length} products
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`w-7 h-7 rounded text-xs font-medium ${n === 1 ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Product Name</Label>
                <Input
                  placeholder="Wireless Headphones"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <Input placeholder="Electronics" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Price ($)</Label>
                <Input placeholder="0.00" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Stock Qty</Label>
                <Input placeholder="0" type="number" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <textarea
                placeholder="Product description…"
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Image URL</Label>
              <Input placeholder="https://…" className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
