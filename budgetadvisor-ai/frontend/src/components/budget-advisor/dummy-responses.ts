import type { ChatMessage } from "./types";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function getDummyResponse(userText: string): Omit<ChatMessage, "id" | "timestamp"> {
  const t = userText.toLowerCase();

  if (t.includes("this month") || t.includes("how much")) {
    return {
      role: "assistant",
      text: "You've spent £342 this month, which is 32% under your £500 budget. You're on track with 10 days to go.",
      chartType: "bar",
      chart: [
        { label: "Week 1", value: 89 },
        { label: "Week 2", value: 94 },
        { label: "Week 3", value: 112 },
        { label: "Week 4", value: 47 },
      ],
      breakdown: [
        { category: "Dairy", amount: 68, change: 8 },
        { category: "Meat", amount: 82, change: -3 },
        { category: "Fresh Produce", amount: 54, change: 12 },
        { category: "Bakery", amount: 31, change: -5 },
        { category: "Processed Foods", amount: 47, change: 18 },
        { category: "Household", amount: 38, change: -2 },
        { category: "Personal Care", amount: 22, change: 4 },
      ],
    };
  }

  if (t.includes("compare") || t.includes("last month")) {
    return {
      role: "assistant",
      text: "This month is tracking better than last month. You're £58 under last month's total with a week still to go.",
      chartType: "grouped",
      chart: [
        { label: "Week 1", value: 89, previousValue: 102 },
        { label: "Week 2", value: 94, previousValue: 98 },
        { label: "Week 3", value: 112, previousValue: 118 },
        { label: "Week 4", value: 47, previousValue: 82 },
      ],
    };
  }

  if (t.includes("top categories") || t.includes("categories")) {
    return {
      role: "assistant",
      text: "Meat is your biggest category at 24% of spending this month, followed by dairy at 20%. Both are within your normal range.",
      breakdown: [
        { category: "Meat", amount: 82, change: -3 },
        { category: "Dairy", amount: 68, change: 8 },
        { category: "Fresh Produce", amount: 54, change: 12 },
        { category: "Processed Foods", amount: 47, change: 18 },
        { category: "Household", amount: 38, change: -2 },
        { category: "Bakery", amount: 31, change: -5 },
        { category: "Personal Care", amount: 22, change: 4 },
        { category: "Beverages", amount: 18, change: -1 },
        { category: "Snacks", amount: 12, change: 6 },
      ],
    };
  }

  if (t.includes("unusual") || t.includes("anomaly")) {
    return {
      role: "assistant",
      text: "One shop stands out — a £67 Waitrose visit on the 8th, which is about twice your usual shop size. Everything else looks consistent with your normal pattern.",
    };
  }

  if (t.includes("groceries") || t.includes("higher")) {
    return {
      role: "assistant",
      text: "Your grocery spend is up £24 compared to last month. Looking at your receipts, this appears to be more frequent smaller shops — 8 visits this month versus 5 last month — rather than price increases on the items themselves.",
    };
  }

  return {
    role: "assistant",
    text: "I can help you understand your spending. Try asking about this month's total, how your categories break down, or whether anything looks unusual.",
  };
}
