import uuid
from datetime import date, datetime, time, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel

from app.models.receipt_item import ReceiptItemPublic


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ReceiptBase(SQLModel):
    merchant_name_raw: str | None = Field(default=None, max_length=255)
    transaction_date: date | None = None
    transaction_time: time | None = None
    subtotal: float | None = None
    tax_amount: float | None = None
    total_amount: float | None = None
    currency: str = Field(default="GBP", max_length=3)
    total_promotions: float = Field(default=0.0)
    total_saved: float = Field(default=0.0)
    item_count: int | None = None
    scan_method: str = Field(max_length=20)
    image_path: str | None = Field(default=None, max_length=500)
    status: str = Field(default="confirmed", max_length=20)
    user_notes: str | None = None


class Receipt(ReceiptBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    merchant_id: uuid.UUID | None = Field(
        default=None, foreign_key="merchant.id", index=True
    )
    scanned_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    confirmed_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )


class ReceiptCreate(ReceiptBase):
    user_id: uuid.UUID
    merchant_id: uuid.UUID | None = None


class ReceiptPublic(ReceiptBase):
    id: uuid.UUID
    user_id: uuid.UUID
    merchant_id: uuid.UUID | None = None
    scanned_at: datetime | None = None
    confirmed_at: datetime | None = None
    created_at: datetime | None = None


class ReceiptsPublic(SQLModel):
    data: list[ReceiptPublic]
    count: int


class ReceiptWithItemsPublic(ReceiptPublic):
    """Receipt response that includes all line items — returned after confirm."""

    items: list[ReceiptItemPublic] = Field(default_factory=list)
