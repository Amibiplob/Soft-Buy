"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
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
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react";
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

  if (loading) return <p>Loading...</p>;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login"); // redirect after logout
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
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Icon */}
            <Image
              src="/icon.png"
              width={20}
              height={20}
              alt="Picture of the author"
            />

            {/* Text */}
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-gray-900">Soft</span>
              <span className="text-green-600">Buy</span>
            </h1>
          </Link>
        </div>

        {/* CENTER: Nav Links (Desktop) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.title}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className="px-4 py-2 text-sm font-medium hover:text-primary"
                    >
                      {link.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="icon.png" alt="user" />
                  <AvatarFallback>User</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Hi, {user.displayName}</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href="/products/add">Add Products</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/products/manage">Manage Products</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOutIcon />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* MOBILE MENU */}
        <div className="lg:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[320px] p-0">
              {/* HEADER */}
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle className="flex items-center justify-between text-left">
                  <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                      {/* Icon */}
                      <Image
                        src="/icon.png"
                        width={20}
                        height={20}
                        alt="Picture of the author"
                      />

                      {/* Text */}
                      <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-gray-900">Soft</span>
                        <span className="text-green-600">Buy</span>
                      </h1>
                    </Link>
                  </div>
                </SheetTitle>
              </SheetHeader>

              {/* BODY */}
              <div className="flex flex-col px-6 py-6">
                {/* NAV LINKS */}
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-muted hover:text-primary"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>

                {/* DIVIDER */}
                <div className="my-6 h-px bg-border" />

                {/* AUTH */}
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    asChild
                  >
                    <Link href="/login">Login</Link>
                  </Button>

                  <Button className="w-full justify-center" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
