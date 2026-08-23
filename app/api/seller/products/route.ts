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

    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const category = String(body.category ?? "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);

    if (!title) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }
    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "Enter a valid price" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Enter a valid stock quantity" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const product: Omit<Product, "_id"> = {
      id: Date.now(),
      title,
      description: String(body.description ?? ""),
      details: String(body.details ?? body.description ?? ""),
      category,
      price,
      rating: 0,
      stock,
      image: String(body.image ?? ""),
      images: body.image ? [String(body.image)] : [],
      key_features: Array.isArray(body.key_features) ? body.key_features : [],
      added_on: new Date().toISOString(),
      userId: session.user.id,
    };

    const result = await db.collection("products").insertOne(product);
    return NextResponse.json(
      { ...product, _id: result.insertedId },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
