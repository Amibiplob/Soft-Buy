import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sellerId = session.user.id;

    const client = await clientPromise;
    const db = client.db();
    const orders = db.collection("orders");

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 6 * 86400000);
    weekStart.setHours(0, 0, 0, 0);

    const liveFilter = { sellerId, status: { $ne: "Cancelled" } };

    const [
      totalAgg,
      monthAgg,
      availableAgg,
      pendingAgg,
      weeklyAgg,
      recentOrders,
    ] = await Promise.all([
      orders
        .aggregate([
          { $match: liveFilter },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: { ...liveFilter, createdAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: { sellerId, status: "Delivered" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
      orders
        .aggregate([
          {
            $match: {
              sellerId,
              status: { $nin: ["Cancelled", "Delivered"] },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: { ...liveFilter, createdAt: { $gte: weekStart } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              total: { $sum: "$totalAmount" },
            },
          },
        ])
        .toArray(),
      orders.find(liveFilter).sort({ createdAt: -1 }).limit(15).toArray(),
    ]);

    // No payouts collection yet. Once it exists, sum completed payouts
    // and subtract them here instead of hardcoding 0.
    const payoutsCompleted = 0;

    const totalEarnings = totalAgg[0]?.total ?? 0;
    const monthEarnings = monthAgg[0]?.total ?? 0;
    const available = (availableAgg[0]?.total ?? 0) - payoutsCompleted;
    const pending = pendingAgg[0]?.total ?? 0;

    const weeklyByDay = new Map(
      weeklyAgg.map((d) => [d._id as string, d.total as number]),
    );
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const key = new Date(weekStart.getTime() + i * 86400000)
        .toISOString()
        .slice(0, 10);
      return weeklyByDay.get(key) ?? 0;
    });

    const transactions = recentOrders.map((o) => {
      const items = (o.items ?? []) as { name: string }[];
      const desc = items.length
        ? `Order #${o.orderId} – ${items[0].name}${
            items.length > 1 ? ` +${items.length - 1} more` : ""
          }`
        : `Order #${o.orderId}`;
      return {
        id: `TXN-${o.orderId}`,
        desc,
        date: new Date(o.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        amount: Number(o.totalAmount ?? 0),
        type: "credit" as const,
      };
    });

    return NextResponse.json({
      summary: { totalEarnings, monthEarnings, available, pending },
      weeklyTrend,
      transactions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
