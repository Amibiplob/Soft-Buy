"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ArrowUpRight,
  Bell,
  CirclePlus,
  Menu,
  Search,
  ShoppingCart,
  LogOut,
} from "lucide-react";

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

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
  { title: "About", href: "/about" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === "loading";
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  // Derive initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <nav className="w-full border-b sticky top-0 z-50 bg-slate-50">
      <div className="container mx-auto flex items-center py-4">
        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.png" width={20} height={20} alt="logo" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gray-900">Soft</span>
            <span className="text-green-600">Buy</span>
          </span>
        </Link>

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

        {/* RIGHT: Icons + Auth */}
        <div className="flex items-center gap-3 ml-auto">
          <Search className="w-5 h-5 cursor-pointer hover:text-primary transition" />
          <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-primary transition" />
          <Bell className="w-5 h-5 cursor-pointer hover:text-primary transition" />

          {/* Desktop Auth */}
          <div className="flex">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.image ?? ""}
                        alt={user.name ?? "user"}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Hi, {user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/orders"
                        className="flex items-center gap-2"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        View Orders
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

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
                <SheetHeader className="border-b px-6 py-4">
                  <SheetTitle asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <Image
                        src="/icon.png"
                        width={20}
                        height={20}
                        alt="logo"
                      />
                      <span className="text-xl font-bold tracking-tight">
                        <span className="text-gray-900">Soft</span>
                        <span className="text-green-600">Buy</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

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

                  {/* Mobile Auth */}
                  {loading ? (
                    <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                  ) : user ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 px-3 py-2 mb-1">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={user.image ?? ""}
                            alt={user.name ?? ""}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>

                      <Link
                        href="/products/add"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition"
                      >
                        <CirclePlus className="w-4 h-4" />
                        Add Products
                      </Link>

                      <Link
                        href="/products/manage"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Manage Products
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted text-red-500 transition"
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
        </div>
      </div>
    </nav>
  );
}
