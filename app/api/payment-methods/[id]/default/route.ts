import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export async function PATCH(
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

  await collection.updateMany(
    { userId: session.user.id },
    { $set: { isDefault: false } },
  );

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isDefault: true, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return NextResponse.json(result);
}
