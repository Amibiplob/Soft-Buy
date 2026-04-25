import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">SoftBuy</h2>
          <p className="text-sm text-muted-foreground">
            Your trusted marketplace for quality products at the best prices.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/faqs">FAQs</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-3">Categories</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/category/electronics">Electronics</Link>
            </li>
            <li>
              <Link href="/category/fashion">Fashion</Link>
            </li>
            <li>
              <Link href="/category/home-living">Home & Living</Link>
            </li>
            <li>
              <Link href="/category/books">Books</Link>
            </li>
            <li>
              <Link href="/category/shoes">Running Shoes</Link>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="font-semibold mb-3">Help</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/shipping">Shipping & Delivery</Link>
            </li>
            <li>
              <Link href="/returns">Returns</Link>
            </li>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-3">Subscribe to our newsletter</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get updates on the latest deals and offers.
          </p>
          <div className="flex gap-2">
            <Input placeholder="Enter your email" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SoftBuy. All rights reserved.
      </div>
    </footer>
  );
}
