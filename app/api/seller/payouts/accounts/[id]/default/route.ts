import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import type { BankAccountDocument } from "@/types/payout";

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
  const collection = db.collection<BankAccountDocument>("bankAccounts");

  const target = await collection.findOne({
    _id: new ObjectId(id),
    sellerId: session.user.id,
  });

  if (!target) {
    return NextResponse.json(
      { error: "Bank account not found" },
      { status: 404 },
    );
  }

  await collection.updateMany(
    { sellerId: session.user.id },
    { $set: { isPrimary: false } },
  );

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { isPrimary: true, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return NextResponse.json(result);
}
