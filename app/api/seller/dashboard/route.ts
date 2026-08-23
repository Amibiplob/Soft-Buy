import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sellerId = session.user.id;

    const now = new Date();
    const rangeStart = startOfDay(new Date(now.getTime() - 6 * 86400000));
    const prevRangeStart = startOfDay(
      new Date(rangeStart.getTime() - 7 * 86400000),
    );

    const client = await clientPromise;
    const db = client.db();
    const orders = db.collection("orders");

    const liveFilter = { sellerId, status: { $ne: "Cancelled" } };

    const [
      currentAgg,
      previousAgg,
      dailyAgg,
      topProductsAgg,
      recentDocs,
      customerAgg,
    ] = await Promise.all([
      orders
        .aggregate([
          { $match: { ...liveFilter, createdAt: { $gte: rangeStart } } },
          {
            $group: {
              _id: null,
              sales: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      orders
        .aggregate([
          {
            $match: {
              ...liveFilter,
              createdAt: { $gte: prevRangeStart, $lt: rangeStart },
            },
          },
          {
            $group: {
              _id: null,
              sales: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: { ...liveFilter, createdAt: { $gte: rangeStart } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              sales: { $sum: "$totalAmount" },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: liveFilter },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.productId",
              name: { $first: "$items.name" },
              image: { $first: "$items.image" },
              sold: { $sum: "$items.quantity" },
              revenue: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 4 },
        ])
        .toArray(),
      orders.find({ sellerId }).sort({ createdAt: -1 }).limit(5).toArray(),
      orders
        .aggregate([
          { $match: { ...liveFilter, createdAt: { $gte: rangeStart } } },
          { $group: { _id: "$userId" } },
          { $count: "customers" },
        ])
        .toArray(),
    ]);

    const currentSales = currentAgg[0]?.sales ?? 0;
    const currentOrders = currentAgg[0]?.orders ?? 0;
    const previousSales = previousAgg[0]?.sales ?? 0;
    const previousOrders = previousAgg[0]?.orders ?? 0;
    const avgOrderValue = currentOrders > 0 ? currentSales / currentOrders : 0;
    const newCustomers = customerAgg[0]?.customers ?? 0;

    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    const salesByDay = new Map(
      dailyAgg.map((d) => [d._id as string, d.sales as number]),
    );
    const trend = Array.from({ length: 7 }, (_, i) => {
      const key = new Date(rangeStart.getTime() + i * 86400000)
        .toISOString()
        .slice(0, 10);
      return { date: key, sales: salesByDay.get(key) ?? 0 };
    });

    const topProducts = topProductsAgg.map((p) => ({
      name: p.name || "Unknown product",
      image: p.image || "",
      sold: p.sold,
      revenue: p.revenue,
    }));

    const recentOrders = recentDocs.map((o) => ({
      id: `#${o.orderId}`,
      customer: o.customerName,
      date: new Date(o.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      total: Number(o.totalAmount ?? 0),
      status: o.status,
    }));

    return NextResponse.json({
      stats: {
        sales: currentSales,
        salesChange: pctChange(currentSales, previousSales),
        orders: currentOrders,
        ordersChange: pctChange(currentOrders, previousOrders),
        avgOrderValue,
        newCustomers,
      },
      trend,
      topProducts,
      recentOrders,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
