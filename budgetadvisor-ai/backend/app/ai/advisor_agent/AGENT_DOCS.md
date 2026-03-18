# Budget Advisor Agent — Documentation

## Overview

The Budget Advisor is a conversational AI agent that answers questions about a user's personal
finances using their real receipt and spending data. It operates in a tool-calling loop:

1. The user sends a message.
2. The agent decides which tool(s) to call to fetch data.
3. Tools query the database and return structured results.
4. The agent synthesises a natural-language response (with an optional chart).
5. Steps 2–4 repeat until the agent has all the information it needs, then it replies.

The agent **never guesses or invents numbers** — every figure in a response comes directly from a
tool result.

---

## Architecture

```
User message
    │
    ▼
runner.run_agent()          ← orchestrates the loop
    │
    ├─► OpenAI Responses API (with tool schemas injected)
    │       │
    │       └─► function_call items  ─►  TOOL_REGISTRY[name](**args)
    │               │                         │
    │               └──────────── result ◄────┘
    │
    └─► {text: str, chart: dict | None}   ← returned to the FastAPI route
```

The route (`POST /advisor/chat`) injects `user_id` and today's date into the agent context so the
model always has accurate temporal and user-scoped information.

---

## Tools

### `get_last_receipt`

Fetches the user's most recently scanned/uploaded receipt with all line items.

| Field | Detail |
|---|---|
| Parameters | none |
| Returns | `id`, `merchant`, `transaction_date`, `total`, `subtotal`, `tax`, `currency`, `total_saved`, `items[]` (name, category, qty, unit_price, line_total, on_promotion) |
| When to use | "Show my last receipt", "What did I buy last?", "Last shopping trip" |
| Do NOT use | Period totals, trends, category breakdowns |

**Example questions**
- "Show me my last receipt"
- "What did I buy at the shops?"
- "How much was my last grocery run?"

**Expected response**
> Your last receipt was from **Tesco** on **15 March 2026**, totalling **£42.30**.
> Here's what you bought:
> - Semi-skimmed milk × 2 — £1.80
> - Chicken breast 500g — £5.25
> - …
> You saved **£3.40** with promotions.

---

### `get_spending_summary`

Aggregates total spend over a chosen period.

| Field | Detail |
|---|---|
| Parameters | `period` (enum): `this_month`, `last_month`, `last_7_days`, `last_30_days`, `last_3_months` |
| Returns | `total_spent`, `receipt_count`, `average_per_shop`, `per_person_cost`, `household_size`, `currency`, `start_date`, `end_date` |
| When to use | "How much did I spend this month?", "Total for last 30 days?", "Cost per person?" |
| Do NOT use | Category breakdowns (use `get_category_breakdown`) |

**Example questions**
- "How much did I spend this month?"
- "What was my total for last week?"
- "How much is that per person in my household?"
- "Spending over the last 30 days"

**Expected response**
> This month you've spent **£214.80** across **7 shops** — an average of **£30.69 per visit**.
> With a household of 2, that's **£107.40 per person**.

---

### `get_category_breakdown`

Breaks down spending by product category for a given period.

| Field | Detail |
|---|---|
| Parameters | `period` (enum), `limit` (int, max 10, default 8) |
| Returns | `categories[]` → `{category, total_spent, item_count, receipt_count}`, sorted by `total_spent` desc |
| When to use | "What did I spend most on?", "Top categories", "How much on dairy/meat/etc.?" |
| Produces | Bar chart automatically rendered in the UI |

**Example questions**
- "What are my top spending categories this month?"
- "How much did I spend on meat last 30 days?"
- "Break down my spending by category"
- "What category costs me the most?"

**Expected response + chart**
> Here's your spending breakdown for this month:
>
> 1. **Meat & Fish** — £52.40
> 2. **Dairy** — £38.20
> 3. **Bakery** — £24.10
> …
>
> *(Bar chart rendered below the message)*

---

### `get_budget_status`

Compares actual spending this month against the user's configured monthly budget.

| Field | Detail |
|---|---|
| Parameters | none |
| Returns | `monthly_budget`, `spent_this_month`, `remaining`, `percent_used`, `days_elapsed`, `days_in_month`, `on_track` (bool), `currency` |
| When to use | "Am I on track?", "How much budget left?", "Over or under budget?" |
| Note | Returns `note` if no budget is set, encouraging the user to configure one in Settings |

**Example questions**
- "Am I on track with my budget?"
- "How much of my monthly budget have I used?"
- "How much budget do I have left?"
- "Am I over budget?"

**Expected response**
> You've spent **£214.80** of your **£300 budget** this month — that's **71.6%** used with
> 14 days remaining. You're **on track** ✓ (expected usage at this point: ~54%).

---

### `get_top_merchants`

Ranks merchants (shops/supermarkets) by total spend in a period.

| Field | Detail |
|---|---|
| Parameters | `period` (enum), `limit` (int, max 10, default 5) |
| Returns | `merchants[]` → `{merchant, visits, total_spent, average_per_visit}`, sorted by `total_spent` desc |
| When to use | "Where do I shop most?", "Which store do I spend most at?", "Favourite shops" |
| Produces | Bar chart automatically rendered in the UI |

**Example questions**
- "Where do I shop the most?"
- "Which supermarket do I spend the most at?"
- "Top stores this month"
- "How many times did I go to Tesco?"

**Expected response + chart**
> Your top merchants this month:
>
> 1. **Tesco** — £98.40 across 4 visits (avg £24.60/visit)
> 2. **Sainsbury's** — £62.10 across 2 visits
> 3. **Aldi** — £34.20 across 1 visit
>
> *(Bar chart rendered below the message)*

---

### `get_savings_summary`

Summarises money saved through promotions and discounts in a period.

| Field | Detail |
|---|---|
| Parameters | `period` (enum) |
| Returns | `total_saved`, `total_promotions_applied`, `receipts_with_savings`, `biggest_saving`, `currency` |
| When to use | "How much did I save?", "Promotions and discounts", "Best deals" |

**Example questions**
- "How much did I save this month?"
- "How many promotions did I use?"
- "What was my biggest single saving?"
- "Am I taking advantage of deals?"

**Expected response**
> This month you saved **£18.60** through **23 promotions** across **5 shopping trips**.
> Your biggest single saving was **£4.20** on a single receipt.

---

### `get_spending_forecast`

Projects the user's total spend for the current month based on their daily average so far.

| Field | Detail |
|---|---|
| Parameters | none |
| Returns | `spent_so_far`, `daily_average`, `projected_total`, `monthly_budget` (or null), `projected_over_under`, `days_elapsed`, `days_remaining`, `per_person_projected`, `household_size`, `currency` |
| When to use | "Will I go over budget?", "What's my projected spend?", "Forecast for this month" |
| Produces | Comparison bar chart (spent / projected / budget) automatically |

**Example questions**
- "Will I go over budget this month?"
- "What's my projected spend for the month?"
- "If I keep spending like this, what will my total be?"
- "Am I on pace to stay under budget?"

**Expected response + chart**
> You've spent **£180.00** so far with 14 days remaining. At your current daily rate of **£12.86**,
> you're projected to spend **£400.00** this month — that's **£100.00 over your £300 budget**.
> Consider cutting back on discretionary spending this week.
>
> *(Comparison bar chart: Spent so far / Projected total / Budget)*

---

### `get_receipt_by_date`

Retrieves all receipts for a specific calendar date.

| Field | Detail |
|---|---|
| Parameters | `date` (string, **YYYY-MM-DD** — the model resolves relative dates before calling) |
| Returns | `date`, `receipts[]` (merchant, total, items), `receipt_count`, `total_for_day`, `currency` |
| When to use | "What did I buy today?", "Show yesterday's receipts", "Spending on Monday", "Receipts from 14 March" |
| Note | The model resolves relative terms (today, yesterday, last Monday) to ISO dates autonomously |

**Example questions**
- "What did I buy today?"
- "Show me yesterday's receipts"
- "What did I spend last Saturday?"
- "Show receipts from 10 March"
- "Did I shop on Monday?"

**Expected response**
> On **16 March 2026** you had **2 receipts** totalling **£67.40**:
>
> **Tesco** — £42.30
> - Semi-skimmed milk × 2, Chicken breast, …
>
> **Boots** — £25.10
> - Shampoo, Vitamins, …

---

## Chart Rendering

Charts are generated automatically based on which tool was called — the agent does not need to
request them explicitly.

| Tool called | Chart type | Chart title |
|---|---|---|
| `get_category_breakdown` | Bar | "Spending by Category — {period}" |
| `get_top_merchants` | Bar | "Top Merchants — {period}" |
| `get_spending_forecast` | Bar (comparison) | "Spending Forecast — This Month" |
| All others | None | — |

---

## Period Enum Reference

| Value | Meaning |
|---|---|
| `this_month` | 1st of the current calendar month → today |
| `last_month` | 1st → last day of the previous calendar month |
| `last_7_days` | Rolling 7 days ending today |
| `last_30_days` | Rolling 30 days ending today |
| `last_3_months` | Rolling 90 days ending today |

---

## Common Failure Modes & Expected Behaviour

| Situation | Agent behaviour |
|---|---|
| No receipts in the period | Returns zero totals with a clear message — never invents data |
| No monthly budget set | `get_budget_status` returns a note prompting the user to set one in Settings |
| Unrecognised date string passed to `get_receipt_by_date` | Tool returns `{"error": "Invalid date format"}` and agent reports it clearly |
| No microphone access (frontend) | Voice button silently disabled — user can still type |
| Agent calls an unknown tool | Runner returns `{"error": "Unknown tool: …"}` — agent reports it |

---

## System Prompt Rules (summary)

- Always call a tool before answering — never guess numbers.
- Pick the most specific tool; combine tools if a question spans multiple domains.
- Present numbers naturally (e.g. "£42.50 at Tesco on 14 March").
- Use the currency returned by the tool, not a hardcoded symbol.
- When `household_size > 1`, mention the per-person cost alongside the total.
- Today's actual date is injected at runtime — never rely on the model's training cutoff.
