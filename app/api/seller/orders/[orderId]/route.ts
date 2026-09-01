import { NextRequest, NextResponse } from "next/server";
import { getSellerSession } from "@/lib/requireSeller";
import clientPromise from "@/lib/db";
import {
  ORDER_STATUSES,
  STATUS_TRANSITIONS,
  type OrderStatus,
} from "@/lib/orderStatus";
import type { OrderDocument } from "@/types/order";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { session, error, status } = await getSellerSession();
  if (!session) {
    return NextResponse.json({ error }, { status });
  }

  const { orderId } = await params;

  const client = await clientPromise;
  const db = client.db();
  const order = await db
    .collection<OrderDocument>("orders")
    .findOne({ orderId, sellerId: session.user.id });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { session, error, status } = await getSellerSession();
  if (!session) {
    return NextResponse.json({ error }, { status });
  }

  const { orderId } = await params;
  const body = (await req.json()) as {
    status?: OrderStatus;
    trackingNumber?: string;
    carrier?: string;
    sellerNote?: string;
  };

  const client = await clientPromise;
  const db = client.db();
  const orders = db.collection<OrderDocument>("orders");

  const order = await orders.findOne({ orderId, sellerId: session.user.id });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };

  if (body.status) {
    if (!ORDER_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const allowed = STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Cannot move order from "${order.status}" to "${body.status}"`,
        },
        { status: 400 },
      );
    }
    update.status = body.status;
  }

  if (body.trackingNumber !== undefined)
    update.trackingNumber = body.trackingNumber.trim();
  if (body.carrier !== undefined) update.carrier = body.carrier.trim();
  if (body.sellerNote !== undefined) update.sellerNote = body.sellerNote.trim();

  await orders.updateOne(
    { orderId, sellerId: session.user.id },
    {
      $set: update,
      ...(body.status
        ? {
            $push: {
              statusHistory: { status: body.status, changedAt: new Date() },
            },
          }
        : {}),
    },
  );

  return NextResponse.json({ success: true });
}
