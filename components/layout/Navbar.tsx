"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

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

export default function Navbar() {
  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Products", href: "/products" },
    { title: "About", href: "/about" },
  ];

  return (
    <nav className="w-full border-b bg-background">
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-lg font-semibold">
            SoftBuy
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

        {/* RIGHT: Auth Buttons (Desktop) */}
        <div className="hidden lg:flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>

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
                  <Link href="/" className="text-lg font-semibold">
                    SoftBuy
                  </Link>
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
