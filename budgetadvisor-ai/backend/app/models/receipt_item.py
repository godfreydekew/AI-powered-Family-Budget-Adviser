import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ReceiptItemBase(SQLModel):
    raw_description: str = Field(max_length=500)
    clean_description: str | None = Field(default=None, max_length=500)
    category: str = Field(default="other", max_length=50, index=True)
    quantity: float = Field(default=1.0)
    unit_price: float | None = None
    line_total: float | None = None
    on_promotion: bool = False
    promotion_saving: float | None = None
    user_edited: bool = False


class ReceiptItem(ReceiptItemBase, table=True):
    __tablename__ = "receiptitem"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    receipt_id: uuid.UUID = Field(foreign_key="receipt.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )


class ReceiptItemCreate(ReceiptItemBase):
    receipt_id: uuid.UUID
    user_id: uuid.UUID


class ReceiptItemUpdate(SQLModel):
    clean_description: str | None = Field(default=None, max_length=500)
    category: str | None = Field(default=None, max_length=50)
    quantity: float | None = None
    unit_price: float | None = None
    line_total: float | None = None
    on_promotion: bool | None = None
    promotion_saving: float | None = None
    user_edited: bool = True


class ReceiptItemPublic(ReceiptItemBase):
    id: uuid.UUID
    receipt_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime | None = None
