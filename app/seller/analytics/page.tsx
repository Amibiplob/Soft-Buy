import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    label: "Total Sales",
    value: "$8,240",
    change: "+15.2%",
    icon: DollarSign,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Total Orders",
    value: "128",
    change: "+10.1%",
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Visitors",
    value: "2,356",
    change: "+18.7%",
    icon: Users,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Conversion Rate",
    value: "3.42%",
    change: "+5.4%",
    icon: BarChart2,
    color: "bg-orange-50 text-orange-600",
  },
];

const categories = [
  { name: "Electronics", pct: 45, amount: "$3,708", color: "#3b82f6" },
  { name: "Fashion", pct: 30, amount: "$1,472", color: "#8b5cf6" },
  { name: "Home Living", pct: 15, amount: "$1,236", color: "#f59e0b" },
  { name: "Others", pct: 10, amount: "$824", color: "#6b7280" },
];

const countries = [
  { flag: "🇺🇸", name: "United States", amount: "$4,230" },
  { flag: "🇨🇦", name: "Canada", amount: "$1,230" },
  { flag: "🇬🇧", name: "United Kingdom", amount: "$980" },
  { flag: "🇦🇺", name: "Australia", amount: "$790" },
  { flag: "🌐", name: "Others", amount: "$1,000" },
];

// Line chart SVG
function LineChart() {
  const datasets = [
    {
      pts: [
        [0, 65],
        [40, 50],
        [80, 60],
        [120, 35],
        [160, 25],
        [200, 40],
        [240, 15],
      ],
      color: "#22c55e",
      fill: "#22c55e22",
    },
  ];
  return (
    <svg
      viewBox="0 0 260 100"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      {datasets.map((ds, di) => {
        const d = ds.pts
          .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
          .join(" ");
        const area = `${d} L${ds.pts[ds.pts.length - 1][0]},100 L0,100 Z`;
        return (
          <g key={di}>
            <path d={area} fill={ds.fill} />
            <path
              d={d}
              fill="none"
              stroke={ds.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      {/* Grid lines */}
      {[20, 40, 60, 80].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="260"
          y2={y}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

// Donut chart SVG
function DonutChart() {
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
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        className="text-xs"
        fontSize="10"
        fill="#374151"
        fontWeight="600"
      >
        $8,240
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#9ca3af">
        Total Sales
      </text>
    </svg>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hidden sm:block">
          May 15 – 21, 2025
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
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
                  <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {change}
                  </div>
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

      {/* Sales Chart */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Sales Overview
          </CardTitle>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            Last 7 Days
          </span>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <LineChart />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            {[
              "May 15",
              "May 16",
              "May 17",
              "May 18",
              "May 19",
              "May 20",
              "May 21",
            ].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category + Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales by Category */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 shrink-0">
                <DonutChart />
              </div>
              <div className="space-y-2.5 flex-1">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: cat.color }}
                    />
                    <span className="text-xs text-gray-600 flex-1">
                      {cat.name}
                    </span>
                    <span className="text-xs font-semibold text-gray-800">
                      {cat.pct}%
                    </span>
                    <span className="text-xs text-gray-400">{cat.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {countries.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {c.name}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {c.amount}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(parseInt(c.amount.replace(/\D/g, "")) / 4230) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
