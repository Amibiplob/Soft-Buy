import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  Heart,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

const statCards = [
  {
    label: "Total Orders",
    value: 12,
    sub: "View all orders",
    href: "/dashboard/orders",
    icon: Package,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Pending",
    value: 2,
    sub: "Awaiting payment",
    href: "/dashboard/orders?tab=pending",
    icon: Clock,
    color: "text-orange-500 bg-orange-50",
  },
  {
    label: "Delivered",
    value: 8,
    sub: "Completed orders",
    href: "/dashboard/orders?tab=delivered",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
  },
  {
    label: "Wishlist Items",
    value: 6,
    sub: "View wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
    color: "text-red-500 bg-red-50",
  },
];

const recentOrders = [
  {
    id: "#SB10012",
    date: "May 15, 2025",
    items: 3,
    total: "$340.03",
    status: "Delivered",
  },
  {
    id: "#SB10011",
    date: "May 10, 2025",
    items: 2,
    total: "$180.00",
    status: "Shipped",
  },
  {
    id: "#SB10010",
    date: "May 05, 2025",
    items: 1,
    total: "$89.99",
    status: "Delivered",
  },
  {
    id: "#SB10009",
    date: "Apr 28, 2025",
    items: 4,
    total: "$560.45",
    status: "Delivered",
  },
];

const statusStyles: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
  Pending: "bg-orange-100 text-orange-700 border-orange-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function DashboardOverviewPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session?.user.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Here's what's happening with your account today.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {statCards.map(({ label, value, sub, href, icon: Icon, color }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col gap-2 p-4 rounded-lg border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs font-semibold text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 group-hover:text-green-600 transition-colors">
                  {sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-gray-900">
            Recent Orders
          </CardTitle>
          <Link href="/dashboard/orders">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs gap-1"
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Order ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Items
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.date}</td>
                    <td className="px-6 py-4 text-gray-600">{order.items}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {order.total}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/orders/${order.id.replace("#", "")}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:bg-green-50 text-xs h-7 px-3 gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
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

      {/* Bottom Trust Badges */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: "🔒",
            title: "Secure Payments",
            desc: "Your payments are safe with us.",
          },
          {
            icon: "↩️",
            title: "Easy Returns",
            desc: "Hassle-free returns within 30 days.",
          },
          {
            icon: "🎧",
            title: "24/7 Support",
            desc: "We're here to help you anytime.",
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
