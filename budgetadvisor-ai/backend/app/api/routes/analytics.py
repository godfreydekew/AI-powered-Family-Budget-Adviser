"""
Analytics endpoints — user-scoped, derived from receipts and items.
"""

from collections import defaultdict
from datetime import date, timedelta
from typing import Any, Literal

from fastapi import APIRouter
from sqlmodel import col, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Receipt, ReceiptItem
from app.models.analytics import (
    CategoryBreakdownItem,
    DashboardStats,
    TopMerchant,
    WeeklyTrendItem,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Category display metadata — matches frontend CATEGORIES constant
CATEGORY_META: dict[str, tuple[str, str]] = {
    "dairy": ("Dairy", "#6366F1"),
    "meat": ("Meat", "#F43F5E"),
    "fresh_produce": ("Fresh Produce", "#22C55E"),
    "bakery": ("Bakery", "#F59E0B"),
    "processed_foods": ("Processed Foods", "#8B5CF6"),
    "household": ("Household", "#06B6D4"),
    "personal_care": ("Personal Care", "#EC4899"),
    "beverages": ("Beverages", "#14B8A6"),
    "other": ("Other", "#94A3B8"),
}

Period = Literal["week", "month", "last_month"]


def _period_start(period: Period) -> date:
    today = date.today()
    if period == "week":
        return today - timedelta(days=today.weekday())
    if period == "last_month":
        first_of_this = today.replace(day=1)
        return (first_of_this - timedelta(days=1)).replace(day=1)
    return today.replace(day=1)  # month (default)


def _period_end(period: Period) -> date:
    today = date.today()
    if period == "last_month":
        return today.replace(day=1) - timedelta(days=1)
    return today


def _get_period_receipts(
    session: SessionDep, user_id: Any, period: Period
) -> list[Receipt]:
    start = _period_start(period)
    end = _period_end(period)
    return session.exec(
        select(Receipt)
        .where(Receipt.user_id == user_id)
        .where(col(Receipt.transaction_date) >= start)
        .where(col(Receipt.transaction_date) <= end)
    ).all()


# ---------------------------------------------------------------------------
# GET /analytics/dashboard
# ---------------------------------------------------------------------------


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: CurrentUser,
    session: SessionDep,
    period: Period = "month",
) -> Any:
    receipts = _get_period_receipts(session, current_user.id, period)

    this_month = round(sum(r.total_amount or 0 for r in receipts), 2)
    saved = round(sum(r.total_saved for r in receipts), 2)
    budget = current_user.monthly_budget
    budget_percent = round((this_month / budget * 100), 1) if budget else 0.0

    return DashboardStats(
        this_month=this_month,
        budget=budget,
        budget_percent=budget_percent,
        saved=saved,
        receipt_count=len(receipts),
    )


# ---------------------------------------------------------------------------
# GET /analytics/categories
# ---------------------------------------------------------------------------


@router.get("/categories", response_model=list[CategoryBreakdownItem])
def get_category_breakdown(
    current_user: CurrentUser,
    session: SessionDep,
    period: Period = "month",
) -> Any:
    receipts = _get_period_receipts(session, current_user.id, period)
    if not receipts:
        return []

    receipt_ids = [r.id for r in receipts]
    items = session.exec(
        select(ReceiptItem).where(col(ReceiptItem.receipt_id).in_(receipt_ids))
    ).all()

    totals: dict[str, float] = defaultdict(float)
    for item in items:
        totals[item.category] += item.line_total or 0

    grand_total = sum(totals.values()) or 1

    return sorted(
        [
            CategoryBreakdownItem(
                key=key,
                label=CATEGORY_META.get(
                    key, (key.replace("_", " ").title(), "#94A3B8")
                )[0],
                amount=round(amount, 2),
                color=CATEGORY_META.get(key, (key, "#94A3B8"))[1],
                percent=round((amount / grand_total) * 100, 1),
            )
            for key, amount in totals.items()
            if amount > 0
        ],
        key=lambda c: c.amount,
        reverse=True,
    )


# ---------------------------------------------------------------------------
# GET /analytics/weekly-trend
# ---------------------------------------------------------------------------


@router.get("/weekly-trend", response_model=list[WeeklyTrendItem])
def get_weekly_trend(
    current_user: CurrentUser,
    session: SessionDep,
) -> Any:
    eight_weeks_ago = date.today() - timedelta(weeks=8)
    receipts = session.exec(
        select(Receipt)
        .where(Receipt.user_id == current_user.id)
        .where(col(Receipt.transaction_date) >= eight_weeks_ago)
    ).all()

    # Accumulate per ISO-week key, preserving insertion order
    week_totals: dict[str, float] = defaultdict(float)
    for r in receipts:
        if r.transaction_date:
            key = f"W{r.transaction_date.isocalendar()[1]}"
            week_totals[key] += r.total_amount or 0

    # Build last-8-weeks ordered list
    today = date.today()
    seen: set[str] = set()
    result: list[WeeklyTrendItem] = []
    for i in range(7, -1, -1):
        d = today - timedelta(weeks=i)
        label = f"W{d.isocalendar()[1]}"
        if label not in seen:
            seen.add(label)
            result.append(
                WeeklyTrendItem(week=label, amount=round(week_totals.get(label, 0), 2))
            )

    return result


# ---------------------------------------------------------------------------
# GET /analytics/top-merchants
# ---------------------------------------------------------------------------


@router.get("/top-merchants", response_model=list[TopMerchant])
def get_top_merchants(
    current_user: CurrentUser,
    session: SessionDep,
    period: Period = "month",
) -> Any:
    receipts = _get_period_receipts(session, current_user.id, period)

    merchant_data: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"visits": 0, "total": 0.0}
    )
    for r in receipts:
        name = r.merchant_name_raw or "Unknown"
        merchant_data[name]["visits"] += 1
        merchant_data[name]["total"] += r.total_amount or 0

    return sorted(
        [
            TopMerchant(
                name=name,
                visits=d["visits"],
                total=round(d["total"], 2),
                avg=round(d["total"] / d["visits"], 2),
            )
            for name, d in merchant_data.items()
        ],
        key=lambda m: m.total,
        reverse=True,
    )[:10]
