"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Search, Loader2 } from "lucide-react";
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

type StatusFilter = "All" | "Active" | "Inactive" | "OutOfStock";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "All", label: "All Products" },
  { key: "Active", label: "Active" },
  { key: "Inactive", label: "Inactive" },
  { key: "OutOfStock", label: "Out of Stock" },
];

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Out of Stock";
  image: string;
}

interface ProductsResponse {
  products: ProductRow[];
  counts: Record<StatusFilter, number>;
  total: number;
  page: number;
  totalPages: number;
}

const statusStyle: Record<string, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  "Out of Stock": "bg-red-100 text-red-700 border-red-200",
};

const emptyForm = {
  title: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  image: "",
  active: true,
};

const money = (n: number) => `$${n.toFixed(2)}`;

export default function ProductsPage() {
  const [tab, setTab] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    // "Inactive" isn't a real status yet — the schema has no active/inactive
    // flag, so that tab always shows an empty state instead of hitting the API.
    if (tab === "Inactive") {
      setData((prev) => ({
        products: [],
        counts: prev?.counts ?? {
          All: 0,
          Active: 0,
          Inactive: 0,
          OutOfStock: 0,
        },
        total: 0,
        page: 1,
        totalPages: 1,
      }));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status: tab,
        search: debouncedSearch,
        page: String(page),
        limit: "6",
      });
      const res = await fetch(`/api/seller/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load products");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setOpen(true);
  };

  const openEdit = async (id: string) => {
    setEditingId(id);
    setFormError(null);
    setOpen(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      const p = await res.json();
      if (!res.ok) throw new Error(p.error || "Failed to load product");
      setForm({
        title: p.title ?? "",
        category: p.category ?? "",
        price: String(p.price ?? ""),
        stock: String(p.stock ?? ""),
        description: p.description ?? "",
        image: p.image ?? "",
      });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to load product",
      );
    }
  };

  const handleSave = async () => {
    setFormError(null);

    if (!form.title.trim()) return setFormError("Product name is required");
    if (!form.category.trim()) return setFormError("Category is required");
    if (!form.price || Number(form.price) < 0)
      return setFormError("Enter a valid price");
    if (!form.stock || Number(form.stock) < 0)
      return setFormError("Enter a valid stock quantity");

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
        image: form.image,
      };

      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save product");

      setOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete product");
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const rows = data?.products ?? [];
  const counts = data?.counts ?? {
    All: 0,
    Active: 0,
    Inactive: 0,
    OutOfStock: 0,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t.key
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label} ({counts[t.key]})
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
        </CardHeader>
        <CardContent className="p-0">
          {error && <p className="px-5 py-3 text-xs text-red-500">{error}</p>}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : tab === "Inactive" ? (
            <p className="px-5 py-10 text-center text-xs text-gray-400">
              No inactive products.
            </p>
          ) : (
            <>
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
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-xs text-gray-400"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                    {rows.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                            )}
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                              <div>
                                <Label className="text-xs font-medium">
                                  Store visibility
                                </Label>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  Inactive products are hidden from buyers and
                                  won&apos;t show up in search or your
                                  storefront.
                                </p>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={form.active}
                                onClick={() =>
                                  setForm({ ...form, active: !form.active })
                                }
                                className={`shrink-0 relative w-9 h-5 rounded-full transition-colors ${
                                  form.active ? "bg-green-600" : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                    form.active
                                      ? "translate-x-4"
                                      : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                            <span className="font-semibold text-gray-800">
                              {p.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          {p.category}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">
                          {money(p.price)}
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
                            <a
                              href={`/products/${p.id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-7 h-7 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(p.id)}
                              className="w-7 h-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(p.id)}
                              disabled={deletingId === p.id}
                              className="w-7 h-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              {deletingId === p.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data && data.total > 0 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>
                    Showing {(page - 1) * 6 + 1} to{" "}
                    {(page - 1) * 6 + rows.length} of {data.total} products
                  </span>
                  <div className="flex gap-1">
                    {Array.from(
                      { length: data.totalPages },
                      (_, i) => i + 1,
                    ).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-7 h-7 rounded text-xs font-medium ${
                          n === page
                            ? "bg-green-600 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Product Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Product Name</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Wireless Headphones"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="Electronics"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Price ($)</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  type="number"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Stock Qty</Label>
                <Input
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  type="number"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Product description…"
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
