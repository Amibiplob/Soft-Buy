import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { AddressDocument } from "@/types/address";
import clientPromise from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid address id" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<AddressDocument>("addresses");

  const target = await collection.findOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (!target) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await collection.updateMany(
    { userId: session.user.id },
    { $set: { isDefault: false } },
  );
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { isDefault: true, updatedAt: new Date() } },
  );

  return NextResponse.json({ success: true });
}
