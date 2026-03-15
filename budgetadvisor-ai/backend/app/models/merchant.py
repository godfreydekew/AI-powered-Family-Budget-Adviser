import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class MerchantBase(SQLModel):
    name: str = Field(index=True, max_length=255)
    type: str | None = Field(default=None, max_length=50)
    country_code: str | None = Field(default=None, max_length=2)


class Merchant(MerchantBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class MerchantCreate(MerchantBase):
    pass


class MerchantPublic(MerchantBase):
    id: uuid.UUID
    created_at: datetime | None = None
