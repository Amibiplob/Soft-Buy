"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

import { Menu, ArrowUpRight, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
  { title: "About", href: "/about" },
];

export default function MobileMenu() {
  const { data: session } = useSession();

  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[320px] p-0 flex flex-col">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle asChild>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/icon.png" width={20} height={20} alt="logo" />
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-gray-900">Soft</span>
                  <span className="text-green-600">Buy</span>
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col flex-1 px-6">
            {/* Nav Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-base font-medium hover:bg-muted hover:text-primary transition"
                >
                  {link.title}
                </Link>
              ))}
            </div>

            <div className="my-3 h-px bg-border" />

            {/* Auth Section */}
            {user ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Orders
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-500 hover:bg-muted"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
