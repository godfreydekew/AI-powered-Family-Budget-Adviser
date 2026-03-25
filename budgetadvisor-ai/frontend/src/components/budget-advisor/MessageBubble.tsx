import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AgentChart, ChatMessage } from "./types";

interface MessageBubbleProps {
  message: ChatMessage;
}

function InlineChart({ chart }: { chart: AgentChart }) {
  const symbol = chart.currency ?? "";

  return (
    <div className="mt-3 mb-1 not-prose">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {chart.title}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={chart.data}
          margin={{ top: 0, right: 4, left: -16, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${symbol}${v}`}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--secondary))" }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${symbol}${value.toFixed(2)}`, ""]}
          />
          <Bar
            dataKey="value"
            fill="hsl(var(--accent))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-accent text-accent-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Bot avatar */}
      <div className="shrink-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5 select-none">
        F
      </div>

      <div className="flex-1 min-w-0">
        {/* Markdown content */}
        <div className="text-sm text-foreground
          prose prose-sm dark:prose-invert max-w-none
          prose-p:my-1 prose-p:leading-relaxed
          prose-headings:font-semibold prose-headings:my-2 prose-headings:text-foreground
          prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
          prose-ul:my-1 prose-ul:pl-5 prose-li:my-0.5
          prose-ol:my-1 prose-ol:pl-5
          prose-strong:font-semibold prose-strong:text-foreground
          prose-code:text-xs prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-secondary prose-pre:rounded-lg prose-pre:p-3 prose-pre:text-xs prose-pre:overflow-x-auto prose-pre:my-2
          prose-table:text-xs prose-table:w-full prose-table:border-collapse
          prose-th:text-left prose-th:font-semibold prose-th:pb-1.5 prose-th:border-b prose-th:border-border
          prose-td:py-1.5 prose-td:border-b prose-td:border-border/40
          prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:pl-3 prose-blockquote:text-muted-foreground prose-blockquote:not-italic
          prose-hr:border-border prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        </div>

        {/* Inline chart */}
        {message.chart && <InlineChart chart={message.chart} />}

        <p className="text-[10px] text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
