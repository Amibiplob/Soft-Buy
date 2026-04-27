"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type Product = {
  _id?: string;
  title: string;
  image: string;
  details: string;
  price: number;
  rating: number;
  category: string;
  added_on: string;
  key_features: string[];
};

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Not found");

        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!product) return <p className="p-6">Product not found</p>;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Back */}
      <Link href="/products">
        <Button variant="outline">← Back to Items</Button>
      </Link>

      {/* Product */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <Card className="shadow-lg rounded-lg">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="rounded-xl object-cover max-h-[400px] w-full"
          />
        </Card>

        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{product.title}</h1>

          <p className="text-2xl font-bold text-green-600">${product.price}</p>

          <p className="text-sm text-muted-foreground">
            Category: {product.category}
          </p>

          <p className="text-sm text-muted-foreground">
            Added on {product.added_on}
          </p>

          <Separator />

          <p>{product.details}</p>

          <div>
            <h3 className="font-semibold mb-2">Key Features</h3>
            <ul className="list-disc pl-5">
              {product.key_features?.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <p className="text-yellow-500 font-semibold">⭐ {product.rating}</p>

          <Button className="w-full bg-green-600 hover:bg-green-700">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
