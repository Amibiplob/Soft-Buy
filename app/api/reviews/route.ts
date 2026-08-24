import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import type { OrderDocument } from "@/types/order";
import type { ReviewDocument } from "@/types/review";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const reviewed = await db
      .collection<ReviewDocument>("reviews")
      .find({ orderId, buyerId: session.user.id })
      .project({ productId: 1 })
      .toArray();

    return NextResponse.json({
      reviewedProductIds: reviewed.map((r) => r.productId as string),
    });
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      orderId?: unknown;
      productId?: unknown;
      rating?: unknown;
      comment?: unknown;
    };

    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const productId = typeof body.productId === "string" ? body.productId : "";
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!orderId || !productId) {
      return NextResponse.json(
        { error: "Missing order or product" },
        { status: 400 },
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }
    if (!comment || comment.length < 5) {
      return NextResponse.json(
        { error: "Comment is too short" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const order = await db
      .collection<OrderDocument>("orders")
      .findOne({ orderId, userId: session.user.id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "Delivered") {
      return NextResponse.json(
        { error: "You can only review items from delivered orders" },
        { status: 400 },
      );
    }

    const item = order.items.find((i) => i.productId === productId);
    if (!item) {
      return NextResponse.json(
        { error: "Product not in this order" },
        { status: 400 },
      );
    }

    const reviews = db.collection<ReviewDocument>("reviews");

    const existing = await reviews.findOne({
      orderId,
      productId,
      buyerId: session.user.id,
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already reviewed this item" },
        { status: 409 },
      );
    }

    const review: ReviewDocument = {
      sellerId: item.sellerId ?? order.sellerId,
      productId,
      productName: item.name,
      orderId,
      buyerId: session.user.id,
      buyerName: session.user.name ?? order.customerName,
      rating,
      comment,
      status: "Published",
      createdAt: new Date(),
    };

    const result = await reviews.insertOne(review);

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
