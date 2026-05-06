import Link from "next/link";
import Image from "next/image";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import NavAuthSection from "./NavAuthSection";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
  { title: "About", href: "/about" },
];

export default function Navbar() {
  return (
    <nav className="w-full border-b sticky top-0 z-50 bg-slate-50">
      <div className="container mx-auto px-4 flex items-center py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.png" width={20} height={20} alt="logo" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gray-900">Soft</span>
            <span className="text-green-600">Buy</span>
          </span>
        </Link>

        {/* Center Nav */}
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

        {/* Right */}
        <div className="flex items-center gap-3 ml-auto">
          <NavAuthSection />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
