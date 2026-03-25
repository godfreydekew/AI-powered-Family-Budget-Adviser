interface DonutChartProps {
  data: { label: string; amount: number; color: string }[];
  size?: number;
  currencySymbol?: string;
}

export function DonutChart({ data, size = 200, currencySymbol = "£" }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="stroke-secondary"
          strokeWidth={strokeWidth}
        />
        {data.map((d) => {
          const pct = d.amount / total;
          const offset = circumference * (1 - pct);
          const rotation = (cumulative / total) * 360 - 90;
          cumulative += d.amount;

          return (
            <circle
              key={d.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${center} ${center})`}
              className="transition-all duration-500"
            />
          );
        })}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="fill-foreground text-2xl font-semibold"
          style={{ fontSize: 24 }}
        >
          {currencySymbol}{total.toFixed(2)}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 12 }}
        >
          total
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            {d.label} {currencySymbol}{d.amount.toFixed(2)}
          </span>
        ))}
      </div>
    </div>
  );
}
