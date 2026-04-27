"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import productsData from "@/public/products.json";

export default function ManageProductsPage() {
  return (
    <div className="container mx-auto space-y-6 mb-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Home &gt;{" "}
        <span className="text-foreground font-medium">Manage Products</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Manage Products</h1>
        <p className="text-muted-foreground">Everything for everyone</p>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Products</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {productsData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>

                <TableCell>
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>

                <TableCell>${item.price.toFixed(2)}</TableCell>

                <TableCell>{item.added_on}</TableCell>

                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => alert(`Delete ${item.title}`)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
