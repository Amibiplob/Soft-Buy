import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const [user, pendingOrders] = await Promise.all([
    db
      .collection("users")
      .findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { storeName: 1, store: 1 } },
      ),
    db.collection("orders").countDocuments({
      sellerId: session.user.id,
      status: "Pending",
    }),
  ]);

  return NextResponse.json({
    storeName: user?.storeName ?? "",
    logo: user?.store?.profile?.logo ?? "",
    pendingOrders,
  });
}
