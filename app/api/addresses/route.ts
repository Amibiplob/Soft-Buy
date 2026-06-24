import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AddressDocument } from "@/types/address";
import clientPromise from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const docs = await db
    .collection<AddressDocument>("addresses")
    .find({ userId: session.user.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();

  const addresses = docs.map(({ _id, userId, ...rest }) => ({
    id: _id!.toString(),
    ...rest,
  }));

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (
    !body.name ||
    !body.street ||
    !body.city ||
    !body.state ||
    !body.zip ||
    !body.phone
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<AddressDocument>("addresses");

  const existingCount = await collection.countDocuments({
    userId: session.user.id,
  });

  const now = new Date();
  const newAddress: AddressDocument = {
    userId: session.user.id,
    label: body.label?.trim() || "New Address",
    name: body.name,
    street: body.street,
    suite: body.suite || "",
    city: body.city,
    state: body.state,
    zip: body.zip,
    country: body.country || "United States",
    phone: body.phone,
    isDefault: existingCount === 0, // first address becomes default automatically
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(newAddress);
  const { userId, ...rest } = newAddress;

  return NextResponse.json(
    { id: result.insertedId.toString(), ...rest },
    { status: 201 },
  );
}
