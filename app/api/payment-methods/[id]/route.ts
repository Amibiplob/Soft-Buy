import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { cardholderName, expiry } = body;

  const client = await clientPromise;
  const db = client.db();

  const updateFields: Record<string, unknown> = { updatedAt: new Date() };
  if (cardholderName !== undefined)
    updateFields.cardholderName = cardholderName;
  if (expiry !== undefined) {
    updateFields.expiry = expiry;
    updateFields.detail = `Expires ${expiry}`;
  }

  const result = await db
    .collection("paymentMethods")
    .findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: updateFields },
      { returnDocument: "after" },
    );

  if (!result) {
    return NextResponse.json(
      { error: "Payment method not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("paymentMethods");

  const target = await collection.findOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (!target) {
    return NextResponse.json(
      { error: "Payment method not found" },
      { status: 404 },
    );
  }

  if (target.isDefault) {
    return NextResponse.json(
      {
        error:
          "Cannot remove default payment method. Set another as default first.",
      },
      { status: 400 },
    );
  }

  await collection.deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ success: true });
}
