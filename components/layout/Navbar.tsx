"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CirclePlus,
  Menu,
  Search,
  ShoppingCart,
  LogOutIcon,
} from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Products", href: "/products" },
    { title: "About", href: "/about" },
  ];

  return (
    <nav className="w-full border-b sticky top-0 z-50 bg-slate-50">
      <div className="container mx-auto flex items-center py-4">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icon.png" width={20} height={20} alt="logo" />
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gray-900">Soft</span>
              <span className="text-green-600">Buy</span>
            </h1>
          </Link>
        </div>

        {/* CENTER: Nav Links */}
        <div className="hidden lg:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className="px-4 py-2 text-sm font-medium hover:text-primary transition"
                    >
                      {link.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Icons */}
          <Search className="w-5 h-5 cursor-pointer hover:text-primary transition" />
          <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-primary transition" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-primary transition" />

          {/* Auth */}
          {loading ? (
            <p className="text-sm">Loading...</p>
          ) : user ? (
            <div className="hidden lg:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src="icon.png" alt="user" />
                      <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      Hi, {user.displayName}
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        href="/products/add"
                        className="flex items-center gap-2"
                      >
                        <CirclePlus className="w-4 h-4" />
                        Add Products
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/products/manage"
                        className="flex items-center gap-2"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Manage Products
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500"
                  >
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden lg:flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>

              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[320px] p-0 flex flex-col"
              >
                {/* HEADER */}
                <SheetHeader className="border-b px-6 py-4">
                  <SheetTitle className="flex items-center">
                    <Link href="/" className="flex items-center gap-2">
                      <Image
                        src="/icon.png"
                        width={20}
                        height={20}
                        alt="logo"
                      />
                      <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-gray-900">Soft</span>
                        <span className="text-green-600">Buy</span>
                      </h1>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                {/* BODY */}
                <div className="flex flex-col flex-1 px-6 py-6">
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

                  <div className="my-6 h-px bg-border" />

                  {/* Auth */}
                  {user ? (
                    <div className="flex flex-col gap-1">
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Hi, {user.displayName}
                      </div>

                      <Link
                        href="/products/add"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
                      >
                        <CirclePlus className="w-4 h-4" />
                        Add Products
                      </Link>

                      <Link
                        href="/products/manage"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Manage Products
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted text-red-500"
                      >
                        <LogOutIcon className="w-4 h-4" />
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
        </div>
      </div>
    </nav>
  );
}
