import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { OrderDocument } from "@/types/order";


type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Scope the lookup to orderId AND userId — never trust the URL alone.
    // Order IDs are sequential (SB10011, SB10012...) so without the userId
    // check anyone could page through other people's orders by editing the URL.
    const order = await db.collection<OrderDocument>("orders").findOne({
      orderId: id,
      userId: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: order.orderId,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      cardLast4: order.cardLast4 ?? null,
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
