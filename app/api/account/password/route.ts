import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Both current and new password are required" },
      { status: 400 },
    );
  }

  const strongPassword = /^(?=.*[A-Z])(?=.*[0-9!@#$%^&*]).{8,}$/;
  if (!strongPassword.test(newPassword)) {
    return NextResponse.json(
      {
        error:
          "Password must be 8+ characters with an uppercase letter and a number or special character",
      },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();
  const user = await db
    .collection("users")
    .findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!user.password) {
    return NextResponse.json(
      { error: "This account doesn't use a password" },
      { status: 400 },
    );
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 },
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await db
    .collection("users")
    .findOneAndUpdate(
      { email: session.user.email },
      { $set: { password: hashed } },
      { returnDocument: "after" },
    );

  return NextResponse.json({ success: true });
}
