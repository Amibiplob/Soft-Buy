"use client";

import { useState } from "react";
import { Eye, Download, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TABS = [
  "All (12)",
  "Pending (3)",
  "Processing (4)",
  "Shipped (3)",
  "Delivered (2)",
  "Cancelled (0)",
];

const orders = [
  {
    id: "#SB10012",
    customer: "John Doe",
    date: "May 15, 2025",
    total: "$340.03",
    status: "Delivered",
  },
  {
    id: "#SB10011",
    customer: "Jane Smith",
    date: "May 14, 2025",
    total: "$180.50",
    status: "Shipped",
  },
  {
    id: "#SB10010",
    customer: "Robert Brown",
    date: "May 13, 2025",
    total: "$210.99",
    status: "Processing",
  },
  {
    id: "#SB10009",
    customer: "Emily Davis",
    date: "May 12, 2025",
    total: "$560.45",
    status: "Delivered",
  },
  {
    id: "#SB10008",
    customer: "Michael Lee",
    date: "May 11, 2025",
    total: "$98.99",
    status: "Shipped",
  },
  {
    id: "#SB10007",
    customer: "Sarah Wilson",
    date: "May 10, 2025",
    total: "$98.99",
    status: "Pending",
  },
];

const statusStyle: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function SellerOrdersPage() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");

  const rows = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()),
  );

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

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === i
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            {t}
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
                {rows.map((o) => (
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
                      {o.total}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${statusStyle[o.status]}`}
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50 text-xs h-7 px-3 gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing 1 to {rows.length} of {orders.length} orders
            </span>
            <div className="flex gap-1">
              {[1, 2].map((n) => (
                <button
                  key={n}
                  className={`w-7 h-7 rounded text-xs font-medium ${n === 1 ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
