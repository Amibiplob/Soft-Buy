import clientPromise from "@/lib/db";

export interface SellerBalance {
  totalEarnings: number;
  monthEarnings: number;
  available: number;
  pending: number;
  totalPaidOut: number;
}

export async function getSellerBalance(
  sellerId: string,
): Promise<SellerBalance> {
  const client = await clientPromise;
  const db = client.db();
  const orders = db.collection("orders");
  const payouts = db.collection("payouts");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const liveFilter = { sellerId, status: { $ne: "Cancelled" } };

  const [totalAgg, monthAgg, deliveredAgg, pendingAgg, paidOutAgg] =
    await Promise.all([
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
      payouts
        .aggregate([
          { $match: { sellerId, status: { $ne: "Failed" } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
    ]);

  const totalPaidOut = paidOutAgg[0]?.total ?? 0;

  return {
    totalEarnings: totalAgg[0]?.total ?? 0,
    monthEarnings: monthAgg[0]?.total ?? 0,
    available: (deliveredAgg[0]?.total ?? 0) - totalPaidOut,
    pending: pendingAgg[0]?.total ?? 0,
    totalPaidOut,
  };
}
