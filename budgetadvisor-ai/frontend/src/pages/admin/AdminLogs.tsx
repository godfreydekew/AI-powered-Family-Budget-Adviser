import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useEffect, useState } from "react";
import { getAdminLogs } from "@/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OcrLogPublic } from "@/api/types";

export default function AdminLogs() {
  const [logs, setLogs] = useState<OcrLogPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminLogs().then((r) => setLogs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Processing Logs</h1>
        <div className="glass-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Time</TableHead>
                <TableHead className="text-center">Flagged</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading logs…</TableCell></TableRow>
              ) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No processing logs yet.</TableCell></TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.id.slice(0, 8)}…</TableCell>
                    <TableCell className="font-medium">{log.user_email ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{log.scan_method}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${log.status === "success" ? "text-success" : log.status === "failed" ? "text-destructive" : "text-warning"}`}>
                        <span className={`size-1.5 rounded-full ${log.status === "success" ? "bg-success" : log.status === "failed" ? "bg-destructive" : "bg-warning"}`} />
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{log.llm_model_used ?? "—"}</TableCell>
                    <TableCell className="text-right tabular">{log.processing_ms != null ? `${log.processing_ms}ms` : "—"}</TableCell>
                    <TableCell className="text-center tabular">{log.flagged_items_count}</TableCell>
                    <TableCell className="tabular text-muted-foreground">{log.created_at ? new Date(log.created_at).toLocaleString("en-GB") : "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
