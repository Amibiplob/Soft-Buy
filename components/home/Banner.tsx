import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BannerSection() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-6">
            {/* Badge */}
            <span className="inline-block text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground">
              Smart Shopping Platform
            </span>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Buy Smart.
              <p className="text-primary"> Live Better.</p>
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-lg max-w-md">
              SoftBuy is your trusted marketplace for high-quality electronics
              at unbeatable prices. Discover smarter ways to shop today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg">Browse Products</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative w-full h-87.5 lg:h-112.5">
            <div className="absolute inset-0 rounded-2xl overflow-hidden border bg-muted">
              <Image
                src="/banner.jpg"
                alt="Shopping Banner"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
