import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import admin from "@/lib/firebaseAdmin";
import { Product } from "@/types/product";

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split("Bearer ")[1];

  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

// CREATE product
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Product = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const product: Product = {
    ...body,
    userId: user.uid,
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
