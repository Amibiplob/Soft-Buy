import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Truck, BadgeDollarSign, Headphones } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description:
      "Safe payments, buyer protection, and guaranteed doorstep delivery.",
  },
  {
    icon: BadgeDollarSign,
    title: "Best Prices",
    description:
      "Competitive prices, amazing deals, and thousands of quality products every day.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Quick and reliable delivery to your doorstep across multiple categories.",
  },
  {
    icon: Headphones,
    title: "Premium Quality",
    description:
      "Wide selection of products including soft cushioned ear cups and built-in microphone devices.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-10 bg-muted/40 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Why Shop With Us
          </h2>
          <p className="text-muted-foreground mt-2">
            Everything you need for a smooth and reliable shopping experience
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-md transition">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
