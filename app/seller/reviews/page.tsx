import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const reviews = [
  {
    id: 1,
    customer: "John Doe",
    rating: 5,
    product: "Wireless Headphones",
    date: "May 15, 2025",
    comment:
      "Amazing sound quality! Exceeded my expectations. The noise cancellation is top-notch.",
    avatar: "JD",
    status: "Published",
  },
  {
    id: 2,
    customer: "Jane Smith",
    rating: 4,
    product: "Smart Watch",
    date: "May 14, 2025",
    comment:
      "Great watch but battery could be better. Overall satisfied with the purchase.",
    avatar: "JS",
    status: "Published",
  },
  {
    id: 3,
    customer: "Robert Brown",
    rating: 5,
    product: "Travel Backpack",
    date: "May 13, 2025",
    comment: "Perfect for travel! Spacious and well-built. Highly recommend.",
    avatar: "RB",
    status: "Published",
  },
  {
    id: 4,
    customer: "Emily Davis",
    rating: 3,
    product: "Running Shoes",
    date: "May 12, 2025",
    comment:
      "Decent shoes but sizing runs a bit large. Make sure to order half a size down.",
    avatar: "ED",
    status: "Pending",
  },
  {
    id: 5,
    customer: "Michael Lee",
    rating: 5,
    product: "Coffee Maker",
    date: "May 11, 2025",
    comment:
      "Best coffee maker I've ever used. Makes perfect coffee every time!",
    avatar: "ML",
    status: "Published",
  },
];

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

const avgRating = (
  reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
).toFixed(1);
const dist = [5, 4, 3, 2, 1].map((s) => ({
  s,
  count: reviews.filter((r) => r.rating === s).length,
}));

export default function ReviewsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
            <Stars rating={Math.round(Number(avgRating))} size="md" />
            <p className="text-sm text-gray-500">
              {reviews.length} reviews total
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
            {dist.map(({ s, count }) => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4 text-right">
                  {s}
                </span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${(count / reviews.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-4">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <Card
            key={r.id}
            className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-green-100 text-green-700 text-xs font-bold">
                    {r.avatar}
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
