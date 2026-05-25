import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  const existing = await db
    .collection("users")
    .findOne({ email: email.toLowerCase() });

  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.collection("users").insertOne({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "user",
    createdAt: new Date(),
  });

  return NextResponse.json({ message: "User created" }, { status: 201 });
}
