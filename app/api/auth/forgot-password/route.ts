import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    // Always return success
    if (!user) {
      return NextResponse.json({ message: "ok" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token
    await db.collection("password_resets").insertOne({
      userId: user._id,
      token,
      expires,
      createdAt: new Date(),
    });

    // Reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Send email
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Password Reset</h2>
          <p>You requested a password reset.</p>
          <p>
            Click the link below to reset your password:
          </p>
          <a 
            href="${resetLink}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#000;
              color:#fff;
              text-decoration:none;
              border-radius:6px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:20px;">
            Or copy this URL:
          </p>

          <p>${resetLink}</p>

          <p>This link expires in 1 hour.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
