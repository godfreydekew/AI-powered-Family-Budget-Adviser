import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { CategoryPill } from "@/components/CategoryPill";
import { CATEGORIES } from "@/data/dummy-data";
import { Link } from "react-router-dom";
import { Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReceipts } from "@/hooks/use-receipts";
import { deleteReceipt } from "@/api/receipts";
import { getApiErrorMessage } from "@/api/errors";
import type { ReceiptItemPublic } from "@/api/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function currencySymbol(code: string): string {
  const map: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    JPY: "¥",
  };
  return map[code] ?? code;
}

function topCategories(items: ReceiptItemPublic[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([cat]) => cat);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReceiptsList() {
  const queryClient = useQueryClient();
  const {
    data: receipts = [],
    isLoading: loading,
    error: queryError,
  } = useReceipts();
  const error = queryError ? getApiErrorMessage(queryError) : null;
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const deleteMutation = useMutation({
    mutationFn: deleteReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });

  const handleDelete = (receiptId: string) => {
    if (!window.confirm("Delete this receipt? This action cannot be undone."))
      return;
    deleteMutation.mutate(receiptId);
  };

  const filtered = receipts.filter((r) => {
    const merchantName = r.merchant_name_raw ?? "";
    if (search && !merchantName.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (categoryFilter.length > 0) {
      const cats = topCategories(r.items);
      if (!cats.some((c) => categoryFilter.includes(c))) return false;
    }
    return true;
  });

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Receipts</h1>
          <Button asChild>
            <Link to="/receipts/upload">Upload New</Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search merchant…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 overflow-x-auto scrollbar-hide">
            {CATEGORIES.slice(0, 7).map((c) => (
              <Button
                key={c.key}
                variant={
                  categoryFilter.includes(c.key) ? "default" : "secondary"
                }
                size="sm"
                className="rounded-full text-xs h-7"
                onClick={() =>
                  setCategoryFilter((prev) =>
                    prev.includes(c.key)
                      ? prev.filter((k) => k !== c.key)
                      : [...prev, c.key],
                  )
                }
              >
                {c.label}
              </Button>
            ))}
            {(search || categoryFilter.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs h-7 text-destructive"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter([]);
                }}
              >
                <X className="size-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Loading receipts…
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && receipts.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">No receipts yet.</p>
            <Button asChild>
              <Link to="/receipts/upload">Upload your first receipt</Link>
            </Button>
          </div>
        )}

        {/* Desktop table */}
        {!loading && filtered.length > 0 && (
          <div className="hidden md:block glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const sym = currencySymbol(r.currency);
                  const cats = topCategories(r.items);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium">
                          {r.merchant_name_raw ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="tabular">
                        {formatDate(r.transaction_date)}
                      </TableCell>
                      <TableCell className="tabular font-medium">
                        {r.total_amount != null
                          ? `${sym}${r.total_amount.toFixed(2)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.item_count ?? r.items.length}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {cats.slice(0, 2).map((c) => (
                            <CategoryPill key={c} category={c} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.total_saved > 0 && (
                          <span className="text-xs font-medium text-success tabular">
                            -{sym}
                            {r.total_saved.toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="link" size="sm" asChild>
                            <Link to={`/receipts/${r.id}`}>View</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(r.id)}
                            disabled={deleteMutation.isPending}
                            aria-label="Delete receipt"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Mobile cards */}
        {!loading && filtered.length > 0 && (
          <div className="md:hidden space-y-3">
            {filtered.map((r) => {
              const sym = currencySymbol(r.currency);
              const cats = topCategories(r.items);
              return (
                <Link
                  key={r.id}
                  to={`/receipts/${r.id}`}
                  className="glass-card p-4 block space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{r.merchant_name_raw ?? "—"}</p>
                    <p className="font-semibold tabular">
                      {r.total_amount != null
                        ? `${sym}${r.total_amount.toFixed(2)}`
                        : "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground tabular">
                      {formatDate(r.transaction_date)} ·{" "}
                      {r.item_count ?? r.items.length} items
                    </p>
                    <div className="flex gap-1">
                      {cats.slice(0, 2).map((c) => (
                        <CategoryPill key={c} category={c} />
                      ))}
                    </div>
                  </div>
                  {r.total_saved > 0 && (
                    <p className="text-xs font-medium text-success">
                      Saved {sym}
                      {r.total_saved.toFixed(2)}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {deleteMutation.isError && (
          <div className="text-center text-sm text-destructive">
            {getApiErrorMessage(deleteMutation.error)}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
