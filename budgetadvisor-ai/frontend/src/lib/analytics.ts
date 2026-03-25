/**
 * Pure functions that derive analytics from ReceiptWithItems[] data.
 * All computed client-side from receipts already loaded — no extra API calls.
 */
import type {
  CategoryBreakdownItem,
  DashboardStats,
  TopMerchant,
  WeeklyTrendItem,
  ReceiptWithItems,
} from "@/api/types";

export type AnalyticsPeriod = "week" | "month" | "last_month";

// ---------------------------------------------------------------------------
// Category display metadata — matches CATEGORIES in dummy-data.ts
// ---------------------------------------------------------------------------
const CATEGORY_META: Record<string, [string, string]> = {
  dairy:           ["Dairy",           "#6366F1"],
  meat:            ["Meat",            "#F43F5E"],
  fresh_produce:   ["Fresh Produce",   "#22C55E"],
  bakery:          ["Bakery",          "#F59E0B"],
  processed_foods: ["Processed Foods", "#8B5CF6"],
  household:       ["Household",       "#06B6D4"],
  personal_care:   ["Personal Care",   "#EC4899"],
  beverages:       ["Beverages",       "#14B8A6"],
  other:           ["Other",           "#94A3B8"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round(n: number, dp = 2): number {
  return Math.round(n * 10 ** dp) / 10 ** dp;
}

/**
 * Parse "2024-03-15" or "2024-03-15T10:30:00Z" → local midnight Date.
 * IMPORTANT: `new Date("YYYY-MM-DD")` is UTC midnight per spec, which causes
 * off-by-one errors when compared against local-midnight period bounds.
 * Parsing components manually creates a local date instead.
 */
function toDateOnly(s: string): Date {
  const [y, m, d] = s.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight — safe to compare with getPeriodBounds()
}

/** ISO week number */
function isoWeek(d: Date): number {
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Get the best available date for a receipt (transaction_date preferred) */
function receiptDate(r: ReceiptWithItems): Date | null {
  const s = r.transaction_date ?? r.created_at;
  return s ? toDateOnly(s) : null;
}

// ---------------------------------------------------------------------------
// Period filtering
// ---------------------------------------------------------------------------

export function getPeriodBounds(period: AnalyticsPeriod): [Date, Date] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    return [start, today];
  }
  if (period === "last_month") {
    const end = new Date(now.getFullYear(), now.getMonth(), 0); // last day prev month
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return [start, end];
  }
  // month (default)
  return [new Date(now.getFullYear(), now.getMonth(), 1), today];
}

export function filterByPeriod(
  receipts: ReceiptWithItems[],
  period: AnalyticsPeriod
): ReceiptWithItems[] {
  const [start, end] = getPeriodBounds(period);
  return receipts.filter((r) => {
    const d = receiptDate(r);
    if (!d) return false;
    return d >= start && d <= end;
  });
}

// ---------------------------------------------------------------------------
// Stat computations
// ---------------------------------------------------------------------------

export function computeDashboardStats(
  receipts: ReceiptWithItems[],
  monthlyBudget: number | null
): DashboardStats {
  const thisMonth = receipts.reduce((s, r) => s + (r.total_amount ?? 0), 0);
  const saved = receipts.reduce((s, r) => s + r.total_saved, 0);
  const budgetPercent =
    monthlyBudget && monthlyBudget > 0
      ? round((thisMonth / monthlyBudget) * 100, 1)
      : 0;
  return {
    this_month: round(thisMonth),
    budget: monthlyBudget,
    budget_percent: budgetPercent,
    saved: round(saved),
    receipt_count: receipts.length,
  };
}

export function computeCategoryBreakdown(
  receipts: ReceiptWithItems[]
): CategoryBreakdownItem[] {
  const totals: Record<string, number> = {};
  for (const r of receipts) {
    for (const item of r.items) {
      totals[item.category] = (totals[item.category] ?? 0) + (item.line_total ?? 0);
    }
  }
  const grand = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(totals)
    .filter(([, v]) => v > 0)
    .map(([key, amount]) => ({
      key,
      label: CATEGORY_META[key]?.[0] ?? key.replace(/_/g, " "),
      amount: round(amount),
      color: CATEGORY_META[key]?.[1] ?? "#94A3B8",
      percent: round((amount / grand) * 100, 1),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function computeWeeklyTrend(receipts: ReceiptWithItems[]): WeeklyTrendItem[] {
  const weekTotals: Record<string, number> = {};
  for (const r of receipts) {
    const d = receiptDate(r);
    if (!d) continue;
    const label = `W${isoWeek(d)}`;
    weekTotals[label] = (weekTotals[label] ?? 0) + (r.total_amount ?? 0);
  }

  // Build last-8-weeks ordered list (no duplicates)
  const today = new Date();
  const result: WeeklyTrendItem[] = [];
  const seen = new Set<string>();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 7);
    const label = `W${isoWeek(d)}`;
    if (!seen.has(label)) {
      seen.add(label);
      result.push({ week: label, amount: round(weekTotals[label] ?? 0) });
    }
  }
  return result;
}

export function computeTopMerchants(receipts: ReceiptWithItems[]): TopMerchant[] {
  const data: Record<string, { visits: number; total: number }> = {};
  for (const r of receipts) {
    const name = r.merchant_name_raw ?? "Unknown";
    if (!data[name]) data[name] = { visits: 0, total: 0 };
    data[name].visits += 1;
    data[name].total += r.total_amount ?? 0;
  }
  return Object.entries(data)
    .map(([name, d]) => ({
      name,
      visits: d.visits,
      total: round(d.total),
      avg: round(d.total / d.visits),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}
