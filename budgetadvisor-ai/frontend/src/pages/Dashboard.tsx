import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { StatCard } from "@/components/StatCard";
import { CategoryPill } from "@/components/CategoryPill";
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
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Receipt, TrendingDown, Lightbulb, ArrowRight, Upload } from "lucide-react";
import { getReceipts } from "@/api/receipts";
import { useAuth } from "@/contexts/AuthContext";
import { filterByPeriod, computeDashboardStats } from "@/lib/analytics";
import type { ReceiptWithItems } from "@/api/types";

function currencySymbol(code: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", JPY: "¥" };
  return map[code] ?? code;
}

export default function Dashboard() {
  const { user } = useAuth();
  const sym = user?.preferred_currency ? currencySymbol(user.preferred_currency) : "£";

  const [allReceipts, setAllReceipts] = useState<ReceiptWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReceipts()
      .then(setAllReceipts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthlyReceipts = useMemo(() => filterByPeriod(allReceipts, "month"), [allReceipts]);
  const stats = useMemo(
    () => computeDashboardStats(monthlyReceipts, user?.monthly_budget ?? null),
    [monthlyReceipts, user?.monthly_budget]
  );
  const recentReceipts = useMemo(() => allReceipts.slice(0, 5), [allReceipts]);

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </p>
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
            <StatCard label="This Month" value={`${sym}${stats.this_month.toFixed(2)}`} />
            <StatCard
              label="Budget"
              value={`${sym}${stats.this_month.toFixed(2)}`}
              subValue={stats.budget ? `of ${sym}${stats.budget}` : "No budget set"}
            >
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min(stats.budget_percent, 100)}%` }}
                />
              </div>
            </StatCard>
            <StatCard label="Saved" value={`${sym}${stats.saved.toFixed(2)}`} subValue="in promotions">
              <TrendingDown className="size-4 text-success" />
            </StatCard>
            <StatCard label="Receipts" value={`${stats.receipt_count}`} subValue="this month">
              <Receipt className="size-4 text-muted-foreground" />
            </StatCard>
          </div>
        )}

        {/* Recent Receipts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Receipts</h2>
            <Button variant="link" size="sm" asChild>
              <Link to="/receipts">
                View All <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : recentReceipts.length === 0 ? (
            <EmptyState
              icon={Upload}
              title="No receipts yet"
              description="Upload your first receipt to start tracking your spending."
              actionLabel="Upload Receipt"
              actionHref="/receipts/upload"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead className="hidden sm:table-cell">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden md:table-cell">Categories</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReceipts.map((r) => {
                    const rsym = currencySymbol(r.currency);
                    const topCats = [...new Set(r.items.map((i) => i.category))].slice(0, 2);
                    return (
                      <TableRow key={r.id} className="group">
                        <TableCell className="tabular">
                          {r.transaction_date
                            ? (() => {
                                const d = new Date(r.transaction_date);
                                const isCurrentYear = d.getFullYear() === new Date().getFullYear();
                                return d.toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  ...(isCurrentYear ? {} : { year: "numeric" }),
                                });
                              })()
                            : "—"}
                        </TableCell>
                        <TableCell className="font-medium">{r.merchant_name_raw ?? "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {r.item_count ?? r.items.length} items
                        </TableCell>
                        <TableCell className="text-right tabular font-medium">
                          {r.total_amount != null ? `${rsym}${r.total_amount.toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex gap-1">
                            {topCats.map((c) => (
                              <CategoryPill key={c} category={c as never} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            size="sm"
                            asChild
                            className="md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          >
                            <Link to={`/receipts/${r.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* AI Insight */}
        <div className="glass-card p-6 border-l-4 border-l-accent">
          <div className="flex items-start gap-3">
            <Lightbulb className="size-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold mb-2">This week's insight</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review your spending patterns by category to identify savings opportunities.
              </p>
              <Button variant="link" size="sm" asChild className="mt-2 p-0 h-auto">
                <Link to="/analytics">
                  See full analytics <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
