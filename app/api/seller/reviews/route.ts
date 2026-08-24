import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import type { ReviewDocument } from "@/types/review";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const docs = await db
      .collection<ReviewDocument>("reviews")
      .find({ sellerId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const reviews = docs.map((r) => ({
      id: r._id!.toString(),
      customer: r.buyerName,
      product: r.productName,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      date: new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    }));

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const distribution = [5, 4, 3, 2, 1].map((s) => ({
      stars: s,
      count: reviews.filter((r) => r.rating === s).length,
    }));

    return NextResponse.json({
      reviews,
      summary: {
        total: reviews.length,
        avgRating: Number(avgRating.toFixed(1)),
        distribution,
      },
    });
  } catch (err) {
    console.error("GET /api/seller/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
