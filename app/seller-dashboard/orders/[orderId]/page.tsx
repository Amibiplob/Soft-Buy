"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Loader2, PackageX, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_TRANSITIONS, STATUS_STYLE, OrderStatus } from "@/lib/orderStatus";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
}

interface OrderDetail {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "paypal" | "cod";
  cardLast4?: string;
  trackingNumber?: string;
  carrier?: string;
  sellerNote?: string;
  createdAt: string;
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
      <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="h-72 bg-white rounded-xl border border-gray-200 animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse" />
          <div className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function SellerOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [sellerNote, setSellerNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/seller/orders/${orderId}`);
      if (res.status === 404) throw new Error("Order not found");
      if (!res.ok) throw new Error("Failed to load order");
      const data: OrderDetail = await res.json();
      setOrder(data);
      setTrackingNumber(data.trackingNumber ?? "");
      setCarrier(data.carrier ?? "");
      setSellerNote(data.sellerNote ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      setOrder({ ...order, status: nextStatus });
      toast.success(`Order marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveFulfillment = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, carrier, sellerNote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      toast.success("Fulfillment details saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !order) {
    return (
      <div className="space-y-5">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/seller-dashboard" className="hover:text-green-600">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/seller-dashboard/orders" className="hover:text-green-600">
            Orders
          </Link>
        </nav>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <PackageX className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-4">
            {error ?? "Order not found"}
          </p>
          <Link href="/seller-dashboard/orders">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const placedOn = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const nextOptions = STATUS_TRANSITIONS[order.status] ?? [];

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/seller-dashboard" className="hover:text-green-600">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/seller-dashboard/orders" className="hover:text-green-600">
          Orders
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">#{order.orderId}</span>
      </nav>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.orderId}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed on {placedOn} · {order.customerName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs font-medium ${STATUS_STYLE[order.status]}`}
          >
            {order.status}
          </Badge>
          {nextOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingStatus}
                  className="text-xs h-8 px-3 gap-1 border-gray-200 text-gray-600"
                >
                  {updatingStatus ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Update Status <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {nextOptions.map((opt) => (
                  <DropdownMenuItem key={opt} onClick={() => handleStatusChange(opt)}>
                    Mark as {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <Link
                              href={`/products/${item.productId}`}
                              className="font-semibold text-gray-900 hover:text-green-600"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-gray-700">
                          {fmt(item.price)}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-700">
                          x{item.quantity}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-gray-900">
                          {fmt(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <div className="space-y-1.5 text-sm max-w-xs ml-auto">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{fmt(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>{fmt(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span>{fmt(order.tax)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span>{fmt(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Fulfillment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Carrier</Label>
                  <Input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. DHL, FedEx"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tracking Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 1Z999AA10123456784"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Note to Buyer</Label>
                <textarea
                  value={sellerNote}
                  onChange={(e) => setSellerNote(e.target.value)}
                  placeholder="Optional note about this order…"
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveFulfillment}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.address}</p>
              {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-1 text-gray-500">{order.shippingAddress.phone}</p>
              <p className="text-gray-500">{order.shippingAddress.email}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 bg-blue-600 rounded text-white text-[10px] font-bold flex items-center justify-center uppercase">
                  {order.paymentMethod === "card"
                    ? "Card"
                    : order.paymentMethod === "paypal"
                      ? "PayPal"
                      : "COD"}
                </div>
                <span>
                  {order.paymentMethod === "card"
                    ? order.cardLast4
                      ? `Card ending in ${order.cardLast4}`
                      : "Credit / Debit Card"
                    : order.paymentMethod === "paypal"
                      ? "PayPal"
                      : "Cash on Delivery"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}