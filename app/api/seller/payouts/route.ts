import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { getSellerBalance } from "@/lib/sellerBalance";
import type { BankAccountDocument, PayoutDocument } from "@/types/payout";

type CounterDocument = { _id: "payoutId"; seq: number };

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sellerId = session.user.id;

    const client = await clientPromise;
    const db = client.db();

    const [balance, accounts, history] = await Promise.all([
      getSellerBalance(sellerId),
      db
        .collection<BankAccountDocument>("bankAccounts")
        .find({ sellerId })
        .sort({ isPrimary: -1, createdAt: -1 })
        .toArray(),
      db
        .collection<PayoutDocument>("payouts")
        .find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray(),
    ]);

    return NextResponse.json({
      summary: {
        available: balance.available,
        pending: balance.pending,
        totalPaidOut: balance.totalPaidOut,
      },
      bankAccounts: accounts.map((a) => ({
        id: a._id!.toString(),
        method: a.method,
        bankName: a.bankName,
        accountHolder: a.accountHolder,
        last4: a.last4,
        isPrimary: a.isPrimary,
      })),
      payoutHistory: history.map((p) => ({
        id: p.payoutId,
        amount: p.amount,
        method: p.method,
        accountLabel: p.accountLabel,
        date: new Date(p.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: p.status,
      })),
    });
  } catch (err) {
    console.error("GET /api/seller/payouts error:", err);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
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
    const sellerId = session.user.id;

    const body = (await req.json()) as { amount?: unknown };
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid payout amount" },
        { status: 400 },
      );
    }
    if (amount < 10) {
      return NextResponse.json(
        { error: "Minimum payout is $10" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const primary = await db
      .collection<BankAccountDocument>("bankAccounts")
      .findOne({ sellerId, isPrimary: true });

    if (!primary) {
      return NextResponse.json(
        { error: "Add a bank account before requesting a payout" },
        { status: 400 },
      );
    }

    const balance = await getSellerBalance(sellerId);
    if (amount > balance.available) {
      return NextResponse.json(
        { error: "Amount exceeds available balance" },
        { status: 400 },
      );
    }

    const counter = await db
      .collection<CounterDocument>("counters")
      .findOneAndUpdate(
        { _id: "payoutId" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    const seq = counter?.seq ?? 1;
    const payoutId = `PO${String(seq).padStart(3, "0")}`;

    const accountLabel =
      primary.method === "PayPal"
        ? primary.last4
        : `${primary.bankName} ****${primary.last4}`;

    const payout: PayoutDocument = {
      sellerId,
      payoutId,
      amount: Number(amount.toFixed(2)),
      method: primary.method,
      accountLabel,
      status: "Processing",
      createdAt: new Date(),
    };

    const result = await db
      .collection<PayoutDocument>("payouts")
      .insertOne(payout);

    return NextResponse.json(
      { success: true, id: result.insertedId.toString(), payoutId },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/seller/payouts error:", err);
    return NextResponse.json(
      { error: "Failed to request payout" },
      { status: 500 },
    );
  }
}
