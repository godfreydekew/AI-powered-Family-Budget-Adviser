import json
from datetime import date

from openai import OpenAI

from app.ai.advisor_agent.tools import TOOL_REGISTRY, TOOL_SCHEMAS
from app.core.config import settings

SYSTEM_PROMPT = """You are a personal budget advisor. You have access to the following tools:

- get_last_receipt: Use when the user asks about their most recent/latest receipt, what they
  bought last, or their last shopping trip. Returns full receipt with all line items.
  Do NOT use for period totals or trends.

- get_spending_summary: Use when the user asks how much they spent overall in a period
  (e.g. "this month", "last week", "last 30 days"). Also use when asked about cost per person.
  Returns total, receipt count, average per shop, per_person_cost, household_size.

- get_category_breakdown: Use when the user asks about spending by category, top categories,
  or what they spent on (food/dairy/meat/etc.) in a period. Returns ranked category totals.

- get_budget_status: Use when the user asks if they are on track, over budget, or how much
  budget they have left this month. Returns budget vs actual and whether they are on track.

- get_top_merchants: Use when the user asks where they shop the most, which store they spend
  most at, or their most-visited merchants. Returns ranked merchants with visits and totals.

- get_savings_summary: Use when the user asks about savings, discounts, promotions, or deals.
  Returns total saved, number of promotions, and biggest single saving.

- get_spending_forecast: Use when the user asks whether they will go over budget, what their
  projected end-of-month total is, or wants a spending forecast/prediction.
  Returns projected_total, spent_so_far, daily_average, monthly_budget, projected_over_under,
  per_person_projected, days_remaining.

- get_receipt_by_date: Use when the user asks about receipts on a specific day
  (e.g. "what did I buy today?", "show yesterday's receipts", "what did I spend last Monday?").
  You must resolve relative dates to YYYY-MM-DD yourself before calling.

Rules:
- Always call the appropriate tool before answering — never guess or invent numbers.
- Pick the most specific tool for the question; combine tools if needed (e.g. budget + categories).
- If no tool covers the question, say so clearly.
- Present numbers in a friendly way (e.g. "£42.50 at Tesco on 14 March", "you saved £3.80").
- Use the user's currency from the tool response, not a hardcoded symbol.
- When household_size > 1, always mention the per-person cost alongside the total."""


def _build_chart(tool_results: dict) -> dict | None:
    """Construct chart data from whichever data tools were called this turn."""

    if "get_category_breakdown" in tool_results:
        data = tool_results["get_category_breakdown"]
        categories = data.get("categories") or []
        if categories:
            currency = data.get("currency", "")
            return {
                "type": "bar",
                "title": f"Spending by Category — {data.get('period', '').replace('_', ' ').title()}",
                "currency": currency,
                "data": [
                    {"label": c["category"].replace("_", " ").title(), "value": c["total_spent"]}
                    for c in categories[:8]
                ],
            }

    if "get_top_merchants" in tool_results:
        data = tool_results["get_top_merchants"]
        merchants = data.get("merchants") or []
        if merchants:
            return {
                "type": "bar",
                "title": f"Top Merchants — {data.get('period', '').replace('_', ' ').title()}",
                "currency": "",
                "data": [
                    {"label": m["merchant"] or "Unknown", "value": m["total_spent"]}
                    for m in merchants
                ],
            }

    if "get_spending_forecast" in tool_results:
        data = tool_results["get_spending_forecast"]
        chart_data = [
            {"label": "Spent so far", "value": data.get("spent_so_far", 0)},
            {"label": "Projected total", "value": data.get("projected_total", 0)},
        ]
        if data.get("monthly_budget"):
            chart_data.append({"label": "Budget", "value": data["monthly_budget"]})
        return {
            "type": "bar",
            "title": "Spending Forecast — This Month",
            "currency": data.get("currency", ""),
            "data": chart_data,
        }

    return None


def run_agent(user_message: str, context: dict) -> dict:
    """
    Run the budget advisor agent for a single turn.

    context: dict passed through to every tool call, e.g. {"user_id": "<uuid>"}.
    Returns a dict with keys: text (str), chart (dict | None).
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    messages: list = [{"role": "user", "content": user_message}]

    today = date.today()
    system = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Today's date: {today.strftime('%A, %d %B %Y')} (ISO: {today.isoformat()})\n"
        f"Current user context: {json.dumps(context)}"
    )
    tool_results: dict = {}

    # Agent loop — runs until the model stops calling tools
    while True:
        response = client.responses.create(
            model=settings.OPENAI_MODEL,
            instructions=system,
            tools=TOOL_SCHEMAS,
            input=messages,
        )

        messages += response.output

        tool_calls = [item for item in response.output if item.type == "function_call"]

        # No tool calls → model has its final answer
        if not tool_calls:
            chart = _build_chart(tool_results)
            return {"text": response.output_text, "chart": chart}

        # Execute each tool and feed results back
        for call in tool_calls:
            fn = TOOL_REGISTRY.get(call.name)
            if not fn:
                result: dict = {"error": f"Unknown tool: {call.name}"}
            else:
                args = json.loads(call.arguments)
                args = {**context, **args}
                result = fn(**args)

            tool_results[call.name] = result

            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": call.call_id,
                    "output": json.dumps(result),
                }
            )
