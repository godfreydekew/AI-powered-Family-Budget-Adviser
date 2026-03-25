import { AdminLayout } from "@/components/layouts/AdminLayout";
import { StatCard } from "@/components/StatCard";
import { useEffect, useState } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { getAdminStats, getAdminLogs, getReceiptsPerDay } from "@/api/admin";
import type { AdminStats, OcrLogPublic, ReceiptsPerDayItem } from "@/api/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<OcrLogPublic[]>([]);
  const [perDay, setPerDay] = useState<ReceiptsPerDayItem[]>([]);

  useEffect(() => {
    getAdminStats().then(setStats).catch(console.error);
    getAdminLogs(0, 5).then((r) => setLogs(r.data)).catch(console.error);
    getReceiptsPerDay().then(setPerDay).catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={(stats?.total_users ?? 0).toLocaleString()} />
          <StatCard label="Receipts Today" value={(stats?.receipts_today ?? 0).toString()} />
          <StatCard label="Failed Scans" value={(stats?.failed_scans ?? 0).toString()} />
          <StatCard label="Active Users (7d)" value={(stats?.active_users_7d ?? 0).toLocaleString()} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-4">Recent Processing Logs</h2>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No logs yet</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full ${log.status === "success" ? "bg-success" : log.status === "failed" ? "bg-destructive" : "bg-warning"}`} />
                      <div>
                        <p className="text-sm font-medium">{log.user_email ?? "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{log.scan_method} · {log.llm_model_used ?? "—"} · {log.processing_ms ?? "—"}ms</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground tabular">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-4">Receipts per Day</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={perDay}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
