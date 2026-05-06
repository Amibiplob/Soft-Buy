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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    label: "Total Sales",
    value: "$8,240",
    change: "+15.2%",
    icon: DollarSign,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Total Orders",
    value: "128",
    change: "+10.1%",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Visitors",
    value: "2,356",
    change: "+18.7%",
    icon: Users,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Conversion Rate",
    value: "3.42%",
    change: "+5.4%",
    icon: BarChart2,
    color: "bg-orange-50 text-orange-600",
  },
];

const topProducts = [
  {
    name: "Wireless Headphones",
    sold: 45,
    revenue: "$3,870",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=48&h=48&fit=crop",
  },
  {
    name: "Smart Watch",
    sold: 20,
    revenue: "$1,760",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=48&h=48&fit=crop",
  },
  {
    name: "Running Shoes",
    sold: 26,
    revenue: "$1,575",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=48&h=48&fit=crop",
  },
  {
    name: "Travel Backpack",
    sold: 40,
    revenue: "$1,200",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=48&h=48&fit=crop",
  },
];

const recentOrders = [
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
    status: "Pending",
  },
];

const statusStyles: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

function Sparkline() {
  const pts = [
    [0, 70],
    [40, 55],
    [80, 65],
    [120, 40],
    [160, 30],
    [200, 45],
    [240, 20],
  ];
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const area = `${d} L240,90 L0,90 Z`;
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

export default function SellerDashboardPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, John Seller! 👋 Here's what's happening with your
            store today.
          </p>
        </div>
        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hidden sm:block">
          May 15 – 21, 2025
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
                  <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {change}{" "}
                    <span className="text-gray-400 font-normal">
                      from last week
                    </span>
                  </div>
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
              <Sparkline />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              {[
                "May 15",
                "May 16",
                "May 17",
                "May 18",
                "May 19",
                "May 20",
                "May 21",
              ].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Top Selling Products
            </CardTitle>
            <Link href="/seller/products">
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
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400">{p.sold} sold</p>
                </div>
                <span className="text-sm font-bold text-green-600 shrink-0">
                  {p.revenue}
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
          <Link href="/seller/orders">
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
                {recentOrders.map((o) => (
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
                        className={`text-xs font-medium ${statusStyles[o.status]}`}
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href="/seller/orders">
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
      