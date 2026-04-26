"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, BadgeCheck, Leaf, Truck } from "lucide-react";
/* ---------------- COMPONENTS ---------------- */

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="p-3 rounded-full bg-green-100 text-green-600">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="p-6 text-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground mt-2 text-sm">{desc}</p>
      </CardContent>
    </Card>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Building a smarter, <br />
            <span className="text-green-600">greener marketplace</span> for a
            better tomorrow.
          </h1>

          <p className="mt-6 text-muted-foreground max-w-lg">
            SoftBuy is your trusted online marketplace for quality products at
            the best prices. We connect people with products they love while
            promoting a sustainable and better lifestyle.
          </p>

          {/* FEATURES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <Feature icon={<ShieldCheck />} title="Trusted & Secure" />
            <Feature icon={<BadgeCheck />} title="Quality Products" />
            <Feature icon={<Leaf />} title="Eco Friendly" />
            <Feature icon={<Truck />} title="Fast Delivery" />
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative w-full h-[400px] lg:h-[500px]">
          <Image
            src="/about-softbuy.png"
            alt="SoftBuy About"
            fill
            className="object-contain rounded-xl"
          />
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground">
            To make online shopping simple, safe, and sustainable for everyone.
            We believe in delivering value, quality, and trust with every
            purchase.
          </p>
        </div>
      </section>

      {/* EXTRA SECTION (OPTIONAL NICE TOUCH) */}
      <section className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        <InfoCard
          title="Customer First"
          desc="We prioritize customer satisfaction above everything."
        />
        <InfoCard
          title="Quality Focus"
          desc="Only the best products make it to our platform."
        />
        <InfoCard
          title="Transparent Pricing"
          desc="No hidden fees, clear and honest pricing."
        />
      </section>
    </div>
  );
}
