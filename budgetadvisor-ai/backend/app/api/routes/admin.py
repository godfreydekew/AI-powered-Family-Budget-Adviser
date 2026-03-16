"""
Admin-only endpoints — superuser access required.
"""

from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func
from sqlmodel import col, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import OcrProcessingLog, Receipt, User
from app.models.analytics import (
    AdminStats,
    OcrLogPublic,
    OcrLogsPublic,
    ReceiptsPerDayItem,
)

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_active_superuser)],
)


# ---------------------------------------------------------------------------
# GET /admin/stats
# ---------------------------------------------------------------------------


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(session: SessionDep) -> Any:
    total_users = session.exec(select(func.count()).select_from(User)).one()  # type: ignore[arg-type]

    today_start = datetime.combine(date.today(), datetime.min.time()).replace(
        tzinfo=timezone.utc
    )
    receipts_today = session.exec(
        select(func.count())
        .select_from(Receipt)
        .where(col(Receipt.created_at) >= today_start)  # type: ignore[arg-type]
    ).one()

    failed_scans = session.exec(
        select(func.count())
        .select_from(OcrProcessingLog)
        .where(OcrProcessingLog.status == "failed")  # type: ignore[arg-type]
    ).one()

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    active_users_7d = session.exec(
        select(func.count(distinct(Receipt.user_id)))
        .select_from(Receipt)
        .where(  # type: ignore[arg-type]
            col(Receipt.created_at) >= seven_days_ago
        )
    ).one()

    return AdminStats(
        total_users=total_users or 0,
        receipts_today=receipts_today or 0,
        failed_scans=failed_scans or 0,
        active_users_7d=active_users_7d or 0,
    )


# ---------------------------------------------------------------------------
# GET /admin/logs
# ---------------------------------------------------------------------------


@router.get("/logs", response_model=OcrLogsPublic)
def get_processing_logs(
    session: SessionDep,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    count = session.exec(
        select(func.count()).select_from(OcrProcessingLog)  # type: ignore[arg-type]
    ).one()

    logs = session.exec(
        select(OcrProcessingLog)
        .order_by(col(OcrProcessingLog.created_at).desc())
        .offset(skip)
        .limit(limit)
    ).all()

    # Batch-load users to avoid N+1
    user_ids = {log.user_id for log in logs if log.user_id}
    users = (
        {
            u.id: u
            for u in session.exec(select(User).where(col(User.id).in_(user_ids))).all()
        }
        if user_ids
        else {}
    )

    data = [
        OcrLogPublic(
            id=log.id,
            user_email=users[log.user_id].email
            if log.user_id and log.user_id in users
            else None,
            scan_method=log.scan_method,
            status=log.status,
            llm_model_used=log.llm_model_used,
            processing_ms=log.processing_ms,
            flagged_items_count=log.flagged_items_count,
            error_message=log.error_message,
            created_at=log.created_at,
        )
        for log in logs
    ]

    return OcrLogsPublic(data=data, count=count or 0)


# ---------------------------------------------------------------------------
# GET /admin/receipts-per-day
# ---------------------------------------------------------------------------


@router.get("/receipts-per-day", response_model=list[ReceiptsPerDayItem])
def get_receipts_per_day(session: SessionDep) -> Any:
    seven_days_ago = datetime.combine(
        date.today() - timedelta(days=6), datetime.min.time()
    ).replace(tzinfo=timezone.utc)

    receipts = session.exec(
        select(Receipt).where(col(Receipt.created_at) >= seven_days_ago)
    ).all()

    day_counts: dict[str, int] = defaultdict(int)
    for r in receipts:
        if r.created_at:
            day_counts[r.created_at.date().isoformat()] += 1

    today = date.today()
    return [
        ReceiptsPerDayItem(
            day=(today - timedelta(days=i)).strftime("%a"),
            count=day_counts.get((today - timedelta(days=i)).isoformat(), 0),
        )
        for i in range(6, -1, -1)
    ]
