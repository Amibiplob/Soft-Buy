import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Product } from "@/types/product";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const products = await db
      .collection<Product>("products")
      .find()
      .sort({ added_on: -1 })
      .toArray();

    return NextResponse.json(products);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const body: Product = await req.json();
    const product: Product = { ...body, userId: session.user.id };

    const result = await db.collection<Product>("products").insertOne(product);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
