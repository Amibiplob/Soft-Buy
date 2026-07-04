import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/auth";


export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const client = await clientPromise;
  const db = client.db();

  const user = await db
    .collection("wishlists")
    .findOne({ userEmail: session.user.email });

  return NextResponse.json({ items: user?.items ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { item } = await req.json();
  const client = await clientPromise;
  const db = client.db();

  await db
    .collection("wishlists")
    .updateOne(
      { userEmail: session.user.email },
      { $addToSet: { items: item } },
      { upsert: true },
    );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { item } = await req.json();
  const client = await clientPromise;
  const db = client.db();

  await db
    .collection("wishlists")
    .updateOne(
      { userEmail: session.user.email },
      { $pull: { items: { id: item.id } } },
    );

  return NextResponse.json({ success: true });
}
