import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role === "seller") {
    return NextResponse.json({ error: "Already a seller" }, { status: 400 });
  }

  const { storeName } = await req.json();
  if (!storeName || String(storeName).trim().length < 2) {
    return NextResponse.json(
      { error: "Enter a valid store name" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();

  await db
    .collection("users")
    .updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          role: "seller",
          storeName: String(storeName).trim(),
          sellerSince: new Date(),
        },
      },
    );

  return NextResponse.json({ success: true });
}
