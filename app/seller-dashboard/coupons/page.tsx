"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Tag, Copy, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CouponType = "Percentage" | "Fixed" | "Shipping";
type CouponStatus = "Active" | "Paused" | "Expired";

interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  usedCount: number;
  usageLimit: number;
  expiresAt: string;
  status: CouponStatus;
}

interface CouponsResponse {
  coupons: Coupon[];
  counts: { total: number; active: number; expired: number; totalUsed: number };
}

const statusStyle: Record<string, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Expired: "bg-gray-100 text-gray-500 border-gray-200",
  Paused: "bg-orange-100 text-orange-700 border-orange-200",
};

const emptyForm = {
  code: "",
  type: "Percentage" as CouponType,
  value: "",
  usageLimit: "",
  expiresAt: "",
};

function formatValue(type: CouponType, value: number) {
  if (type === "Percentage") return `${value}%`;
  if (type === "Fixed") return `$${value.toFixed(2)}`;
  return "Free";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CouponsPage() {
  const [data, setData] = useState<CouponsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [copied, setCopied] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/coupons");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load coupons");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.type === "Shipping" ? "" : String(c.value),
      usageLimit: String(c.usageLimit),
      expiresAt: c.expiresAt.slice(0, 10),
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);

    if (!editingId && !/^[A-Za-z0-9_-]{3,20}$/.test(form.code.trim())) {
      setFormError("Code must be 3-20 letters, numbers, - or _");
      return;
    }
    if (form.type !== "Shipping" && !form.value) {
      setFormError("Enter a discount value");
      return;
    }
    if (!form.usageLimit) {
      setFormError("Enter a usage limit");
      return;
    }
    if (!form.expiresAt) {
      setFormError("Pick an expiry date");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        type: form.type,
        value: form.type === "Shipping" ? 0 : Number(form.value),
        usageLimit: Number(form.usageLimit),
        expiresAt: new Date(form.expiresAt).toISOString(),
      };
      if (!editingId) payload.code = form.code.trim();

      const res = await fetch(
        editingId ? `/api/seller/coupons/${editingId}` : "/api/seller/coupons",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save coupon");

      setOpen(false);
      fetchCoupons();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save coupon",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/seller/coupons/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete coupon");
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  const coupons = data?.coupons ?? [];
  const counts = data?.counts ?? {
    total: 0,
    active: 0,
    expired: 0,
    totalUsed: 0,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <Button
          onClick={openCreate}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Coupons",
            value: counts.total,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Active",
            value: counts.active,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Expired",
            value: counts.expired,
            color: "bg-gray-50 text-gray-600",
          },
          {
            label: "Total Used",
            value: counts.totalUsed,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((s) => (
          <Card key={s.label} className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}
              >
                <Tag className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">
            All Coupons
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">
              No coupons yet. Create your first one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Code",
                      "Type",
                      "Discount",
                      "Used / Limit",
                      "Expires",
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
                  {coupons.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 text-gray-800 text-xs font-mono px-2 py-0.5 rounded font-semibold">
                            {c.code}
                          </code>
                          <button
                            onClick={() => copy(c.code)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copied === c.code && (
                            <span className="text-xs text-green-600 font-medium">
                              Copied!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {c.type}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-green-600">
                        {formatValue(c.type, c.value)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>
                            {c.usedCount}/{c.usageLimit}
                          </span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {formatDate(c.expiresAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${statusStyle[c.status]}`}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(c)}
                            className="w-7 h-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === c.id}
                            onClick={() => handleDelete(c.id)}
                            className="w-7 h-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            {deletingId === c.id ? (
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
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {!editingId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Coupon Code</Label>
                <Input
                  placeholder="SAVE10"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="h-9 text-sm font-mono uppercase"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Discount Type</Label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as CouponType })
                  }
                  className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                >
                  <option>Percentage</option>
                  <option>Fixed</option>
                  <option>Shipping</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Value</Label>
                <Input
                  placeholder="10"
                  value={form.value}
                  disabled={form.type === "Shipping"}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Usage Limit</Label>
                <Input
                  placeholder="100"
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Expiry Date</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={saving}
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Create Coupon"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
