import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import type {
  CouponDocument,
  CouponType,
  CouponStoredStatus,
} from "@/types/coupon";

const VALID_TYPES: CouponType[] = ["Percentage", "Fixed", "Shipping"];
const VALID_STATUSES: CouponStoredStatus[] = ["Active", "Paused"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
    if (!ObjectId.isValid(couponId)) {
      return NextResponse.json({ error: "Invalid coupon id" }, { status: 400 });
    }

    const body = (await req.json()) as {
      type?: unknown;
      value?: unknown;
      usageLimit?: unknown;
      expiresAt?: unknown;
      status?: unknown;
    };

    const client = await clientPromise;
    const db = client.db();
    const couponsCollection = db.collection<CouponDocument>("coupons");

    const existing = await couponsCollection.findOne({
      _id: new ObjectId(couponId),
      sellerId: session.user.id,
    });

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const update: Partial<CouponDocument> = { updatedAt: new Date() };

    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type as CouponType)) {
        return NextResponse.json(
          { error: "Invalid discount type" },
          { status: 400 },
        );
      }
      update.type = body.type as CouponType;
    }

    const effectiveType = update.type ?? existing.type;

    if (body.value !== undefined) {
      const value = Number(body.value);
      if (
        effectiveType === "Percentage" &&
        (!Number.isFinite(value) || value <= 0 || value > 100)
      ) {
        return NextResponse.json(
          { error: "Percentage value must be between 1 and 100" },
          { status: 400 },
        );
      }
      if (
        effectiveType === "Fixed" &&
        (!Number.isFinite(value) || value <= 0)
      ) {
        return NextResponse.json(
          { error: "Fixed value must be greater than 0" },
          { status: 400 },
        );
      }
      update.value = effectiveType === "Shipping" ? 0 : value;
    }

    if (body.usageLimit !== undefined) {
      const usageLimit = Number(body.usageLimit);
      if (!Number.isInteger(usageLimit) || usageLimit < existing.usedCount) {
        return NextResponse.json(
          {
            error: `Usage limit must be a whole number of at least ${existing.usedCount} (already used)`,
          },
          { status: 400 },
        );
      }
      update.usageLimit = usageLimit;
    }

    if (body.expiresAt !== undefined) {
      const expiresAt = new Date(body.expiresAt as string);
      if (Number.isNaN(expiresAt.getTime())) {
        return NextResponse.json(
          { error: "Invalid expiry date" },
          { status: 400 },
        );
      }
      update.expiresAt = expiresAt;
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status as CouponStoredStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      update.status = body.status as CouponStoredStatus;
    }

    await couponsCollection.updateOne(
      { _id: new ObjectId(couponId), sellerId: session.user.id },
      { $set: update },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/seller/coupons/[couponId] error:", err);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ couponId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponId } = await params;
    if (!ObjectId.isValid(couponId)) {
      return NextResponse.json({ error: "Invalid coupon id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const couponsCollection = db.collection<CouponDocument>("coupons");

    const result = await couponsCollection.deleteOne({
      _id: new ObjectId(couponId),
      sellerId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/seller/coupons/[couponId] error:", err);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
