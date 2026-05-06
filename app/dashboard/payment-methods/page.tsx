"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

interface PaymentMethod {
  id: number;
  type: "visa" | "mastercard" | "paypal";
  label: string;
  detail: string;
  expires?: string;
  isDefault: boolean;
}

const initialMethods: PaymentMethod[] = [
  {
    id: 1,
    type: "visa",
    label: "Visa ending in 4242",
    detail: "Expires 12/26",
    isDefault: true,
  },
  {
    id: 2,
    type: "mastercard",
    label: "Mastercard ending in 5555",
    detail: "Expires 11/25",
    isDefault: false,
  },
];

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

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [formData, setFormData] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editingMethod) {
      setMethods((prev) =>
        prev.map((m) =>
          m.id === editingMethod.id ? { ...m, ...formData } : m,
        ),
      );
    } else {
      const newMethod: PaymentMethod = {
        id: Date.now(),
        type: "visa",
        label: `Card ending in ${formData.cardNumber?.slice(-4) || "0000"}`,
        detail: `Expires ${formData.expiry || "--/--"}`,
        isDefault: false,
      };

      setMethods((prev) => [...prev, newMethod]);
    }

    setDialogOpen(false);
    setEditingMethod(null);
    setFormData({});
  };

  const removeMethod = (id: number) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const setDefault = (id: number) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* List */}
      <div className="space-y-3 max-w-2xl">
        {methods.map((method) => (
          <Card key={method.id}>
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
                    onClick={() => setDefault(method.id)}
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
                    setFormData(method);
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
                    onClick={() => removeMethod(method.id)}
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Card Number</Label>
              <Input
                value={formData.cardNumber || ""}
                onChange={(e) => handleChange("cardNumber", e.target.value)}
              />
            </div>

            <div>
              <Label>Cardholder Name</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="MM/YY"
                value={formData.expiry || ""}
                onChange={(e) => handleChange("expiry", e.target.value)}
              />
              <Input
                placeholder="CVV"
                type="password"
                value={formData.cvv || ""}
                onChange={(e) => handleChange("cvv", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 text-white">
              {editingMethod ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
