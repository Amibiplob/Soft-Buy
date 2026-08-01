"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  Download,
  Search,
  Filter,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ORDER_STATUSES,
  STATUS_TRANSITIONS,
  STATUS_STYLE,
  OrderStatus,
} from "@/lib/orderStatus";

const TAB_LIST: ("All" | OrderStatus)[] = ["All", ...ORDER_STATUSES];

interface Order {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  total: string;
  status: OrderStatus;
}

interface OrdersResponse {
  orders: Order[];
  counts: Record<string, number>;
  total: number;
  page: number;
  totalPages: number;
}

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState<"All" | OrderStatus>("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{
    id: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status: activeTab,
        search: debouncedSearch,
        page: String(page),
        limit: "6",
      });
      const res = await fetch(`/api/seller/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load orders");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (order: Order, nextStatus: OrderStatus) => {
    setUpdatingId(order.orderId);
    setRowError(null);

    const prevData = data;
    // optimistic update
    setData((d) =>
      d
        ? {
            ...d,
            orders: d.orders.map((o) =>
              o.orderId === order.orderId ? { ...o, status: nextStatus } : o,
            ),
          }
        : d,
    );

    try {
      const res = await fetch(`/api/seller/orders/${order.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");

      // if we're filtered to a tab that no longer matches, refetch for correct counts/list
      if (activeTab !== "All" && activeTab !== nextStatus) {
        fetchOrders();
      } else {
        setData((d) =>
          d
            ? {
                ...d,
                counts: { ...d.counts }, // counts refresh on next full fetch; keep simple here
              }
            : d,
        );
      }
    } catch (err) {
      setData(prevData); // revert
      setRowError({
        id: order.orderId,
        message: err instanceof Error ? err.message : "Update failed",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = data?.counts ?? { All: 0 };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-gray-200 text-gray-600 text-sm"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {TAB_LIST.map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === t
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            {t} ({counts[t] ?? 0})
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
              placeholder="Search orders…"
              className="pl-9 h-9 text-sm border-gray-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-gray-200 text-gray-600 text-sm h-9"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="px-5 py-6 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="flex items-center justify-center py-14 text-gray-400 gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
            </div>
          )}

          {!error && !loading && data && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {[
                        "Order ID",
                        "Customer",
                        "Date",
                        "Total",
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
                    {data.orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-gray-400"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                    {data.orders.map((o) => {
                      const nextOptions = STATUS_TRANSITIONS[o.status] ?? [];
                      const isUpdating = updatingId === o.orderId;
                      return (
                        <tr
                          key={o.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-3.5 font-semibold text-green-600 whitespace-nowrap">
                            {o.id}
                          </td>
                          <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                            {o.customer}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                            {o.date}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                            {o.total}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${STATUS_STYLE[o.status]}`}
                            >
                              {o.status}
                            </Badge>
                            {rowError?.id === o.orderId && (
                              <p className="text-[11px] text-red-500 mt-1">
                                {rowError.message}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Link href={`/seller/orders/${o.orderId}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:bg-green-50 text-xs h-7 px-2.5 gap-1"
                                >
                                  <Eye className="w-3 h-3" /> View
                                </Button>
                              </Link>

                              {nextOptions.length > 0 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={isUpdating}
                                      className="text-xs h-7 px-2.5 gap-1 border-gray-200 text-gray-600"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <>
                                          Update{" "}
                                          <ChevronDown className="w-3 h-3" />
                                        </>
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {nextOptions.map((opt) => (
                                      <DropdownMenuItem
                                        key={opt}
                                        onClick={() =>
                                          handleStatusChange(o, opt)
                                        }
                                      >
                                        Mark as {opt}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
                <span>
                  Showing {data.orders.length === 0 ? 0 : (page - 1) * 6 + 1} to{" "}
                  {(page - 1) * 6 + data.orders.length} of {data.total} orders
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                    (n) => (
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
                    ),
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
