"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  BarChart2,
  Users,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Stat {
  key: "sales" | "orders" | "aov" | "customers";
  value: number;
  change: number | null;
}

interface TrendPoint {
  date: string;
  sales: number;
}

interface CategoryRow {
  name: string;
  amount: number;
  pct: number;
  color: string;
}

interface CountryRow {
  code: string;
  amount: number;
  pct: number;
}

interface AnalyticsResponse {
  days: number;
  stats: Stat[];
  trend: TrendPoint[];
  categories: CategoryRow[];
  countries: CountryRow[];
}

const STAT_CONFIG: Record
  Stat["key"],
  { label: string; icon: typeof DollarSign; color: string; currency: boolean }
> = {
  sales: { label: "Total Sales", icon: DollarSign, color: "bg-green-50 text-green-600", currency: true },
  orders: { label: "Total Orders", icon: ShoppingBag, color: "bg-blue-50 text-blue-600", currency: false },
  aov: { label: "Avg Order Value", icon: BarChart2, color: "bg-orange-50 text-orange-600", currency: true },
  customers: { label: "Customers", icon: Users, color: "bg-purple-50 text-purple-600", currency: false },
};

const COUNTRY_META: Record<string, { flag: string; name: string }> = {
  us: { flag: "🇺🇸", name: "United States" },
  bd: { flag: "🇧🇩", name: "Bangladesh" },
  uk: { flag: "🇬🇧", name: "United Kingdom" },
  ca: { flag: "🇨🇦", name: "Canada" },
  au: { flag: "🇦🇺", name: "Australia" },
  unknown: { flag: "🌐", name: "Unknown" },
  others: { flag: "🌐", name: "Others" },
};

const RANGE_OPTIONS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

function LineChart({ trend }: { trend: TrendPoint[] }) {
  const maxSales = Math.max(1, ...trend.map((t) => t.sales));
  const points = trend.map((t, i) => {
    const x = trend.length > 1 ? (i / (trend.length - 1)) * 260 : 130;
    const y = 90 - (t.sales / maxSales) * 80;
    return [x, y] as const;
  });
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = points.length
    ? `${d} L${points[points.length - 1][0]},100 L0,100 Z`
    : "";

  return (
    <svg viewBox="0 0 260 100" className="w-full h-full" preserveAspectRatio="none">
      {[20, 40, 60, 80].map((y) => (
        <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="#f1f5f9" strokeWidth="1" />
      ))}
      {points.length > 0 && (
        <>
          <path d={area} fill="#22c55e22" />
          <path d={d} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

function DonutChart({ categories, total }: { categories: CategoryRow[]; total: number }) {
  const r = 36;
  const cx = 55;
  const cy = 55;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 110 110" className="w-full h-full">
      {categories.map((cat) => {
        const dash = (cat.pct / 100) * circ;
        const el = (
          <circle
            key={cat.name}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={cat.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">
        {currency(total)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#9ca3af">
        Total Sales
      </text>
    </svg>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (range: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seller/analytics?days=${range}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load analytics");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days, fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats ?? [];
  const trend = data?.trend ?? [];
  const categories = data?.categories ?? [];
  const countries = data?.countries ?? [];
  const totalSales = stats.find((s) => s.key === "sales")?.value ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.days}
              size="sm"
              variant={days === opt.days ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setDays(opt.days)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const cfg = STAT_CONFIG[s.key];
          const Icon = cfg.icon;
          const value = cfg.currency ? currency(s.value) : s.value.toLocaleString();
          return (
            <Card key={s.key} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{cfg.label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                    {s.change !== null && (
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
                          s.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {s.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {s.change >= 0 ? "+" : ""}
                        {s.change.toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sales Chart */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Sales Overview</CardTitle>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            Last {days} Days
          </span>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <LineChart trend={trend} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            {trend
              .filter((_, i) => i % Math.max(1, Math.ceil(trend.length / 7)) === 0)
              .map((t) => (
                <span key={t.date}>
                  {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Category + Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No sales in this period yet.</p>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 shrink-0">
                  <DonutChart categories={categories} total={totalSales} />
                </div>
                <div className="space-y-2.5 flex-1">
                  {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-xs text-gray-600 flex-1">{cat.name}</span>
                      <span className="text-xs font-semibold text-gray-800">{cat.pct}%</span>
                      <span className="text-xs text-gray-400">{currency(cat.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {countries.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No orders in this period yet.</p>
            ) : (
              <div className="space-y-3">
                {countries.map((c) => {
                  const meta = COUNTRY_META[c.code] ?? { flag: "🌐", name: c.code };
                  return (
                    <div key={c.code} className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{meta.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{meta.name}</span>
                          <span className="text-sm font-bold text-green-600">{currency(c.amount)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}