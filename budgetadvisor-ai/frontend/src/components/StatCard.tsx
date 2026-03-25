import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: { value: string; positive: boolean };
  children?: ReactNode;
}

export function StatCard({ label, value, subValue, change, children }: StatCardProps) {
  return (
    <div className="glass-card p-4 sm:p-5 space-y-2">
      <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-lg sm:text-2xl font-semibold tabular">{value}</p>
          {subValue && <p className="text-sm text-muted-foreground mt-0.5">{subValue}</p>}
        </div>
        {change && (
          <span className={`text-sm font-medium tabular ${change.positive ? "text-success" : "text-destructive"}`}>
            {change.value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
