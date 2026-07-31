"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  Tag,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  ShoppingCart,

  X,
  ChevronRight,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/seller-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/seller-dashboard/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/seller-dashboard/orders",
    icon: ShoppingBag,
    badge: 8,
  },
  {
    title: "Customers",
    href: "/seller-dashboard/customers",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/seller-dashboard/reviews",
    icon: Star,
    badge: 3,
  },
  {
    title: "Coupons",
    href: "/seller-dashboard/coupons",
    icon: Tag,
  },
  {
    title: "Analytics",
    href: "/seller-dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Earnings",
    href: "/seller-dashboard/earnings",
    icon: Wallet,
  },
  {
    title: "Store Settings",
    href: "/seller-dashboard/store-settings",
    icon: Settings,
  },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-start">
      {/* Mobile Overlay */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={cn(
          "sticky top-16 self-star h-[calc(100vh-4rem)] w-64 bg-slate-50 border-r border-slate-800 flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}

        <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between">
          <Link href="/seller-dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-700/30">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="font-bold text-white">SoftBuy</h2>

              <p className="text-xs text-slate-400">Seller Panel</p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action */}

        <div className="p-4">
          <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 pb-5">
          <div className="space-y-1">
            {navigation.map((item) => {
              const active =
                item.href === "/seller-dashboard"
                  ? pathname === "/seller-dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-4 py-3 transition-all",
                    active
                      ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />

                    <span className="text-sm font-medium">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge className="bg-red-500 hover:bg-red-500 text-white rounded-full h-5 min-w-5 px-1 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}

                    {active && <ChevronRight className="w-4 h-4" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Seller Card */}

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-800 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/seller-avatar.png" />

                <AvatarFallback className="bg-green-600 text-white font-semibold">
                  SB
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">
                  SoftBuy Store
                </h4>

                <p className="text-xs text-slate-400">Premium Seller</p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-4 w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <div className="flex-1">
        {/* Page */}

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
