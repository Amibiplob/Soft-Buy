"use client";

import { useState } from "react";
import { Plus, Wallet, Building2, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const payoutHistory = [
  {
    id: "PO001",
    amount: "$500.00",
    method: "Bank Transfer",
    bank: "Chase ****4242",
    date: "May 13, 2025",
    status: "Completed",
  },
  {
    id: "PO002",
    amount: "$340.00",
    method: "Bank Transfer",
    bank: "Chase ****4242",
    date: "May 01, 2025",
    status: "Completed",
  },
  {
    id: "PO003",
    amount: "$780.00",
    method: "PayPal",
    bank: "john@email.com",
    date: "Apr 20, 2025",
    status: "Completed",
  },
  {
    id: "PO004",
    amount: "$220.00",
    method: "Bank Transfer",
    bank: "Chase ****4242",
    date: "Apr 10, 2025",
    status: "Processing",
  },
];

const statusStyle: Record<string, string> = {
  Completed: "bg-green-100 text-green-700 border-green-200",
  Processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Failed: "bg-red-100 text-red-700 border-red-200",
};

export default function PayoutsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Bank Account
        </Button>
      </div>

      {/* Balance + bank */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Available balance */}
        <Card className="border-green-200 bg-gradient-to-br from-green-600 to-green-700 text-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-medium text-green-100">
                Available Balance
              </p>
            </div>
            <p className="text-3xl font-bold">$1,340.00</p>
            <p className="text-xs text-green-200 mt-1">Updated just now</p>
            <Button
              size="sm"
              className="mt-4 bg-white text-green-700 hover:bg-green-50 text-sm font-semibold w-full"
            >
              Request Payout
            </Button>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">$800.00</p>
            <p className="text-xs text-gray-400 mt-1">Clearing in 2-3 days</p>
          </CardContent>
        </Card>

        {/* Total paid out */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                Total Paid Out
              </p>
            </div>
            <p className="text-3xl font-bold text-gray-900">$6,100.00</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank accounts */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Bank Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              bank: "Chase Bank",
              number: "****4242",
              type: "Checking",
              primary: true,
            },
            {
              bank: "PayPal",
              number: "john@email.com",
              type: "PayPal",
              primary: false,
            },
          ].map((acc) => (
            <div
              key={acc.number}
              className={`flex items-center gap-4 p-4 rounded-xl border ${acc.primary ? "border-green-300 bg-green-50/50" : "border-gray-200"}`}
            >
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {acc.bank}
                  </p>
                  {acc.primary && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px] font-semibold">
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {acc.number} · {acc.type}
                </p>
              </div>
              {!acc.primary && (
                <button className="text-xs text-green-600 hover:underline font-medium">
                  Set Primary
                </button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 text-red-500 hover:bg-red-50 h-7 px-3"
              >
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payout history */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "Payout ID",
                    "Amount",
                    "Method",
                    "Account",
                    "Date",
                    "Status",
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
                {payoutHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-green-600">
                      {p.id}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      {p.amount}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {p.method}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {p.bank}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {p.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${statusStyle[p.status]}`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add bank dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Bank Name</Label>
              <Input placeholder="Chase Bank" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Account Holder</Label>
              <Input placeholder="John Doe" className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Account Number</Label>
                <Input
                  placeholder="****4242"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Routing Number</Label>
                <Input
                  placeholder="021000021"
                  className="h-9 text-sm font-mono"
                />
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
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
