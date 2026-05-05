import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // your NextAuth config
import { Product } from "@/types/product";

// CREATE product
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Product = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const product: Product = {
    ...body,
    userId: session.user.id, // make sure you add this in your NextAuth callbacks
  };

  const result = await db.collection<Product>("products").insertOne(product);

  return NextResponse.json(result);
}

// GET all products
export async function GET() {
  const client = await clientPromise;
  const db = client.db();

  const products = await db
    .collection<Product>("products")
    .find()
    .sort({ added_on: -1 })
    .toArray();

  return NextResponse.json(products);
}
