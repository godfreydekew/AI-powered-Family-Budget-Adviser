import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { CategoryPill } from "@/components/CategoryPill";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteReceipt } from "@/api/receipts";
import { useReceipt } from "@/hooks/use-receipts";
import { getApiErrorMessage } from "@/api/errors";
import type { ReceiptItemPublic } from "@/api/types";

function currencySymbol(code: string): string {
  const map: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", JPY: "¥" };
  return map[code] ?? code;
}

function isFlagged(item: ReceiptItemPublic): boolean {
  return item.category === "other" || item.line_total == null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-GB");
}

export default function ReceiptDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const { data: receipt, isLoading: loading, error: queryError } = useReceipt(id);
  const error = queryError ? getApiErrorMessage(queryError) : null;

  const deleteMutation = useMutation({
    mutationFn: deleteReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      navigate("/receipts", { replace: true });
    },
  });

  const handleDelete = () => {
    if (!receipt) return;
    if (!window.confirm("Delete this receipt? This action cannot be undone.")) return;
    deleteMutation.mutate(receipt.id);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-24 text-muted-foreground text-sm">Loading…</div>
      </AuthenticatedLayout>
    );
  }

  if (error || !receipt) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-24">
          <p className="text-muted-foreground">{error ?? "Receipt not found."}</p>
          <Button variant="link" asChild className="mt-2">
            <Link to="/receipts">Back to receipts</Link>
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const sym = currencySymbol(receipt.currency);
  const flaggedCount = receipt.items.filter(isFlagged).length;

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header — stacks on mobile */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/receipts"><ArrowLeft className="size-5" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{receipt.merchant_name_raw ?? "Receipt"}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{formatDate(receipt.transaction_date)}</p>
            </div>
          </div>
          <div className="text-right sm:text-right w-full sm:w-auto">
            <p className="text-3xl font-semibold tabular">
              {receipt.total_amount != null ? `${sym}${receipt.total_amount.toFixed(2)}` : "—"}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {receipt.scan_method}
            </span>
            <div className="mt-3">
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="size-4" />
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>

        {receipt.total_saved > 0 && (
          <div className="bg-success/10 text-success rounded-2xl px-6 py-4 flex items-center gap-3">
            <span className="text-lg">🎉</span>
            <p className="text-sm font-medium">You saved {sym}{receipt.total_saved.toFixed(2)} on this shop</p>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden sm:table-cell">Promo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipt.items.map((item) => (
                <TableRow key={item.id} className={isFlagged(item) ? "border-l-2 border-l-warning bg-warning/5" : ""}>
                  <TableCell>
                    <p className="font-medium">{item.clean_description ?? item.raw_description}</p>
                    {isFlagged(item) && (
                      <span className="inline-flex items-center gap-1 text-xs text-warning mt-0.5">
                        <AlertTriangle className="size-3" /> Flagged
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <CategoryPill category={item.category as never} />
                  </TableCell>
                  <TableCell className="text-center tabular">{item.quantity}</TableCell>
                  <TableCell className="text-right tabular">
                    {item.unit_price != null ? `${sym}${item.unit_price.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {item.line_total != null ? `${sym}${item.line_total.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.on_promotion && (
                      <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full tabular">
                        -{sym}{(item.promotion_saving ?? 0).toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="glass-card p-6 text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="size-4" /> Scanned {formatDateTime(receipt.scanned_at)}
          </div>
          <p>
            Currency: {receipt.currency} · Method: {receipt.scan_method} ·{" "}
            {flaggedCount > 0 ? `${flaggedCount} flagged item(s)` : "No flagged items"}
          </p>
        </div>

        {deleteMutation.isError && (
          <div className="text-sm text-destructive">{getApiErrorMessage(deleteMutation.error)}</div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
