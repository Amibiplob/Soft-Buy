import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";


const ALLOWED_KEYS = [
  "orderUpdates",
  "promotions",
  "newArrivals",
  "reviewReminders",
];

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, value } = await req.json();

  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json(
      { error: "Invalid preference key" },
      { status: 400 },
    );
  }
  if (typeof value !== "boolean") {
    return NextResponse.json(
      { error: "Value must be a boolean" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();

  const result = await db
    .collection("users")
    .findOneAndUpdate(
      { email: session.user.email },
      { $set: { [`notificationPreferences.${key}`]: value } },
      { returnDocument: "after" },
    );

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    notificationPreferences: result.notificationPreferences,
  });
}
