"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Address } from "@/types/address";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({});

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses");
      if (!res.ok) throw new Error("Failed to load addresses");
      setAddresses(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editingAddress) {
        const res = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok)
          throw new Error((await res.json()).error || "Update failed");
        const updated = await res.json();
        setAddresses((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
      } else {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Save failed");
        const created = await res.json();
        setAddresses((prev) => [...prev, created]);
      }

      setDialogOpen(false);
      setEditingAddress(null);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const setDefault = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${id}/default`, {
        method: "PATCH",
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to set default");
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        <Button
          onClick={() => {
            setEditingAddress(null);
            setFormData({});
            setDialogOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-sm text-gray-500">
          No addresses yet. Add one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`border shadow-sm hover:shadow-md ${
                addr.isDefault ? "border-green-300" : "border-gray-200"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-2 items-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold">{addr.label}</span>
                  </div>
                  {addr.isDefault && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="font-semibold text-gray-900">{addr.name}</p>
                  <p>{addr.street}</p>
                  {addr.suite && <p>{addr.suite}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p>{addr.country}</p>
                  <p className="text-gray-500">{addr.phone}</p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Set as Default
                    </button>
                  )}

                  <div className="ml-auto flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingAddress(addr);
                        setFormData(addr);
                        setDialogOpen(true);
                      }}
                      className="h-7 text-xs"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>

                    {!addr.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAddress(addr.id)}
                        className="h-7 text-xs text-red-500"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Street</Label>
              <Input
                value={formData.street || ""}
                onChange={(e) => handleChange("street", e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Suite</Label>
              <Input
                value={formData.suite || ""}
                onChange={(e) => handleChange("suite", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="City"
                value={formData.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
              />
              <Input
                placeholder="State"
                value={formData.state || ""}
                onChange={(e) => handleChange("state", e.target.value)}
              />
              <Input
                placeholder="ZIP"
                value={formData.zip || ""}
                onChange={(e) => handleChange("zip", e.target.value)}
              />
            </div>

            <div>
              <Label className="text-xs">Label</Label>
              <Input
                value={formData.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingAddress ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
