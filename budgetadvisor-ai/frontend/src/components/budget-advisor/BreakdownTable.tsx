import type { BreakdownRow } from "./types";

interface BreakdownTableProps {
  data: BreakdownRow[];
}

export function BreakdownTable({ data }: BreakdownTableProps) {
  return (
    <table className="w-full mt-3 text-xs">
      <thead>
        <tr className="text-muted-foreground">
          <th className="text-left font-medium pb-1.5">Category</th>
          <th className="text-right font-medium pb-1.5">Amount</th>
          <th className="text-right font-medium pb-1.5">vs last</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.category} className="border-b border-border/50 last:border-0">
            <td className="py-1.5 text-foreground">{row.category}</td>
            <td className="py-1.5 text-right tabular font-medium text-foreground">
              £{row.amount.toFixed(2)}
            </td>
            <td
              className={`py-1.5 text-right tabular font-medium ${
                row.change <= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {row.change <= 0 ? "" : "+"}
              {row.change}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
