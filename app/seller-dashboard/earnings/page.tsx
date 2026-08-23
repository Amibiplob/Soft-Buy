"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EarningsData {
  summary: {
    totalEarnings: number;
    monthEarnings: number;
    available: number;
    pending: number;
  };
  weeklyTrend: number[];
  transactions: {
    id: string;
    desc: string;
    date: string;
    amount: number;
    type: "credit" | "debit";
  }[];
}

const money = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function EarningsChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all hover:opacity-80"
            style={{
              height: `${Math.max(4, (v / max) * 100)}%`,
              background: i === data.length - 1 ? "#16a34a" : "#bbf7d0",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    let active = true;
    fetch("/api/seller/earnings")
      .then((res) => res.json())
      .then((json) => {
        if (active) setData(json);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const summaryCards = [
    {
      label: "Total Earnings",
      value: money(data.summary.totalEarnings),
      sub: "All time",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "This Month",
      value: money(data.summary.monthEarnings),
      sub: monthLabel,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Available",
      value: money(data.summary.available),
      sub: "Ready to payout",
      icon: Wallet,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Pending",
      value: money(data.summary.pending),
      sub: "In fulfillment",
      icon: ArrowDownLeft,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, sub, icon: Icon, color }) => (
          <Card
            key={label}
            className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Payout CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Weekly Earnings
            </CardTitle>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              Last 7 Days
            </span>
          </CardHeader>
          <CardContent>
            <EarningsChart data={data.weeklyTrend} />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-4 h-full">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Available Balance
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {money(data.summary.available)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Min. payout: $50</p>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-sm"
              onClick={() => toast("Payouts aren't set up yet — coming soon.")}
            >
              <ArrowUpRight className="w-4 h-4" /> Request Payout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Transaction", "Description", "Date", "Amount", "Type"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-6 text-center text-xs text-gray-400"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                )}
                {data.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                      {t.id}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 max-w-xs truncate">
                      {t.desc}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {t.date}
                    </td>
                    <td
                      className={`px-5 py-3.5 font-bold whitespace-nowrap ${
                        t.type === "credit" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {t.type === "credit" ? "+" : "-"}
                      {money(t.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={
                          t.type === "credit"
                            ? "bg-green-100 text-green-700 border-green-200 text-xs"
                            : "bg-red-100 text-red-600 border-red-200 text-xs"
                        }
                      >
                        {t.type === "credit" ? (
                          <ArrowDownLeft className="w-3 h-3 mr-1 inline" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 mr-1 inline" />
                        )}
                        {t.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
