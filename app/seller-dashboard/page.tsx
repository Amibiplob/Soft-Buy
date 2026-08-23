"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  BarChart2,
  Eye,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_STYLE } from "@/lib/orderStatus";

interface DashboardData {
  stats: {
    sales: number;
    salesChange: number;
    orders: number;
    ordersChange: number;
    avgOrderValue: number;
    newCustomers: number;
  };
  trend: { date: string; sales: number }[];
  topProducts: { name: string; image: string; sold: number; revenue: number }[];
  recentOrders: {
    id: string;
    customer: string;
    date: string;
    total: number;
    status: string;
  }[];
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const width = 240;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const pts = data.map((v, i) => [i * step, 80 - (v / max) * 70]);
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const area = `${d} L${width},90 L0,90 Z`;
  return (
    <svg
      viewBox="0 0 240 90"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path
        d={d}
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/seller/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (active) setData(json);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Sales",
      value: money(data.stats.sales),
      change: data.stats.salesChange,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Orders",
      value: String(data.stats.orders),
      change: data.stats.ordersChange,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg Order Value",
      value: money(data.stats.avgOrderValue),
      change: null,
      icon: BarChart2,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "New Customers",
      value: String(data.stats.newCustomers),
      change: null,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!
            👋 Here's what's happening with your store today.
          </p>
        </div>
        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hidden sm:block">
          Last 7 Days
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
          <Card
            key={label}
            className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {value}
                  </p>
                  {change !== null && (
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
                        change >= 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      <TrendingUp className="w-3 h-3" />
                      {change >= 0 ? "+" : ""}
                      {change.toFixed(1)}%{" "}
                      <span className="text-gray-400 font-normal">
                        from last week
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Sales Overview
            </CardTitle>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              Last 7 Days
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-36">
              <Sparkline data={data.trend.map((t) => t.sales)} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              {data.trend.map((t) => (
                <span key={t.date}>
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Top Selling Products
            </CardTitle>
            <Link href="/seller-dashboard/products">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 text-xs h-7 px-2"
              >
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topProducts.length === 0 && (
              <p className="text-xs text-gray-400">No sales yet.</p>
            )}
            {data.topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400">{p.sold} sold</p>
                </div>
                <span className="text-sm font-bold text-green-600 shrink-0">
                  {money(p.revenue)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Recent Orders
          </CardTitle>
          <Link href="/seller-dashboard/orders">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 text-xs h-7 px-2 gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
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
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-6 text-center text-xs text-gray-400"
                    >
                      No orders yet.
                    </td>
                  </tr>
                )}
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
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
                      {money(o.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${STATUS_STYLE[o.status as keyof typeof STATUS_STYLE]}`}
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href="/seller-dashboard/orders">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-50 text-xs h-7 px-3"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
