import {
  TrendingUp,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const transactions = [
  {
    id: "TXN001",
    desc: "Order #SB10012 – Wireless Headphones",
    date: "May 15, 2025",
    amount: "+$59.99",
    type: "credit",
  },
  {
    id: "TXN002",
    desc: "Order #SB10011 – Smart Watch",
    date: "May 14, 2025",
    amount: "+$89.99",
    type: "credit",
  },
  {
    id: "TXN003",
    desc: "Payout to Bank ****4242",
    date: "May 13, 2025",
    amount: "-$500.00",
    type: "debit",
  },
  {
    id: "TXN004",
    desc: "Order #SB10010 – Running Shoes",
    date: "May 12, 2025",
    amount: "+$60.99",
    type: "credit",
  },
  {
    id: "TXN005",
    desc: "Platform fee",
    date: "May 12, 2025",
    amount: "-$12.50",
    type: "debit",
  },
  {
    id: "TXN006",
    desc: "Order #SB10009 – Travel Backpack",
    date: "May 11, 2025",
    amount: "+$39.99",
    type: "credit",
  },
];

function EarningsChart() {
  const bars = [40, 65, 50, 80, 70, 90, 60];
  return (
    <div className="flex items-end gap-1.5 h-24">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all hover:opacity-80"
            style={{
              height: `${h}%`,
              background: i === 5 ? "#16a34a" : "#bbf7d0",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function EarningsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Earnings",
            value: "$8,240",
            sub: "All time",
            icon: DollarSign,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "This Month",
            value: "$2,140",
            sub: "May 2025",
            icon: TrendingUp,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Available",
            value: "$1,340",
            sub: "Ready to payout",
            icon: Wallet,
            color: "bg-purple-50 text-purple-600",
          },
          {
            label: "Pending",
            value: "$800",
            sub: "Processing",
            icon: ArrowDownLeft,
            color: "bg-orange-50 text-orange-600",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
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
            <EarningsChart />
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
              <p className="text-3xl font-bold text-gray-900 mt-1">$1,340</p>
              <p className="text-xs text-gray-400 mt-1">Min. payout: $50</p>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 text-sm">
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
                {transactions.map((t) => (
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
                      className={`px-5 py-3.5 font-bold whitespace-nowrap ${t.type === "credit" ? "text-green-600" : "text-red-500"}`}
                    >
                      {t.amount}
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
