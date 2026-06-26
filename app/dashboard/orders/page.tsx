"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tabs = [
  "All Orders",
  "Pending",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;
type Tab = (typeof tabs)[number];

interface Order {
  id: string;
  date: string;
  items: number;
  total: string;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  images: string[];
}

const statusStyles: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All Orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        if (!ignore) setOrders(data.orders);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchOrders();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered =
    activeTab === "All Orders"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2 min-w-[110px]">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-2 w-16 bg-gray-100 rounded" />
                </div>
                <div className="flex -space-x-2 flex-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-10 h-10 rounded-lg border-2 border-white bg-gray-200"
                    />
                  ))}
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-500 font-medium">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              className="mt-3 bg-green-600 hover:bg-green-700 text-white"
            >
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400">
            <p className="text-lg font-medium">
              No {activeTab.toLowerCase()} orders
            </p>
          </div>
        ) : (
          filtered.map((order) => (
            <Card
              key={order.id}
              className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  {/* Order ID + Date */}
                  <div className="min-w-[110px]">
                    <p className="text-sm font-bold text-green-600">
                      #{order.id}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
                  </div>

                  {/* Item Images */}
                  <div className="flex -space-x-2 flex-1">
                    {order.images.slice(0, 4).map((src, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-gray-100 shrink-0"
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Items count */}
                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-semibold text-gray-800">
                      {order.items} Item{order.items > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-400">Items</p>
                  </div>

                  {/* Total */}
                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-bold text-green-600">
                      {order.total}
                    </p>
                    <p className="text-xs text-gray-400">Total</p>
                  </div>

                  {/* Status */}
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium min-w-[80px] justify-center ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </Badge>

                  {/* Action */}
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-4 shrink-0"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
