"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
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

interface Address {
  id: number;
  label: string;
  name: string;
  street: string;
  suite?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: 1,
    label: "Default Address",
    name: "John Doe",
    street: "123 Green Street",
    suite: "Apartment 4B",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    phone: "+1 123-456-7890",
    isDefault: true,
  },
  {
    id: 2,
    label: "Work Address",
    name: "John Doe",
    street: "456 Office Park",
    suite: "Suite 200",
    city: "New York",
    state: "NY",
    zip: "10017",
    country: "United States",
    phone: "+1 123-456-7890",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({});

  const handleChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editingAddress) {
      // Update
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingAddress.id ? ({ ...a, ...formData } as Address) : a,
        ),
      );
    } else {
      // Add
      const newAddress: Address = {
        id: Date.now(),
        isDefault: false,
        country: "United States",
        label: formData.label || "New Address",
        name: formData.name || "",
        street: formData.street || "",
        suite: formData.suite || "",
        city: formData.city || "",
        state: formData.state || "",
        zip: formData.zip || "",
        phone: formData.phone || "",
      };

      setAddresses((prev) => [...prev, newAddress]);
    }

    setDialogOpen(false);
    setEditingAddress(null);
    setFormData({});
  };

  const removeAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = (id: number) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            className={`border shadow-sm hover:shadow-md ${
              addr.isDefault ? "border-green-300" : "border-gray-200"
            }`}
          >
            <CardContent className="p-5">
              {/* Header */}
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

              {/* Info */}
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

              {/* Actions */}
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

      {/* Dialog */}
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 text-white">
              {editingAddress ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
