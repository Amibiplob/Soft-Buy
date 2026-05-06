import Link from "next/link";
import { ChevronRight, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const orderItems = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=56&h=56&fit=crop",
    price: "$59.99",
    qty: 1,
    subtotal: "$59.99",
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=56&h=56&fit=crop",
    price: "$89.99",
    qty: 1,
    subtotal: "$89.99",
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=56&h=56&fit=crop",
    price: "$60.99",
    qty: 1,
    subtotal: "$60.99",
  },
];

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/" className="hover:text-green-600">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/orders" className="hover:text-green-600">
          Orders
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">Order Details</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-mono font-semibold text-gray-700">
              #{params.id}
            </span>
            <Badge className="bg-green-100 text-green-700 border-green-200 border text-xs font-medium">
              Delivered
            </Badge>
            <span>Placed on May 15, 2025</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50 gap-1.5 text-sm"
        >
          <Download className="w-4 h-4" />
          Download Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Items + Summary */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Items */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {item.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-gray-700">
                          {item.price}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-700">
                          x{item.qty}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-gray-900">
                          {item.subtotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>$210.97</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>$18.06</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span className="text-green-600">$229.03</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Shipping + Payment */}
        <div className="space-y-4">
          {/* Shipping Address */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">John Doe</p>
              <p>123 Green Street</p>
              <p>New York, NY 10001</p>
              <p>United States</p>
              <p className="mt-2">+1 123-456-7890</p>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-blue-600 rounded text-white text-[10px] font-bold flex items-center justify-center">
                  VISA
                </div>
                <span>Visa ending in 4242</span>
              </div>
              <p className="text-gray-500 text-xs">
                Paid on May 15, 2025 – 10:30 AM
              </p>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total Paid</span>
                <span className="text-green-600">$229.03</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
