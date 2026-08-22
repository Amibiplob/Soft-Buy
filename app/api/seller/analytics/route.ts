import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

const CATEGORY_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#6b7280",
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sellerId = session.user.id;

    const { searchParams } = new URL(req.url);
    const days = Math.min(
      90,
      Math.max(1, Number(searchParams.get("days")) || 7),
    );

    const now = new Date();
    const rangeStart = startOfDay(
      new Date(now.getTime() - (days - 1) * 86400000),
    );
    const prevRangeStart = startOfDay(
      new Date(rangeStart.getTime() - days * 86400000),
    );

    const client = await clientPromise;
    const db = client.db();
    const orders = db.collection("orders");

    // Cancelled orders don't count as sales. Change to match your store's rules.
    const liveFilter = { sellerId, status: { $ne: "Cancelled" } };

    const [
      currentAgg,
      previousAgg,
      dailyAgg,
      categoryAgg,
      countryAgg,
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
          { $match: { ...liveFilter, createdAt: { $gte: rangeStart } } },
          { $unwind: "$items" },
          {
            $addFields: {
              "items.productObjectId": {
                $convert: {
                  input: "$items.productId",
                  to: "objectId",
                  onError: null,
                  onNull: null,
                },
              },
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "items.productObjectId",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $addFields: {
              category: {
                $ifNull: [
                  { $arrayElemAt: ["$product.category", 0] },
                  "Uncategorized",
                ],
              },
            },
          },
          {
            $group: {
              _id: "$category",
              amount: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
            },
          },
          { $sort: { amount: -1 } },
        ])
        .toArray(),
      orders
        .aggregate([
          { $match: { ...liveFilter, createdAt: { $gte: rangeStart } } },
          {
            $group: {
              _id: "$shippingAddress.country",
              amount: { $sum: "$totalAmount" },
            },
          },
          { $sort: { amount: -1 } },
        ])
        .toArray(),
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
    const totalCustomers = customerAgg[0]?.customers ?? 0;
    const avgOrderValue = currentOrders > 0 ? currentSales / currentOrders : 0;

    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    const stats = [
      {
        key: "sales",
        value: currentSales,
        change: pctChange(currentSales, previousSales),
      },
      {
        key: "orders",
        value: currentOrders,
        change: pctChange(currentOrders, previousOrders),
      },
      { key: "aov", value: avgOrderValue, change: null },
      { key: "customers", value: totalCustomers, change: null },
    ];

    // Fill missing days with 0 so the chart has no gaps.
    const salesByDay = new Map(
      dailyAgg.map((d) => [d._id as string, d.sales as number]),
    );
    const trend = Array.from({ length: days }, (_, i) => {
      const key = new Date(rangeStart.getTime() + i * 86400000)
        .toISOString()
        .slice(0, 10);
      return { date: key, sales: salesByDay.get(key) ?? 0 };
    });

    const totalCategoryAmount = categoryAgg.reduce((s, c) => s + c.amount, 0);
    const topCategories = categoryAgg.slice(0, 4);
    const otherCategoryAmount = categoryAgg
      .slice(4)
      .reduce((s, c) => s + c.amount, 0);
    const categories = [
      ...topCategories.map((c, i) => ({
        name: c._id || "Uncategorized",
        amount: c.amount,
        pct:
          totalCategoryAmount > 0
            ? Math.round((c.amount / totalCategoryAmount) * 100)
            : 0,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      })),
      ...(otherCategoryAmount > 0
        ? [
            {
              name: "Others",
              amount: otherCategoryAmount,
              pct:
                totalCategoryAmount > 0
                  ? Math.round(
                      (otherCategoryAmount / totalCategoryAmount) * 100,
                    )
                  : 0,
              color: CATEGORY_COLORS[CATEGORY_COLORS.length - 1],
            },
          ]
        : []),
    ];

    const topCountries = countryAgg.slice(0, 5);
    const otherCountryAmount = countryAgg
      .slice(5)
      .reduce((s, c) => s + c.amount, 0);
    const countryRows = [
      ...topCountries.map((c) => ({
        code: c._id || "unknown",
        amount: c.amount,
      })),
      ...(otherCountryAmount > 0
        ? [{ code: "others", amount: otherCountryAmount }]
        : []),
    ];
    const maxCountryAmount = Math.max(1, ...countryRows.map((c) => c.amount));
    const countries = countryRows.map((c) => ({
      ...c,
      pct: Math.round((c.amount / maxCountryAmount) * 100),
    }));

    return NextResponse.json({ days, stats, trend, categories, countries });
  } catch (err) {
    console.error("GET /api/seller/analytics error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
