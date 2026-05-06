import clientPromise from "@/lib/db";

export interface Product {
  _id: string;
  title: string;
  price: number;
  rating: number;
  category: string;
  image?: string;
  description?: string;
}

export async function getProducts(): Promise<Product[]> {
  const client = await clientPromise;
  const db = client.db();
  const docs = await db.collection("products").find({}).toArray();
  // Serialize ObjectId + Date before passing to client components
  return JSON.parse(JSON.stringify(docs));
}

export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  const client = await clientPromise;
  const db = client.db();
  const docs = await db
    .collection("products")
    .find({ category: { $regex: new RegExp(`^${category}$`, "i") } })
    .toArray();
  return JSON.parse(JSON.stringify(docs));
}
