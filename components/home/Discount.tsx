"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import Link from "next/link";

export default function DiscountSection() {
  const [copied, setCopied] = useState(false);
  const couponCode = "SAVE30";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm rounded-full bg-muted border">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Limited Time Offer
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Save more on your next purchase
        </h2>

        {/* Subtext */}
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Get up to
          <span className="font-semibold text-foreground">30% off</span> on
          selected items. Simple, fast, and secure shopping experience.
        </p>

        {/* Coupon */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="px-5 py-2 rounded-lg border bg-background font-mono text-sm tracking-wider">
            {couponCode}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link href="/products">
            <Button size="lg" className="px-8">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
