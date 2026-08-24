"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Wallet,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
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

interface BankAccount {
  id: string;
  method: "Bank Transfer" | "PayPal";
  bankName: string;
  accountHolder: string;
  last4: string;
  isPrimary: boolean;
}

interface PayoutHistoryItem {
  id: string;
  amount: number;
  method: string;
  accountLabel: string;
  date: string;
  status: "Processing" | "Completed" | "Failed";
}

interface PayoutsData {
  summary: { available: number; pending: number; totalPaidOut: number };
  bankAccounts: BankAccount[];
  payoutHistory: PayoutHistoryItem[];
}

const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusStyle: Record<string, string> = {
  Completed: "bg-green-100 text-green-700 border-green-200",
  Processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Failed: "bg-red-100 text-red-700 border-red-200",
};

const emptyForm = {
  method: "Bank Transfer" as "Bank Transfer" | "PayPal",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  routingNumber: "",
};

export default function PayoutsPage() {
  const [data, setData] = useState<PayoutsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [payoutAmount, setPayoutAmount] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/seller/payouts")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddAccount = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/seller/payouts/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Bank account added");
      setAddOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add account");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    const res = await fetch(`/api/seller/payouts/accounts/${id}/default`, {
      method: "PATCH",
    });
    if (!res.ok) {
      toast.error("Failed to update primary account");
      return;
    }
    load();
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/seller/payouts/accounts/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Failed to remove account");
      return;
    }
    load();
  };

  const handleRequestPayout = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/seller/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(payoutAmount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Payout ${json.payoutId} requested`);
      setPayoutOpen(false);
      setPayoutAmount("");
      load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to request payout",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const primary = data.bankAccounts.find((a) => a.isPrimary);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Bank Account
        </Button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
            <p className="text-3xl font-bold">
              {money(data.summary.available)}
            </p>
            <p className="text-xs text-green-200 mt-1">Ready to withdraw</p>
            <Button
              size="sm"
              disabled={!primary || data.summary.available <= 0}
              onClick={() => {
                setPayoutAmount(data.summary.available.toFixed(2));
                setPayoutOpen(true);
              }}
              className="mt-4 bg-white text-green-700 hover:bg-green-50 text-sm font-semibold w-full disabled:opacity-60"
            >
              Request Payout
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {money(data.summary.pending)}
            </p>
            <p className="text-xs text-gray-400 mt-1">In fulfillment</p>
          </CardContent>
        </Card>

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
            <p className="text-3xl font-bold text-gray-900">
              {money(data.summary.totalPaidOut)}
            </p>
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
          {data.bankAccounts.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">
              No bank accounts yet — add one to request payouts.
            </p>
          )}
          {data.bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                acc.isPrimary
                  ? "border-green-300 bg-green-50/50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {acc.bankName}
                  </p>
                  {acc.isPrimary && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px] font-semibold">
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {acc.method === "PayPal" ? acc.last4 : `****${acc.last4}`} ·{" "}
                  {acc.method}
                </p>
              </div>
              {!acc.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(acc.id)}
                  className="text-xs text-green-600 hover:underline font-medium"
                >
                  Set Primary
                </button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemove(acc.id)}
                disabled={acc.isPrimary}
                className="text-xs border-red-200 text-red-500 hover:bg-red-50 h-7 px-3 disabled:opacity-40"
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
                {data.payoutHistory.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-6 text-center text-xs text-gray-400"
                    >
                      No payouts yet.
                    </td>
                  </tr>
                )}
                {data.payoutHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-green-600">
                      {p.id}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      {money(p.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {p.method}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {p.accountLabel}
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

      {/* Add bank account dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="flex gap-2">
              {(["Bank Transfer", "PayPal"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, method: m })}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg border ${
                    form.method === m
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {form.method === "PayPal" ? "PayPal Name" : "Bank Name"}
              </Label>
              <Input
                placeholder={form.method === "PayPal" ? "PayPal" : "Chase Bank"}
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Account Holder</Label>
              <Input
                placeholder="John Doe"
                value={form.accountHolder}
                onChange={(e) =>
                  setForm({ ...form, accountHolder: e.target.value })
                }
                className="h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {form.method === "PayPal" ? "PayPal Email" : "Account Number"}
                </Label>
                <Input
                  placeholder={
                    form.method === "PayPal" ? "john@email.com" : "****4242"
                  }
                  value={form.accountNumber}
                  onChange={(e) =>
                    setForm({ ...form, accountNumber: e.target.value })
                  }
                  className="h-9 text-sm font-mono"
                />
              </div>
              {form.method === "Bank Transfer" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Routing Number</Label>
                  <Input
                    placeholder="021000021"
                    value={form.routingNumber}
                    onChange={(e) =>
                      setForm({ ...form, routingNumber: e.target.value })
                    }
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddAccount}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Add
              Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request payout dialog */}
      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label className="text-xs font-medium">Amount</Label>
            <Input
              type="number"
              min={10}
              max={data.summary.available}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="h-9 text-sm"
            />
            <p className="text-xs text-gray-400">
              Available: {money(data.summary.available)} · Min $10
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPayoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRequestPayout}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{" "}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
