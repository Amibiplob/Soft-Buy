"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
import type { PaymentMethod } from "@/types/payment-method";

const CardLogo = ({ type }: { type: PaymentMethod["type"] }) => {
  if (type === "visa")
    return (
      <div className="w-12 h-8 bg-blue-700 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold italic">VISA</span>
      </div>
    );
  if (type === "mastercard")
    return (
      <div className="w-12 h-8 flex items-center justify-center">
        <div className="flex">
          <div className="w-6 h-6 bg-red-500 rounded-full" />
          <div className="w-6 h-6 bg-yellow-400 rounded-full -ml-3" />
        </div>
      </div>
    );
  return (
    <div className="w-12 h-8 bg-[#003087] rounded flex items-center justify-center">
      <span className="text-white text-[10px] font-bold">PayPal</span>
    </div>
  );
};

interface FormData {
  cardNumber?: string;
  cardholderName?: string;
  expiry?: string;
  cvv?: string;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [formData, setFormData] = useState<FormData>({});

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/payment-methods");
      if (!res.ok) throw new Error("Failed to load payment methods");
      const data = await res.json();
      setMethods(data.map((m: any) => ({ ...m, _id: m._id.toString() })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editingMethod) {
        const res = await fetch(`/api/payment-methods/${editingMethod._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardholderName: formData.cardholderName,
            expiry: formData.expiry,
          }),
        });
        if (!res.ok) throw new Error("Failed to update payment method");
      } else {
        if (!formData.cardNumber || !formData.expiry) {
          throw new Error("Card number and expiry are required");
        }
        const res = await fetch("/api/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardNumber: formData.cardNumber,
            cardholderName: formData.cardholderName,
            expiry: formData.expiry,
          }),
        });
        if (!res.ok) throw new Error("Failed to add payment method");
      }

      await fetchMethods();
      setDialogOpen(false);
      setEditingMethod(null);
      setFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const removeMethod = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to remove payment method");
      }
      setMethods((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const setDefault = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/payment-methods/${id}/default`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to set default payment method");
      await fetchMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <Button
          onClick={() => {
            setEditingMethod(null);
            setFormData({});
            setDialogOpen(true);
          }}
          className="bg-green-600 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Payment Method
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading payment methods...
        </div>
      ) : methods.length === 0 ? (
        <p className="text-sm text-gray-400">No payment methods yet.</p>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {methods.map((method) => (
            <Card key={method._id}>
              <CardContent className="p-5 flex items-center gap-4">
                <CardLogo type={method.type} />

                <div className="flex-1">
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold text-sm">{method.label}</p>
                    {method.isDefault && (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{method.detail}</p>
                </div>

                <div className="flex gap-2 items-center">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefault(method._id)}
                      className="text-xs text-green-600"
                    >
                      Set Default
                    </button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingMethod(method);
                      setFormData({
                        cardholderName: method.cardholderName,
                        expiry: method.expiry,
                      });
                      setDialogOpen(true);
                    }}
                    className="h-7 text-xs"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  {!method.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMethod(method._id)}
                      className="h-7 text-xs text-red-500"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {!editingMethod && (
              <div>
                <Label>Card Number</Label>
                <Input
                  value={formData.cardNumber || ""}
                  onChange={(e) => handleChange("cardNumber", e.target.value)}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
            )}

            <div>
              <Label>Cardholder Name</Label>
              <Input
                value={formData.cardholderName || ""}
                onChange={(e) => handleChange("cardholderName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="MM/YY"
                value={formData.expiry || ""}
                onChange={(e) => handleChange("expiry", e.target.value)}
              />
              {!editingMethod && (
                <Input
                  placeholder="CVV"
                  type="password"
                  value={formData.cvv || ""}
                  onChange={(e) => handleChange("cvv", e.target.value)}
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 text-white"
              disabled={saving}
            >
              {saving ? "Saving..." : editingMethod ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
