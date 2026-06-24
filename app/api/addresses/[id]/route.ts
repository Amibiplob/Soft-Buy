import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { AddressDocument } from "@/types/address";
import clientPromise from "@/lib/db";

const EDITABLE_FIELDS = [
  "label",
  "name",
  "street",
  "suite",
  "city",
  "state",
  "zip",
  "country",
  "phone",
] as const;

export async function PATCH(
  req: NextRequest,
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

  const body = await req.json();
  const setFields: Record<string, unknown> = { updatedAt: new Date() };

  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) setFields[field] = body[field];
  }

  const client = await clientPromise;
  const db = client.db();

  const updated = await db
    .collection<AddressDocument>("addresses")
    .findOneAndUpdate(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: setFields },
      { returnDocument: "after" },
    );

  if (!updated) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const { _id, userId, ...rest } = updated;
  return NextResponse.json({ id: _id.toString(), ...rest });
}

export async function DELETE(
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

  if (target.isDefault) {
    return NextResponse.json(
      {
        error:
          "Cannot remove the default address. Set another one as default first.",
      },
      { status: 400 },
    );
  }

  await collection.deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ success: true });
}
