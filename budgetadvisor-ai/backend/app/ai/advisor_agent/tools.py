import uuid
from calendar import monthrange
from datetime import date, timedelta

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.db import engine
from app.models import Receipt, ReceiptItem, User

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

VALID_PERIODS = ["this_month", "last_month", "last_7_days", "last_30_days", "last_3_months"]


def _date_range(period: str) -> tuple[date, date]:
    """Return (start, end) date for a named period. Defaults to this_month."""
    today = date.today()
    if period == "last_month":
        first_of_this = date(today.year, today.month, 1)
        last_prev = first_of_this - timedelta(days=1)
        return date(last_prev.year, last_prev.month, 1), last_prev
    elif period == "last_7_days":
        return today - timedelta(days=7), today
    elif period == "last_30_days":
        return today - timedelta(days=30), today
    elif period == "last_3_months":
        return today - timedelta(days=90), today
    else:  # "this_month" or anything unrecognised
        _, last_day = monthrange(today.year, today.month)
        return date(today.year, today.month, 1), date(today.year, today.month, last_day)


# ---------------------------------------------------------------------------
# Tool: get_last_receipt
# ---------------------------------------------------------------------------

GET_LAST_RECEIPT_SCHEMA = {
    "type": "function",
    "name": "get_last_receipt",
    "description": (
        "Retrieves the most recently scanned receipt for the current user. "
        "Call this whenever the user asks about their last/latest/most recent receipt, "
        "recent spending, or what they bought. "
        "Do NOT call this for historical comparisons or spending totals across multiple receipts. "
        "Returns an object with: merchant (string), date (YYYY-MM-DD), currency (ISO 4217), "
        "total (float), subtotal (float), tax (float), total_saved (float), "
        "and items (list of {name, category, quantity, unit_price, total, on_promotion})."
    ),
    # No model-visible parameters: user_id is already known from context and injected server-side.
    "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
    },
}


def get_last_receipt(user_id: str, **_kwargs: object) -> dict:
    user_uuid = uuid.UUID(user_id)

    with Session(engine) as session:
        receipt = session.exec(
            select(Receipt)
            .where(Receipt.user_id == user_uuid)
            .order_by(Receipt.created_at.desc())
        ).first()

        if not receipt:
            return {"error": "No receipts found for this user."}

        items = session.exec(
            select(ReceiptItem).where(ReceiptItem.receipt_id == receipt.id)
        ).all()

        return {
            "id": str(receipt.id),
            "merchant": receipt.merchant_name_raw,
            "total": float(receipt.total_amount) if receipt.total_amount is not None else None,
            "subtotal": float(receipt.subtotal) if receipt.subtotal is not None else None,
            "tax": float(receipt.tax_amount) if receipt.tax_amount is not None else None,
            "currency": receipt.currency,
            "date": receipt.transaction_date.isoformat() if receipt.transaction_date else None,
            "total_saved": float(receipt.total_saved),
            "items": [
                {
                    "name": item.clean_description or item.raw_description,
                    "category": item.category,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price) if item.unit_price is not None else None,
                    "total": float(item.line_total) if item.line_total is not None else None,
                    "on_promotion": item.on_promotion,
                }
                for item in items
            ],
        }


# ---------------------------------------------------------------------------
# Tool: get_spending_summary
# ---------------------------------------------------------------------------

GET_SPENDING_SUMMARY_SCHEMA = {
    "type": "function",
    "name": "get_spending_summary",
    "description": (
        "Returns total spending for a given time period. "
        "Call this when the user asks how much they spent overall in a period "
        "(e.g. 'this month', 'last week', 'last 30 days'). "
        "Do NOT call this for category breakdowns — use get_category_breakdown instead. "
        "Returns: period, start_date, end_date, total_spent (float), receipt_count (int), "
        "average_per_shop (float), per_person_cost (total divided by household size), "
        "household_size (int), currency (ISO 4217)."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "period": {
                "type": "string",
                "enum": VALID_PERIODS,
                "description": (
                    "The time period to summarise. "
                    "Use 'this_month' for the current calendar month, "
                    "'last_month' for the previous calendar month, "
                    "'last_7_days' for a rolling 7 days, "
                    "'last_30_days' for a rolling 30 days, "
                    "'last_3_months' for a rolling 90 days."
                ),
            }
        },
        "required": ["period"],
    },
}


def get_spending_summary(user_id: str, period: str = "this_month", **_kwargs: object) -> dict:
    user_uuid = uuid.UUID(user_id)
    start, end = _date_range(period)

    with Session(engine) as session:
        receipts = session.exec(
            select(Receipt)
            .where(Receipt.user_id == user_uuid)
            .where(Receipt.transaction_date >= start)
            .where(Receipt.transaction_date <= end)
        ).all()

        if not receipts:
            return {
                "period": period,
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "total_spent": 0.0,
                "receipt_count": 0,
                "average_per_shop": 0.0,
                "currency": "GBP",
            }

        total = sum(r.total_amount or 0.0 for r in receipts)
        count = len(receipts)
        currency = receipts[0].currency

        user = session.get(User, user_uuid)
        household = max((user.household_size or 1) if user else 1, 1)

        return {
            "period": period,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "total_spent": round(total, 2),
            "receipt_count": count,
            "average_per_shop": round(total / count, 2),
            "per_person_cost": round(total / household, 2),
            "household_size": household,
            "currency": currency,
        }


# ---------------------------------------------------------------------------
# Tool: get_category_breakdown
# ---------------------------------------------------------------------------

GET_CATEGORY_BREAKDOWN_SCHEMA = {
    "type": "function",
    "name": "get_category_breakdown",
    "description": (
        "Returns spending broken down by product category for a given period. "
        "Call this when the user asks about their top categories, what they spent on food/dairy/meat, "
        "or wants to understand where their money goes. "
        "Returns a list of {category, total_spent, item_count, percent_of_total}, "
        "sorted by total_spent descending."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "period": {
                "type": "string",
                "enum": VALID_PERIODS,
                "description": "The time period to analyse. Same options as get_spending_summary.",
            }
        },
        "required": ["period"],
    },
}


def get_category_breakdown(user_id: str, period: str = "this_month", **_kwargs: object) -> dict:
    user_uuid = uuid.UUID(user_id)
    start, end = _date_range(period)

    with Session(engine) as session:
        rows = session.exec(
            select(
                ReceiptItem.category,
                func.sum(ReceiptItem.line_total).label("total"),
                func.count(ReceiptItem.id).label("item_count"),
            )
            .join(Receipt, ReceiptItem.receipt_id == Receipt.id)
            .where(ReceiptItem.user_id == user_uuid)
            .where(Receipt.transaction_date >= start)
            .where(Receipt.transaction_date <= end)
            .where(ReceiptItem.line_total.is_not(None))  # type: ignore[union-attr]
            .group_by(ReceiptItem.category)
            .order_by(func.sum(ReceiptItem.line_total).desc())
        ).all()

        if not rows:
            return {"period": period, "categories": []}

        grand_total = sum(float(r.total) for r in rows)

        return {
            "period": period,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "categories": [
                {
                    "category": r.category,
                    "total_spent": round(float(r.total), 2),
                    "item_count": r.item_count,
                    "percent_of_total": round(float(r.total) / grand_total * 100, 1),
                }
                for r in rows
            ],
        }


# ---------------------------------------------------------------------------
# Tool: get_budget_status
# ---------------------------------------------------------------------------

GET_BUDGET_STATUS_SCHEMA = {
    "type": "function",
    "name": "get_budget_status",
    "description": (
        "Returns the user's monthly budget versus their actual spend so far this month. "
        "Call this when the user asks if they are on track, over budget, or how much they have left. "
        "Returns: monthly_budget (float or null if not set), spent_this_month (float), "
        "remaining (float), percent_used (float), days_elapsed (int), days_in_month (int), "
        "on_track (bool), currency (ISO 4217)."
    ),
    "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
    },
}


def get_budget_status(user_id: str, **_kwargs: object) -> dict:
    user_uuid = uuid.UUID(user_id)
    today = date.today()
    _, days_in_month = monthrange(today.year, today.month)
    start = date(today.year, today.month, 1)

    with Session(engine) as session:
        user = session.get(User, user_uuid)
        if not user:
            return {"error": "User not found."}

        receipts = session.exec(
            select(Receipt)
            .where(Receipt.user_id == user_uuid)
            .where(Receipt.transaction_date >= start)
            .where(Receipt.transaction_date <= today)
        ).all()

        spent = round(sum(r.total_amount or 0.0 for r in receipts), 2)
        budget = user.monthly_budget
        currency = user.preferred_currency

        if budget is None:
            return {
                "monthly_budget": None,
                "spent_this_month": spent,
                "remaining": None,
                "percent_used": None,
                "days_elapsed": today.day,
                "days_in_month": days_in_month,
                "on_track": None,
                "currency": currency,
                "note": "No monthly budget set. The user can set one in Settings.",
            }

        remaining = round(budget - spent, 2)
        percent_used = round(spent / budget * 100, 1) if budget > 0 else 0.0
        # "on track" = spending less than the proportion of the month elapsed
        expected_by_now = budget * (today.day / days_in_month)
        on_track = spent <= expected_by_now

        return {
            "monthly_budget": budget,
            "spent_this_month": spent,
            "remaining": remaining,
            "percent_used": percent_used,
            "days_elapsed": today.day,
            "days_in_month": days_in_month,
            "on_track": on_track,
            "currency": currency,
        }


# ---------------------------------------------------------------------------
# Tool: get_top_merchants
# ---------------------------------------------------------------------------

GET_TOP_MERCHANTS_SCHEMA = {
    "type": "function",
    "name": "get_top_merchants",
    "description": (
        "Returns the user's top merchants (shops/supermarkets) ranked by total spend "
        "for a given period. "
        "Call this when the user asks where they shop the most, their favourite stores, "
        "or which merchant they spend the most at. "
        "Returns a list of {merchant, visits, total_spent, average_per_visit}, "
        "sorted by total_spent descending."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "period": {
                "type": "string",
                "enum": VALID_PERIODS,
                "description": "The time period to analyse.",
            },
            "limit": {
                "type": "integer",
                "description": "Maximum number of merchants to return. Defaults to 5. Max 10.",
            },
        },
        "required": ["period"],
    },
}


def get_top_merchants(
    user_id: str, period: str = "this_month", limit: int = 5, **_kwargs: object
) -> dict:
    user_uuid = uuid.UUID(user_id)
    start, end = _date_range(period)
    limit = min(int(limit), 10)  # cap at 10

    with Session(engine) as session:
        rows = session.exec(
            select(
                Receipt.merchant_name_raw,
                func.count(Receipt.id).label("visits"),
                func.sum(Receipt.total_amount).label("total"),
            )
            .where(Receipt.user_id == user_uuid)
            .where(Receipt.transaction_date >= start)
            .where(Receipt.transaction_date <= end)
            .where(Receipt.merchant_name_raw.is_not(None))  # type: ignore[union-attr]
            .group_by(Receipt.merchant_name_raw)
            .order_by(func.sum(Receipt.total_amount).desc())
            .limit(limit)
        ).all()

        if not rows:
            return {"period": period, "merchants": []}

        return {
            "period": period,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "merchants": [
                {
                    "merchant": r.merchant_name_raw,
                    "visits": r.visits,
                    "total_spent": round(float(r.total), 2),
                    "average_per_visit": round(float(r.total) / r.visits, 2),
                }
                for r in rows
            ],
        }


# ---------------------------------------------------------------------------
# Tool: get_savings_summary
# ---------------------------------------------------------------------------

GET_SAVINGS_SUMMARY_SCHEMA = {
    "type": "function",
    "name": "get_savings_summary",
    "description": (
        "Returns how much money the user saved via promotions and discounts in a given period. "
        "Call this when the user asks about savings, discounts, promotions, or deals. "
        "Returns: total_saved (float), total_promotions_applied (int), "
        "receipts_with_savings (int), biggest_saving (float), currency (ISO 4217)."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "period": {
                "type": "string",
                "enum": VALID_PERIODS,
                "description": "The time period to analyse.",
            }
        },
        "required": ["period"],
    },
}


def get_savings_summary(user_id: str, period: str = "this_month", **_kwargs: object) -> dict:
    user_uuid = uuid.UUID(user_id)
    start, end = _date_range(period)

    with Session(engine) as session:
        receipts = session.exec(
            select(Receipt)
            .where(Receipt.user_id == user_uuid)
            .where(Receipt.transaction_date >= start)
            .where(Receipt.transaction_date <= end)
        ).all()

        if not receipts:
            return {
                "period": period,
                "total_saved": 0.0,
                "total_promotions_applied": 0,
                "receipts_with_savings": 0,
                "biggest_saving": 0.0,
                "currency": "GBP",
            }

        total_saved = sum(r.total_saved for r in receipts)
        total_promotions = sum(int(r.total_promotions) for r in receipts)
        receipts_with_savings = sum(1 for r in receipts if r.total_saved > 0)
        biggest = max(r.total_saved for r in receipts)
        currency = receipts[0].currency

        return {
            "period": period,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "total_saved": round(total_saved, 2),
            "total_promotions_applied": total_promotions,
            "receipts_with_savings": receipts_with_savings,
            "biggest_saving": round(biggest, 2),
            "currency": currency,
        }


# ---------------------------------------------------------------------------
# Tool: get_spending_forecast
# ---------------------------------------------------------------------------

GET_SPENDING_FORECAST_SCHEMA = {
    "type": "function",
    "name": "get_spending_forecast",
    "description": (
        "Projects the user's total spend for the current month based on their daily average so far. "
        "Call this when the user asks whether they will go over budget, what their projected total is, "
        "or wants a forecast / prediction for the rest of the month. "
        "Returns: spent_so_far, daily_average, projected_total, monthly_budget (or null if not set), "
        "projected_over_under (positive = over budget, negative = under), "
        "days_elapsed, days_remaining, days_in_month, "
        "per_person_projected (projected_total / household_size), currency."
    ),
    "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
    },
}


def get_spending_forecast(user_id: str, **_kwargs: object) -> dict:
    user_uuid = uuid.UUID(user_id)
    today = date.today()
    days_elapsed = today.day
    _, days_in_month = monthrange(today.year, today.month)
    days_remaining = days_in_month - days_elapsed
    start = date(today.year, today.month, 1)

    with Session(engine) as session:
        user = session.get(User, user_uuid)
        if not user:
            return {"error": "User not found."}

        receipts = session.exec(
            select(Receipt)
            .where(Receipt.user_id == user_uuid)
            .where(Receipt.transaction_date >= start)
            .where(Receipt.transaction_date <= today)
        ).all()

        spent = round(sum(r.total_amount or 0.0 for r in receipts), 2)
        daily_avg = round(spent / days_elapsed, 2) if days_elapsed > 0 else 0.0
        projected = round(daily_avg * days_in_month, 2)
        budget = user.monthly_budget
        household = max(user.household_size or 1, 1)
        currency = user.preferred_currency

        return {
            "spent_so_far": spent,
            "daily_average": daily_avg,
            "projected_total": projected,
            "monthly_budget": budget,
            "projected_over_under": round(projected - budget, 2) if budget else None,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "days_in_month": days_in_month,
            "per_person_projected": round(projected / household, 2),
            "household_size": household,
            "currency": currency,
        }


# ---------------------------------------------------------------------------
# Tool: get_receipt_by_date
# ---------------------------------------------------------------------------

GET_RECEIPT_BY_DATE_SCHEMA = {
    "type": "function",
    "name": "get_receipt_by_date",
    "description": (
        "Retrieves all receipts for the current user on a specific calendar date. "
        "Call this when the user asks about a specific day — e.g. 'what did I buy today?', "
        "'show me yesterday's receipts', 'what did I spend last Monday?', 'show receipts from 14 March'. "
        "You must resolve relative dates (today, yesterday, last Monday) to YYYY-MM-DD before calling. "
        "Returns: date, receipts list (each with merchant, total, items), "
        "receipt_count, total_for_day, currency. "
        "Returns an empty list with a message if no receipts found for that date."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "date": {
                "type": "string",
                "description": (
                    "The exact date to look up in YYYY-MM-DD format. "
                    "Resolve relative expressions (today, yesterday, last Monday) to the actual date yourself "
                    "before calling this tool."
                ),
            }
        },
        "required": ["date"],
    },
}


def get_receipt_by_date(user_id: str, date: str, **_kwargs: object) -> dict:  # noqa: A002
    from datetime import date as date_type

    user_uuid = uuid.UUID(user_id)
    try:
        target = date_type.fromisoformat(date)
    except ValueError:
        return {"error": f"Invalid date format: '{date}'. Use YYYY-MM-DD."}

    with Session(engine) as session:
        receipts = session.exec(
            select(Receipt)
            .where(Receipt.user_id == user_uuid)
            .where(Receipt.transaction_date == target)
        ).all()

        if not receipts:
            return {
                "date": date,
                "receipts": [],
                "receipt_count": 0,
                "total_for_day": 0.0,
                "message": f"No receipts found for {date}.",
            }

        result = []
        for r in receipts:
            items = session.exec(
                select(ReceiptItem).where(ReceiptItem.receipt_id == r.id)
            ).all()
            result.append({
                "id": str(r.id),
                "merchant": r.merchant_name_raw,
                "total": float(r.total_amount) if r.total_amount is not None else None,
                "currency": r.currency,
                "total_saved": float(r.total_saved),
                "items": [
                    {
                        "name": item.clean_description or item.raw_description,
                        "category": item.category,
                        "quantity": item.quantity,
                        "total": float(item.line_total) if item.line_total is not None else None,
                    }
                    for item in items
                ],
            })

        day_total = round(sum(r.total_amount or 0.0 for r in receipts), 2)
        currency = receipts[0].currency

        return {
            "date": date,
            "receipts": result,
            "receipt_count": len(result),
            "total_for_day": day_total,
            "currency": currency,
        }


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

TOOL_REGISTRY = {
    "get_last_receipt": get_last_receipt,
    "get_spending_summary": get_spending_summary,
    "get_category_breakdown": get_category_breakdown,
    "get_budget_status": get_budget_status,
    "get_top_merchants": get_top_merchants,
    "get_savings_summary": get_savings_summary,
    "get_spending_forecast": get_spending_forecast,
    "get_receipt_by_date": get_receipt_by_date,
}

TOOL_SCHEMAS = [
    GET_LAST_RECEIPT_SCHEMA,
    GET_SPENDING_SUMMARY_SCHEMA,
    GET_CATEGORY_BREAKDOWN_SCHEMA,
    GET_BUDGET_STATUS_SCHEMA,
    GET_TOP_MERCHANTS_SCHEMA,
    GET_SAVINGS_SUMMARY_SCHEMA,
    GET_SPENDING_FORECAST_SCHEMA,
    GET_RECEIPT_BY_DATE_SCHEMA,
]
