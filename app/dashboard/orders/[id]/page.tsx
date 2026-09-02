"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Download, PackageX, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  id: string;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "paypal" | "cod";
  cardLast4: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  sellerNote: string | null;
}

const statusStyles: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function OrderDetailSkeleton() {
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

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/orders/${id}`);
        if (res.status === 404) throw new Error("Order not found");
        if (!res.ok) throw new Error("Failed to load order");
        const data: OrderDetail = await res.json();
        if (!ignore) setOrder(data);

        if (!ignore && data.status === "Delivered") {
          const reviewsRes = await fetch(`/api/reviews?orderId=${data.id}`);
          if (reviewsRes.ok) {
            const reviewsJson = await reviewsRes.json();
            if (!ignore) setReviewedIds(reviewsJson.reviewedProductIds ?? []);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchOrder();
    return () => {
      ignore = true;
    };
  }, [id]);

  const openReview = (item: OrderItem) => {
    setReviewItem(item);
    setRating(0);
    setComment("");
  };

  const submitReview = async () => {
    if (!order || !reviewItem) return;
    if (rating < 1) {
      toast.error("Pick a star rating");
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Say a bit more about the product");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          productId: reviewItem.productId,
          rating,
          comment: comment.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Review submitted");
      setReviewedIds((prev) => [...prev, reviewItem.productId]);
      setReviewItem(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <OrderDetailSkeleton />;

  if (error || !order) {
    return (
      <div className="space-y-5">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/" className="hover:text-green-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/dashboard/orders" className="hover:text-green-600">
            Orders
          </Link>
        </nav>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <PackageX className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-4">
            {error ?? "Order not found"}
          </p>
          <Link href="/dashboard/orders">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
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

  const paymentLabel =
    order.paymentMethod === "card"
      ? order.cardLast4
        ? `Card ending in ${order.cardLast4}`
        : "Credit / Debit Card"
      : order.paymentMethod === "paypal"
        ? "PayPal"
        : "Cash on Delivery";

  const paymentBadgeText =
    order.paymentMethod === "card"
      ? "Card"
      : order.paymentMethod === "paypal"
        ? "PayPal"
        : "COD";

  const canReview = order.status === "Delivered";

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/" className="hover:text-green-600">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/orders" className="hover:text-green-600">
          Orders
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">Order Details</span>
      </nav>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-mono font-semibold text-gray-700">
              #{order.id}
            </span>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${statusStyles[order.status]}`}
            >
              {order.status}
            </Badge>
            <span>Placed on {placedOn}</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.print()}
          className="border-green-600 text-green-600 hover:bg-green-50 gap-1.5 text-sm"
        >
          <Download className="w-4 h-4" />
          Download Invoice
        </Button>
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
                      {canReview && (
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                          Review
                        </th>
                      )}
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
                        {canReview && (
                          <td className="px-5 py-4 text-right">
                            {reviewedIds.includes(item.productId) ? (
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-700 border-green-200 text-xs"
                              >
                                Reviewed
                              </Badge>
                            ) : (
                              <button
                                onClick={() => openReview(item)}
                                className="text-xs font-medium text-green-600 hover:underline"
                              >
                                Write a Review
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Order Summary
                </h3>
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
              {order.shippingAddress.address2 && (
                <p>{order.shippingAddress.address2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-1 text-gray-500">
                {order.shippingAddress.phone}
              </p>
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
                  {paymentBadgeText}
                </div>
                <span>{paymentLabel}</span>
              </div>
            </CardContent>
          </Card>

          {(order.trackingNumber || order.carrier || order.sellerNote) && (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Shipping Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                {order.carrier && (
                  <p>
                    <span className="text-gray-500">Carrier: </span>
                    <span className="font-medium text-gray-900">
                      {order.carrier}
                    </span>
                  </p>
                )}
                {order.trackingNumber && (
                  <p>
                    <span className="text-gray-500">Tracking #: </span>
                    <span className="font-mono font-medium text-gray-900">
                      {order.trackingNumber}
                    </span>
                  </p>
                )}
                {order.sellerNote && (
                  <p className="pt-1 border-t border-gray-100 mt-2 text-gray-500">
                    {order.sellerNote}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={!!reviewItem}
        onOpenChange={(open) => !open && setReviewItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review {reviewItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => setRating(i)} type="button">
                  <Star
                    className={`w-6 h-6 ${
                      i <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this product?"
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReviewItem(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={submitReview}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{" "}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
