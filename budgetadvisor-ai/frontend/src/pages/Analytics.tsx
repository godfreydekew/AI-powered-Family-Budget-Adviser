import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { StatCard } from "@/components/StatCard";
import { DonutChart } from "@/components/DonutChart";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getReceipts } from "@/api/receipts";
import {
  filterByPeriod,
  computeDashboardStats,
  computeCategoryBreakdown,
  computeWeeklyTrend,
  computeTopMerchants,
} from "@/lib/analytics";
import type { AnalyticsPeriod } from "@/lib/analytics";
import type { ReceiptWithItems } from "@/api/types";
import { useAuth } from "@/contexts/AuthContext";

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "last_month" },
];

function currencySymbol(code: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", JPY: "¥" };
  return map[code] ?? code;
}

export default function Analytics() {
  const { user } = useAuth();
  const sym = user?.preferred_currency ? currencySymbol(user.preferred_currency) : "£";

  const [period, setPeriod] = useState<AnalyticsPeriod>("month");
  const [allReceipts, setAllReceipts] = useState<ReceiptWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReceipts()
      .then(setAllReceipts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => filterByPeriod(allReceipts, period), [allReceipts, period]);
  const stats = useMemo(
    () => computeDashboardStats(filtered, user?.monthly_budget ?? null),
    [filtered, user?.monthly_budget]
  );
  const categories = useMemo(() => computeCategoryBreakdown(filtered), [filtered]);
  const merchants = useMemo(() => computeTopMerchants(filtered), [filtered]);
  const trend = useMemo(() => computeWeeklyTrend(allReceipts), [allReceipts]);

  const avgPerReceipt = stats.receipt_count > 0 ? stats.this_month / stats.receipt_count : 0;

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p.value
                    ? "bg-card shadow-finio-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-5 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Spent" value={`${sym}${stats.this_month.toFixed(2)}`} />
            <StatCard label="Receipts" value={`${stats.receipt_count}`} />
            <StatCard label="Avg per Receipt" value={`${sym}${avgPerReceipt.toFixed(2)}`} />
            <StatCard label="Total Saved" value={`${sym}${stats.saved.toFixed(2)}`} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category donut */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-6">Category Breakdown</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Skeleton className="size-48 rounded-full" />
              </div>
            ) : categories.length > 0 ? (
              <>
                <DonutChart data={categories} size={240} currencySymbol={sym} />
                <div className="mt-6 space-y-2">
                  {categories.map((c) => (
                    <div key={c.key} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span>{c.label}</span>
                      </div>
                      <div className="flex items-center gap-4 tabular">
                        <span className="font-medium">
                          {sym}
                          {c.amount.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground w-12 text-right">{c.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No data yet"
                description="Upload receipts to see your category breakdown."
              />
            )}
          </div>

          {/* Top merchants */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-6">Top Merchants</h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </div>
                ))}
              </div>
            ) : merchants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead className="text-center">Visits</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Avg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((m) => (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-center tabular">{m.visits}</TableCell>
                      <TableCell className="text-right tabular">
                        {sym}
                        {m.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right tabular text-muted-foreground">
                        {sym}
                        {m.avg.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No merchants yet"
                description="Your top merchants will appear here once you upload receipts."
              />
            )}
          </div>
        </div>

        {/* Weekly trend */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-6">Weekly Trend</h2>
          {loading ? (
            <Skeleton className="w-full h-[280px] rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(v) => `${sym}${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [`${sym}${value}`, "Spent"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#analyticsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
