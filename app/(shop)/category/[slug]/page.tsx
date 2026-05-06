import { getProductsByCategory, getProducts } from "@/lib/data/products";
import ProductsClient from "@/components/ProductsClient";
import { notFound } from "next/navigation";

// Map URL slugs → display names + DB category values
const CATEGORY_MAP: Record<string, { label: string; dbValue: string }> = {
  electronics: { label: "Electronics", dbValue: "Electronics" },
  fashion: { label: "Fashion", dbValue: "Fashion" },
  "home-living": { label: "Home & Living", dbValue: "Home & Living" },
  books: { label: "Books", dbValue: "Books" },
  shoes: { label: "Running Shoes", dbValue: "Running Shoes" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORY_MAP[slug];
  if (!cat) return { title: "Category Not Found | SoftBuy" };
  return { title: `${cat.label} | SoftBuy` };
}

// Pre-render known category pages at build time
export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORY_MAP[slug];

  if (!cat) notFound();

  const products = await getProductsByCategory(cat.dbValue);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Category</p>
        <h1 className="text-3xl font-bold">{cat.label}</h1>
      </div>
      {products.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground">
          No products in this category yet.
        </div>
      ) : (
        <ProductsClient products={products} />
      )}
    </main>
  );
}
