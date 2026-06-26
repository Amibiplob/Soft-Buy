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

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
}

export interface OrderDocument {
  orderId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "paypal" | "cod";
  cardLast4?: string;
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      cardLast4,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
    } = body as {
      items: OrderItem[];
      shippingAddress: ShippingAddress;
      paymentMethod: "card" | "paypal" | "cod";
      cardLast4?: string;
      subtotal: number;
      shippingCost: number;
      tax: number;
      totalAmount: number;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.email ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.country
    ) {
      return NextResponse.json(
        { error: "Missing shipping information" },
        { status: 400 },
      );
    }

    if (!["card", "paypal", "cod"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Atomic sequential order number, e.g. SB10011, SB10012...
    const counter = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "orderId" as unknown as never },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );

    const seq = counter?.seq ?? 1;
    const orderId = `SB${10010 + seq}`;

    const now = new Date();

    const newOrder: OrderDocument = {
      orderId,
      userId: session.user.id,
      items,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      status: "Pending",
      shippingAddress,
      paymentMethod,
      // Only ever store last4 — never full card number or CVC.
      ...(paymentMethod === "card" && cardLast4 ? { cardLast4 } : {}),
      createdAt: now,
      updatedAt: now,
    };

    await db.collection<OrderDocument>("orders").insertOne(newOrder);

    return NextResponse.json(
      { orderId, message: "Order placed successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 },
    );
  }
}
