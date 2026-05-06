"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const coupons = [
  {
    id: 1,
    code: "SAVE10",
    type: "Percentage",
    value: "10%",
    used: 24,
    limit: 100,
    expires: "Jun 30, 2025",
    status: "Active",
  },
  {
    id: 2,
    code: "FLAT20",
    type: "Fixed",
    value: "$20",
    used: 8,
    limit: 50,
    expires: "May 31, 2025",
    status: "Active",
  },
  {
    id: 3,
    code: "WELCOME15",
    type: "Percentage",
    value: "15%",
    used: 45,
    limit: 200,
    expires: "Dec 31, 2025",
    status: "Active",
  },
  {
    id: 4,
    code: "SUMMER25",
    type: "Percentage",
    value: "25%",
    used: 50,
    limit: 50,
    expires: "May 15, 2025",
    status: "Expired",
  },
  {
    id: 5,
    code: "FREESHIP",
    type: "Shipping",
    value: "Free",
    used: 12,
    limit: 80,
    expires: "Jul 01, 2025",
    status: "Active",
  },
];

const statusStyle: Record<string, string> = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Expired: "bg-gray-100 text-gray-500 border-gray-200",
  Paused: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function CouponsPage() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Coupons",
            value: "5",
            color: "bg-blue-50 text-blue-600",
          },
          { label: "Active", value: "4", color: "bg-green-50 text-green-600" },
          { label: "Expired", value: "1", color: "bg-gray-50 text-gray-600" },
          {
            label: "Total Used",
            value: "139",
            color: "bg-purple-50 text-purple-600",
          },
        ].map((s) => (
          <Card key={s.label} className="border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}
              >
                <Tag className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coupons Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">
            All Coupons
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "Code",
                    "Type",
                    "Discount",
                    "Used / Limit",
                    "Expires",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 text-gray-800 text-xs font-mono px-2 py-0.5 rounded font-semibold">
                          {c.code}
                        </code>
                        <button
                          onClick={() => copy(c.code)}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copied === c.code && (
                          <span className="text-xs text-green-600 font-medium">
                            Copied!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {c.type}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-green-600">
                      {c.value}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>
                          {c.used}/{c.limit}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(c.used / c.limit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {c.expires}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${statusStyle[c.status]}`}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-7 h-7 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-7 h-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Coupon Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Coupon Code</Label>
              <Input
                placeholder="SAVE10"
                className="h-9 text-sm font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Discount Type</Label>
                <select className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-green-500/30">
                  <option>Percentage</option>
                  <option>Fixed</option>
                  <option>Shipping</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Value</Label>
                <Input placeholder="10" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Usage Limit</Label>
                <Input
                  placeholder="100"
                  type="number"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Expiry Date</Label>
                <Input type="date" className="h-9 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
