import { getProducts } from "@/lib/data/products";
import ProductsClient from "@/components/ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products | SoftBuy",
  description: "Browse our full catalog of quality products.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">All Products</h1>
      <ProductsClient products={products} />
    </main>
  );
}
