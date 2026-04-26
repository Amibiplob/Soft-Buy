"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

// ---- Fake Data ----
const reviews = [
  {
    id: "1",
    name: "Michael Tan",
    role: "Product Manager",
    image: "https://i.pravatar.cc/100?img=3",
    rating: 5,
    review:
      "Smooth experience from start to finish. The platform is intuitive, delivery was fast, and the product quality exceeded expectations.",
  },
  {
    id: "2",
    name: "Sarah Ahmed",
    role: "UX Designer",
    image: "https://i.pravatar.cc/100?img=5",
    rating: 5,
    review:
      "Everything is well organized and easy to navigate. Checkout felt effortless and customer support responded within minutes.",
  },
  {
    id: "3",
    name: "David Rahman",
    role: "Software Engineer",
    image: "https://i.pravatar.cc/100?img=8",
    rating: 4,
    review:
      "Great value overall. The ordering process was smooth and the packaging was secure. Would definitely recommend.",
  },
  {
    id: "4",
    name: "Emma Lee",
    role: "Entrepreneur",
    image: "https://i.pravatar.cc/100?img=10",
    rating: 5,
    review:
      "Very reliable service. I’ve ordered multiple times and the experience has been consistently solid every time.",
  },
];

// ---- Card ----
function ReviewCard({ item }: any) {
  return (
    <Card className="min-w-[320px] max-w-[320px] snap-start border bg-background">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          {/* Stars */}
          <div className="flex mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < item.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>

          {/* Review */}
          <p className="text-sm leading-relaxed text-foreground/90">
            “{item.review}”
          </p>
        </div>

        {/* User */}
        <div className="mt-6">
          <p className="text-sm font-medium">{item.name}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewsSection() {
  return (
    <section className="py-10 bg-muted/30 overflow-hidden border-t">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          What Our Customers Say
        </h2>

        {/* Stars summary */}
        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
      </div>

      {/* Full-width scroll */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center gap-6">
          {reviews.map((item) => (
            <ReviewCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 mt-20">
        <div className="flex items-center justify-around gap-8 text-center">
          <div>
            <p className="text-3xl font-semibold">10K+</p>
            <p className="text-sm text-muted-foreground mt-1">customers</p>
          </div>

          <div>
            <p className="text-3xl font-semibold">4.8/5</p>
            <p className="text-sm text-muted-foreground mt-1">average rating</p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-3xl font-semibold">99%</p>
            <p className="text-sm text-muted-foreground mt-1">
              satisfaction rate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
