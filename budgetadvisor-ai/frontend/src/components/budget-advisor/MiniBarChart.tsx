import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ChartDataPoint } from "./types";

interface MiniBarChartProps {
  data: ChartDataPoint[];
  type?: "bar" | "grouped";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-lg px-3 py-1.5 text-xs shadow-finio-md">
      <p className="font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          £{p.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export function MiniBarChart({ data, type = "bar" }: MiniBarChartProps) {
  return (
    <div className="h-[120px] w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke="hsl(var(--border))" />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="value"
            fill="hsl(var(--accent))"
            radius={[4, 4, 0, 0]}
            name="This month"
          />
          {type === "grouped" && (
            <Bar
              dataKey="previousValue"
              fill="hsl(var(--muted-foreground) / 0.3)"
              radius={[4, 4, 0, 0]}
              name="Last month"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
