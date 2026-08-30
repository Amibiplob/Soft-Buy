"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Tag,
  BarChart3,
  Wallet,
  Landmark,
  Settings,
  LogOut,
  ShoppingCart,
  Menu,
  X,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badgeKey?: "pendingOrders";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/seller-dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Selling",
    items: [
      { title: "Products", href: "/seller-dashboard/products", icon: Package },
      {
        title: "Orders",
        href: "/seller-dashboard/orders",
        icon: ShoppingBag,
        badgeKey: "pendingOrders",
      },
      { title: "Coupons", href: "/seller-dashboard/coupons", icon: Tag },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/seller-dashboard/analytics",
        icon: BarChart3,
      },
      { title: "Earnings", href: "/seller-dashboard/earnings", icon: Wallet },
      { title: "Payouts", href: "/seller-dashboard/payouts", icon: Landmark },
      { title: "Reviews", href: "/seller-dashboard/reviews", icon: Star },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Store Settings",
        href: "/seller-dashboard/store-settings",
        icon: Settings,
      },
    ],
  },
];

interface NavInfo {
  storeName: string;
  logo: string;
  pendingOrders: number;
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navInfo, setNavInfo] = useState<NavInfo | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/seller/nav-info")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json) setNavInfo(json);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const badgeValues: Record<string, number> = {
    pendingOrders: navInfo?.pendingOrders ?? 0,
  };

  return (
    <div className="min-h-screen bg-background flex items-start container mx-auto">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky inset-y-0 lg:inset-auto top-0 lg:top-16 left-0 z-50 lg:z-0",
          "h-screen lg:h-[calc(100vh-4rem)] w-72 lg:w-64",
          "bg-sidebar border-r border-sidebar-border flex flex-col",
          "transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="h-16 border-b border-sidebar-border px-4 flex items-center justify-between shrink-0">
          <Link href="/seller-dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sidebar-foreground leading-tight">
                SoftBuy
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                Seller Panel
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store card */}
        <div className="px-3 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={navInfo?.logo || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                {(navInfo?.storeName || "SB")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {navInfo?.storeName || "Your Store"}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-sidebar-foreground/60">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Store open
              </p>
            </div>
          </div>
        </div>

        {/* Add product */}
        <div className="px-3 pt-3">
          <Link href="/seller-dashboard/products">
            <Button className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pt-5 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
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
                        "relative flex items-center justify-between gap-3 rounded-lg pl-4 pr-3 py-2.5 transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-primary transition-opacity",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="flex items-center gap-3 min-w-0">
                        <item.icon className="w-4.5 h-4.5 shrink-0" />
                        <span className="text-sm truncate">{item.title}</span>
                      </span>
                      {item.badgeKey && badgeValues[item.badgeKey] > 0 && (
                        <span className="font-mono text-[10px] font-semibold bg-amber-500 text-white rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center shrink-0">
                          {badgeValues[item.badgeKey]}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3 shrink-0">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-red-600 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main section */}
      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-16 z-30 flex items-center gap-3 h-12 px-4 border-b border-border bg-background/95 backdrop-blur">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground/70 hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Seller Panel
          </span>
        </div>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
