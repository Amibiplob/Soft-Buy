import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";


export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, phone, dateOfBirth, image } = body;
  const updates: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }
    updates.email = email.trim().toLowerCase();
  }

  if (phone !== undefined)
    updates.phone = typeof phone === "string" ? phone.trim() : "";
  if (dateOfBirth !== undefined)
    updates.dateOfBirth = typeof dateOfBirth === "string" ? dateOfBirth : "";
  if (image !== undefined) {
    if (typeof image !== "string") {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }
    updates.image = image;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();

  if (updates.email && updates.email !== session.user.email) {
    const existing = await db
      .collection("users")
      .findOne({ email: updates.email });
    if (existing) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 409 },
      );
    }
  }

  const result = await db
    .collection("users")
    .findOneAndUpdate(
      { email: session.user.email },
      { $set: updates },
      { returnDocument: "after" },
    );

  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: result.name,
    email: result.email,
    phone: result.phone ?? "",
    dateOfBirth: result.dateOfBirth ?? "",
    image: result.image ?? "",
  });
}
