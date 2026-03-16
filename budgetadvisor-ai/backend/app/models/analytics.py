"""
Response-only schemas for analytics and admin endpoints.
No DB tables — these are pure Pydantic shapes returned by the API.
"""

import uuid
from datetime import datetime

from sqlmodel import SQLModel

# ---------------------------------------------------------------------------
# User-facing analytics
# ---------------------------------------------------------------------------


class DashboardStats(SQLModel):
    this_month: float
    budget: float | None
    budget_percent: float
    saved: float
    receipt_count: int


class CategoryBreakdownItem(SQLModel):
    key: str
    label: str
    amount: float
    color: str
    percent: float


class WeeklyTrendItem(SQLModel):
    week: str
    amount: float


class TopMerchant(SQLModel):
    name: str
    visits: int
    total: float
    avg: float


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------


class AdminStats(SQLModel):
    total_users: int
    receipts_today: int
    failed_scans: int
    active_users_7d: int


class ReceiptsPerDayItem(SQLModel):
    day: str
    count: int


class OcrLogPublic(SQLModel):
    id: uuid.UUID
    user_email: str | None
    scan_method: str
    status: str
    llm_model_used: str | None
    processing_ms: int | None
    flagged_items_count: int
    error_message: str | None
    created_at: datetime | None


class OcrLogsPublic(SQLModel):
    data: list[OcrLogPublic]
    count: int
