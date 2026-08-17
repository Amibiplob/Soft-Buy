import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import {
  ORDER_STATUSES,
  STATUS_TRANSITIONS,
  OrderStatus,
} from "@/lib/orderStatus";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const { status } = (await req.json()) as { status: OrderStatus };

    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const ordersCollection = db.collection("orders");

    const order = await ordersCollection.findOne({
      orderId: orderId,
      sellerId: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = order.status as OrderStatus;
    const allowedNext = STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Cannot move order from "${currentStatus}" to "${status}"` },
        { status: 400 },
      );
    }

    await ordersCollection.updateOne(
      { orderId: orderId, sellerId: session.user.id },
      {
        $set: { status, updatedAt: new Date() },
        $push: { statusHistory: { status, changedAt: new Date() } },
      },
    );

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("PATCH /api/seller/orders/[orderId] error:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
