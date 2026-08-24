import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import type { BankAccountDocument, PayoutMethod } from "@/types/payout";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      method?: unknown;
      bankName?: unknown;
      accountHolder?: unknown;
      accountNumber?: unknown;
      routingNumber?: unknown;
    };

    const method: PayoutMethod =
      body.method === "PayPal" ? "PayPal" : "Bank Transfer";
    const bankName =
      typeof body.bankName === "string" ? body.bankName.trim() : "";
    const accountHolder =
      typeof body.accountHolder === "string" ? body.accountHolder.trim() : "";
    const accountNumber =
      typeof body.accountNumber === "string" ? body.accountNumber.trim() : "";
    const routingNumber =
      typeof body.routingNumber === "string" ? body.routingNumber.trim() : "";

    if (!bankName || !accountHolder || !accountNumber) {
      return NextResponse.json(
        { error: "Bank name, account holder, and account number are required" },
        { status: 400 },
      );
    }

    const last4 = method === "PayPal" ? accountNumber : accountNumber.slice(-4);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<BankAccountDocument>("bankAccounts");

    const existingCount = await collection.countDocuments({
      sellerId: session.user.id,
    });

    const account: BankAccountDocument = {
      sellerId: session.user.id,
      method,
      bankName,
      accountHolder,
      last4,
      routingNumber: method === "Bank Transfer" ? routingNumber : undefined,
      isPrimary: existingCount === 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(account);

    return NextResponse.json(
      { ...account, id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/seller/payouts/accounts error:", err);
    return NextResponse.json(
      { error: "Failed to add bank account" },
      { status: 500 },
    );
  }
}
