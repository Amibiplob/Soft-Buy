"use client";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import productsData from "@/public/products.json";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type Product = {
  id: number;
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
  const product = productsData.find((p: Product) => p.id === Number(params.id));

  if (!product) return notFound();

  return (
    <div className="container mx-auto py-6 px-4 md:px-0 space-y-6">
      {/* Back Button */}

      <Link
        href={"/products"}
        className="flex items-center gap-2  transition-all"
      >
        <Button variant="outline" className=" hover:bg-gray-200 transition-all">
          ← Back to Items
        </Button>
      </Link>

      {/* Main Product Section */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Image Section */}
        <Card className="shadow-lg rounded-lg transition-all hover:shadow-xl ">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="rounded-xl object-cover max-h-[400px] w-full"
          />
        </Card>

        {/* Info Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-gray-800">
            {product.title}
          </h1>

          <p className="text-2xl font-semibold text-green-600">
            ${product.price}
          </p>

          <p className="text-sm text-muted-foreground">
            Category: {product.category}
          </p>

          <p className="text-sm text-muted-foreground">
            Added on {product.added_on}
          </p>

          <Separator className="my-4" />

          <p className="text-gray-700">{product.details}</p>

          {/* Key Features */}
          <div>
            <h3 className="font-semibold mt-4 mb-2">Key Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {product.key_features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Rating */}
          <div className="flex gap-2 items-center mt-4">
            <span className="text-yellow-500 font-semibold">
              ⭐ {product.rating}
            </span>
          </div>

          {/* Add to Cart Button */}
          <Button className="mt-6 w-full bg-green-600 hover:bg-green-700 transition-all duration-200">
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Related Items Section */}
      <div>
        <h2 className="text-xl font-bold mt-12 mb-4">Related Items</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {productsData
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((item) => (
              <Card
                key={item.id}
                className="p-4 space-y-1 hover:shadow-lg transition-all rounded-lg"
              >
                {/* Image */}
                <div className="h-48 w-full bg-gray-200 rounded-md overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={200}
                    height={150}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Title */}
                <h3 className="font-medium text-lg">{item.title}</h3>

                {/* Rating */}
                <p className="text-sm text-muted-foreground">
                  ⭐ {item.rating}
                </p>

                {/* Price */}
                <p className="font-semibold">${item.price}</p>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
