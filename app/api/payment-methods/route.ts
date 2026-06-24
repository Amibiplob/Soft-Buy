import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const methods = await db
    .collection("paymentMethods")
    .find({ userId: session.user.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();

  return NextResponse.json(methods);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { cardNumber, cardholderName, expiry } = body;

  if (!cardNumber || !expiry) {
    return NextResponse.json(
      { error: "Card number and expiry are required" },
      { status: 400 },
    );
  }

  const cleanNumber = cardNumber.replace(/\s/g, "");
  const last4 = cleanNumber.slice(-4);
  const type = cleanNumber.startsWith("4") ? "visa" : "mastercard";

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("paymentMethods");

  const existingCount = await collection.countDocuments({
    userId: session.user.id,
  });

  const newMethod = {
    userId: session.user.id,
    type,
    label: `${type === "visa" ? "Visa" : "Mastercard"} ending in ${last4}`,
    detail: `Expires ${expiry}`,
    last4,
    cardholderName: cardholderName || "",
    expiry,
    isDefault: existingCount === 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(newMethod);

  return NextResponse.json(
    { ...newMethod, _id: result.insertedId },
    { status: 201 },
  );
}
