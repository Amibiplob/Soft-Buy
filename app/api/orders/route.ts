import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

import type {
  OrderDocument,
  OrderItem,
  ShippingAddress,
  PaymentMethod,
} from "@/types/order";

type ProductDocument = {
  _id: ObjectId;
  price: number;
  userId: string;
  image?: string;
  name?: string;
};

type RequestBody = {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
};

type CounterDocument = {
  _id: "orderId";
  seq: number;
};

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
      total: `$${Number(order.totalAmount).toFixed(2)}`,
      status: order.status,
      images: order.items
        .slice(0, 4)
        .map((item) => item.image)
        .filter(Boolean),
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

    const body = (await request.json()) as RequestBody;

    const { items, shippingAddress, paymentMethod, cardLast4 } = body;

    // --------------------------------------------------
    // Basic validation
    // --------------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
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

    if (paymentMethod === "card" && cardLast4 && !/^\d{4}$/.test(cardLast4)) {
      return NextResponse.json(
        { error: "Invalid card information" },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Validate product IDs
    // --------------------------------------------------

    const productIds = items.map((item) => {
      if (!item.productId || !ObjectId.isValid(item.productId)) {
        throw new Error(`Invalid product ID: ${item.productId}`);
      }

      return new ObjectId(item.productId);
    });

    const client = await clientPromise;
    const db = client.db();

    const products = await db
      .collection<ProductDocument>("products")
      .find({
        _id: { $in: productIds },
      })
      .toArray();

    // Use a map so duplicate cart items are handled correctly.
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    // --------------------------------------------------
    // Verify every cart item exists
    // --------------------------------------------------

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          {
            error: `Product ${item.productId} no longer exists`,
          },
          { status: 400 },
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: `Invalid quantity for product ${item.productId}`,
          },
          { status: 400 },
        );
      }
    }

    // --------------------------------------------------
    // Verify seller
    // --------------------------------------------------

    const sellerIds = new Set(
      products.map((product) => product.userId).filter(Boolean),
    );

    if (sellerIds.size === 0) {
      return NextResponse.json(
        { error: "Unable to determine seller" },
        { status: 400 },
      );
    }

    if (sellerIds.size > 1) {
      return NextResponse.json(
        {
          error: "Cart contains items from multiple sellers",
        },
        { status: 400 },
      );
    }

    const sellerId = [...sellerIds][0];

    // --------------------------------------------------
    // Rebuild order items from database values
    // Never trust price/name/image sent by the client.
    // --------------------------------------------------

    const verifiedItems: OrderItem[] = items.map((item) => {
      const product = productMap.get(item.productId)!;

      return {
        ...item,
        price: product.price,
        image: product.image ?? item.image,
        name: product.name ?? item.name,
      };
    });

    // --------------------------------------------------
    // Calculate pricing server-side
    // --------------------------------------------------

    const subtotal = verifiedItems.reduce(
      (sum, item) =>
        sum + productMap.get(item.productId)!.price * item.quantity,
      0,
    );

    // Change these rules to match your store.
    const shippingCost = subtotal >= 100 ? 0 : 10;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shippingCost + tax;

    // Round currency values to 2 decimal places.
    const roundedSubtotal = Number(subtotal.toFixed(2));
    const roundedShippingCost = Number(shippingCost.toFixed(2));
    const roundedTax = Number(tax.toFixed(2));
    const roundedTotalAmount = Number(totalAmount.toFixed(2));

    // --------------------------------------------------
    // Generate order ID
    // --------------------------------------------------

    const counter = await db
      .collection<CounterDocument>("counters")
      .findOneAndUpdate(
        { _id: "orderId" },
        { $inc: { seq: 1 } },
        {
          upsert: true,
          returnDocument: "after",
        },
      );

    const seq = counter?.seq ?? 1;
    const orderId = `SB${10010 + seq}`;

    const now = new Date();

    // --------------------------------------------------
    // Create order
    // --------------------------------------------------

    const newOrder: OrderDocument = {
      orderId,
      userId: session.user.id,
      sellerId,
      customerName: shippingAddress.fullName,

      items: verifiedItems,

      subtotal: roundedSubtotal,
      shippingCost: roundedShippingCost,
      tax: roundedTax,
      totalAmount: roundedTotalAmount,

      status: "Pending",
      statusHistory: [
        {
          status: "Pending",
          changedAt: now,
        },
      ],

      shippingAddress,
      paymentMethod,

      // Only store last 4 digits.
      ...(paymentMethod === "card" && cardLast4 ? { cardLast4 } : {}),

      createdAt: now,
      updatedAt: now,
    };

    await db.collection<OrderDocument>("orders").insertOne(newOrder);

    return NextResponse.json(
      {
        orderId,
        message: "Order placed successfully",
      },
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
