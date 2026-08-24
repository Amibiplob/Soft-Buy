"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  customer: string;
  product: string;
  rating: number;
  comment: string;
  status: "Published" | "Pending";
  date: string;
}

interface ReviewsData {
  reviews: Review[];
  summary: {
    total: number;
    avgRating: number;
    distribution: { stars: number; count: number }[];
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const s = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${s} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/seller/reviews")
      .then((res) => res.json())
      .then((json) => {
        if (active) setData(json);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl lg:col-span-2" />
        </div>
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const { reviews, summary } = data;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-5xl font-bold text-gray-900">
              {summary.total > 0 ? summary.avgRating.toFixed(1) : "—"}
            </p>
            <Stars rating={Math.round(summary.avgRating)} size="md" />
            <p className="text-sm text-gray-500">
              {summary.total} reviews total
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.distribution.map(({ stars, count }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4 text-right">
                  {stars}
                </span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{
                      width: summary.total
                        ? `${(count / summary.total) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-4">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-10 text-center text-sm text-gray-400">
              No reviews yet. They&apos;ll show up here once buyers review a
              delivered order.
            </CardContent>
          </Card>
        )}
        {reviews.map((r) => (
          <Card
            key={r.id}
            className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-green-100 text-green-700 text-xs font-bold">
                    {initials(r.customer)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {r.customer}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.product} · {r.date}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "Published"
                          ? "bg-green-100 text-green-700 border-green-200 text-xs"
                          : "bg-orange-100 text-orange-700 border-orange-200 text-xs"
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <Stars rating={r.rating} />
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {r.comment}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
