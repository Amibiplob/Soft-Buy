import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import {
  ORDER_STATUSES,
  STATUS_TRANSITIONS,
  type OrderStatus,
} from "@/lib/orderStatus";
import type { OrderDocument } from "@/types/order";

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

    const body = (await req.json()) as {
      status?: unknown;
    };

    const status = body.status;

    if (
      typeof status !== "string" ||
      !ORDER_STATUSES.includes(status as OrderStatus)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const nextStatus = status as OrderStatus;

    const client = await clientPromise;
    const db = client.db();

    const ordersCollection = db.collection<OrderDocument>("orders");

    const order = await ordersCollection.findOne({
      orderId,
      sellerId: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = order.status;

    const allowedNext = STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedNext.includes(nextStatus)) {
      return NextResponse.json(
        {
          error: `Cannot move order from "${currentStatus}" to "${nextStatus}"`,
        },
        { status: 400 },
      );
    }

    const now = new Date();

    const result = await ordersCollection.updateOne(
      {
        orderId,
        sellerId: session.user.id,
        status: currentStatus,
      },
      {
        $set: {
          status: nextStatus,
          updatedAt: now,
        },
        $push: {
          statusHistory: {
            status: nextStatus,
            changedAt: now,
          },
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          error:
            "Order was modified by another request. Please refresh and try again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      status: nextStatus,
    });
  } catch (error) {
    console.error("PATCH /api/seller/orders/[orderId] error:", error);

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
