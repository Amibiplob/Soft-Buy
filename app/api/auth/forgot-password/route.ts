import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Email required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();

  const user = await db
    .collection("users")
    .findOne({ email: email.toLowerCase() });

  // Always return 200 — don't reveal if email exists
  if (!user) return NextResponse.json({ message: "ok" });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.collection("password_resets").insertOne({
    userId: user._id,
    token,
    expires,
    createdAt: new Date(),
  });

  // ⚠️ TODO: Send email with this link using Resend/Nodemailer:
  // const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  console.log("Reset token (wire up email):", token);

  return NextResponse.json({ message: "ok" });
}
