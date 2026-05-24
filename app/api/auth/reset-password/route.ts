import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find token
    const reset = await db.collection("password_resets").findOne({
      token,
      expires: { $gt: new Date() },
    });

    if (!reset) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db.collection("users").updateOne(
      { _id: reset.userId },
      {
        $set: {
          password: hashedPassword,
        },
      },
    );

    // Delete token after use
    await db.collection("password_resets").deleteOne({
      _id: reset._id,
    });

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
