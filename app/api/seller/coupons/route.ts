import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import type { CouponDocument, CouponType } from "@/types/coupon";

const VALID_TYPES: CouponType[] = ["Percentage", "Fixed", "Shipping"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const couponsCollection = db.collection<CouponDocument>("coupons");

    const docs = await couponsCollection
      .find({ sellerId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const now = new Date();

    const coupons = docs.map((c) => {
      const expired = c.expiresAt < now || c.usedCount >= c.usageLimit;
      return {
        id: c._id.toString(),
        code: c.code,
        type: c.type,
        value: c.value,
        usedCount: c.usedCount,
        usageLimit: c.usageLimit,
        expiresAt: c.expiresAt.toISOString(),
        status: expired ? "Expired" : c.status,
      };
    });

    const counts = {
      total: coupons.length,
      active: coupons.filter((c) => c.status === "Active").length,
      expired: coupons.filter((c) => c.status === "Expired").length,
      totalUsed: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    };

    return NextResponse.json({ coupons, counts });
  } catch (err) {
    console.error("GET /api/seller/coupons error:", err);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      code?: unknown;
      type?: unknown;
      value?: unknown;
      usageLimit?: unknown;
      expiresAt?: unknown;
    };

    const code =
      typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const type = body.type as CouponType;
    const value = Number(body.value);
    const usageLimit = Number(body.usageLimit);
    const expiresAt =
      typeof body.expiresAt === "string" ? new Date(body.expiresAt) : null;

    if (!code || !/^[A-Z0-9_-]{3,20}$/.test(code)) {
      return NextResponse.json(
        { error: "Code must be 3-20 letters, numbers, - or _" },
        { status: 400 },
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid discount type" },
        { status: 400 },
      );
    }

    if (
      type === "Percentage" &&
      (!Number.isFinite(value) || value <= 0 || value > 100)
    ) {
      return NextResponse.json(
        { error: "Percentage value must be between 1 and 100" },
        { status: 400 },
      );
    }

    if (type === "Fixed" && (!Number.isFinite(value) || value <= 0)) {
      return NextResponse.json(
        { error: "Fixed value must be greater than 0" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(usageLimit) || usageLimit < 1) {
      return NextResponse.json(
        { error: "Usage limit must be a whole number of at least 1" },
        { status: 400 },
      );
    }

    if (
      !expiresAt ||
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt <= new Date()
    ) {
      return NextResponse.json(
        { error: "Expiry date must be a valid future date" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const couponsCollection = db.collection<CouponDocument>("coupons");

    const existing = await couponsCollection.findOne({
      sellerId: session.user.id,
      code,
    });

    if (existing) {
      return NextResponse.json(
        { error: `You already have a coupon with code "${code}"` },
        { status: 409 },
      );
    }

    const now = new Date();

    const coupon: CouponDocument = {
      sellerId: session.user.id,
      code,
      type,
      value: type === "Shipping" ? 0 : value,
      usageLimit,
      usedCount: 0,
      expiresAt,
      status: "Active",
      createdAt: now,
      updatedAt: now,
    };

    const result = await couponsCollection.insertOne(coupon);

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/seller/coupons error:", err);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 },
    );
  }
}
