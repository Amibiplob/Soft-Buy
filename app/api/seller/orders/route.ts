import { NextRequest, NextResponse } from "next/server";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { getSellerSession } from "@/lib/requireSeller";
import clientPromise from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { session, error, status } = await getSellerSession();
    if (!session) {
      return NextResponse.json({ error }, { status });
    }

    const sellerId = session.user.id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("status") || "All";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 6);

    const client = await clientPromise;
    const db = client.db();
    const ordersCollection = db.collection("orders");

    const baseFilter: Record<string, unknown> = { sellerId };

    const countAgg = await ordersCollection
      .aggregate([
        { $match: baseFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();

    const counts: Record<string, number> = { All: 0 };
    ORDER_STATUSES.forEach((s) => (counts[s] = 0));
    countAgg.forEach((c) => {
      if (typeof c._id === "string" && c._id in counts) {
        counts[c._id] = c.count;
        counts.All += c.count;
      }
    });

    const filter: Record<string, unknown> = { ...baseFilter };
    if (statusFilter !== "All") filter.status = statusFilter;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    const total = await ordersCollection.countDocuments(filter);

    const docs = await ordersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const orders = docs.map((o) => ({
      id: `#${o.orderId}`,
      orderId: o.orderId,
      customer: o.customerName,
      date: new Date(o.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      total: `$${Number(o.totalAmount).toFixed(2)}`,
      status: o.status,
    }));

    return NextResponse.json({
      orders,
      counts,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    console.error("GET /api/seller/orders error:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
