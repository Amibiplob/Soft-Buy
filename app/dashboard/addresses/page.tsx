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
  {
    id: 3,
    label: "Home Address",
    name: "John Doe",
    street: "789 Home Lane",
    city: "Brooklyn",
    state: "NY",
    zip: "11201",
    country: "United States",
    phone: "+1 123-456-7890",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);

  const removeAddress = (id: number) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefault = (id: number) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            className={`border shadow-sm hover:shadow-md transition-shadow ${
              addr.isDefault ? "border-green-300" : "border-gray-200"
            }`}
          >
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-gray-800">
                    {addr.label}
                  </span>
                </div>
                {addr.isDefault && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px] font-semibold">
                    Default
                  </Badge>
                )}
              </div>

              {/* Details */}
              <div className="text-sm text-gray-600 space-y-0.5 mb-4">
                <p className="font-semibold text-gray-900">{addr.name}</p>
                <p>{addr.street}</p>
                {addr.suite && <p>{addr.suite}</p>}
                <p>
                  {addr.city}, {addr.state} {addr.zip}
                </p>
                <p>{addr.country}</p>
                <p className="mt-2 text-gray-500">{addr.phone}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="text-xs text-green-600 hover:underline font-medium"
                  >
                    Set as Default
                  </button>
                )}
                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs gap-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  {!addr.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAddress(addr.id)}
                      className="h-7 px-3 text-xs gap-1 border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Address Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Full Name</Label>
                <Input placeholder="John Doe" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone</Label>
                <Input placeholder="+1 000-000-0000" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Street Address</Label>
              <Input placeholder="123 Main Street" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Apartment / Suite (optional)
              </Label>
              <Input placeholder="Apt 4B" className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">City</Label>
                <Input placeholder="New York" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">State</Label>
                <Input placeholder="NY" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">ZIP</Label>
                <Input placeholder="10001" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Label</Label>
              <Input
                placeholder="Home / Work / Other"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => setDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
