import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderDocument {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const orders = await db
      .collection<OrderDocument>("orders")
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = orders.map((order) => ({
      id: order.orderId,
      date: new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      items: order.items.length,
      total: `$${order.totalAmount.toFixed(2)}`,
      status: order.status,
      images: order.items.slice(0, 4).map((item) => item.image),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
