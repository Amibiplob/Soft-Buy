import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { getSellerSession } from "@/lib/requireSeller";
import { Product } from "@/types/product";

type StatusFilter = "All" | "Active" | "Inactive" | "OutOfStock";

export async function GET(req: NextRequest) {
  try {
    const { session, error, status } = await getSellerSession();
    if (!session) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = req.nextUrl;
    const statusFilter = (searchParams.get("status") as StatusFilter) || "All";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(1, Number(searchParams.get("limit")) || 6);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Product>("products");

    const base: Record<string, unknown> = { userId: session.user.id };
    if (search) {
      base.title = { $regex: search, $options: "i" };
    }

    const statusMatch: Record<StatusFilter, Record<string, unknown>> = {
      All: {},
      Active: { active: { $ne: false }, stock: { $gt: 0 } },
      Inactive: { active: false },
      OutOfStock: { stock: { $lte: 0 } },
    };

    const [total, active, inactive, outOfStock, docs] = await Promise.all([
      collection.countDocuments({ ...base, ...statusMatch.All }),
      collection.countDocuments({ ...base, ...statusMatch.Active }),
      collection.countDocuments({ ...base, ...statusMatch.Inactive }),
      collection.countDocuments({ ...base, ...statusMatch.OutOfStock }),
      collection
        .find({ ...base, ...statusMatch[statusFilter] })
        .sort({ added_on: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ]);

    const filteredTotal =
      statusFilter === "All"
        ? total
        : statusFilter === "Active"
          ? active
          : statusFilter === "Inactive"
            ? inactive
            : outOfStock;

    const products = docs.map((p) => ({
      id: p._id!.toString(),
      name: p.title,
      category: p.category,
      price: p.price,
      stock: p.stock,
      status:
        p.stock <= 0
          ? "Out of Stock"
          : p.active === false
            ? "Inactive"
            : "Active",
      image: p.image,
    }));

    return NextResponse.json({
      products,
      counts: {
        All: total,
        Active: active,
        Inactive: inactive,
        OutOfStock: outOfStock,
      },
      total: filteredTotal,
      page,
      totalPages: Math.max(1, Math.ceil(filteredTotal / limit)),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error, status } = await getSellerSession();
    if (!session) {
      return NextResponse.json({ error }, { status });
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
      active: true,
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
