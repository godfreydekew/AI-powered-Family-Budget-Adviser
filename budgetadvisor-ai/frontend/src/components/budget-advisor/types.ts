export interface AgentChart {
  type: "bar" | "line";
  title: string;
  currency?: string;
  data: Array<{ label: string; value: number }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  chart?: AgentChart | null;
  timestamp: Date;
}
