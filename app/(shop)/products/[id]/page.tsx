"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/product";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addItem, items } = useCart();

  const isProductInCart = items.some((item) => item.id === product?._id);

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
            className="rounded-xl object-cover max-h-100 w-full"
          />
        </Card>

        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{product.title}</h1>

          <p className="text-2xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </p>

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

          {/* Interactive Button reflecting context state */}
          <Button
            className="w-full text-base py-6 transition-all"
            variant={isProductInCart ? "secondary" : "default"}
            style={{
              backgroundColor: !isProductInCart ? "#16a34a" : undefined,
            }} // maintaining green identity on active action
            onClick={() =>
              addItem({
                id: product._id,
                name: product.title,
                price: product.price,
                image: product.image ?? "",
              })
            }
          >
            {isProductInCart ? (
              <>
                <Check className="mr-2 h-5 w-5" /> Already in Cart
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
