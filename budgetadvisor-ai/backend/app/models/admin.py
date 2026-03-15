import uuid
from datetime import datetime, timezone

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AdminBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    full_name: str = Field(max_length=255)
    role: str = Field(default="admin", max_length=50)
    is_active: bool = True


class Admin(AdminBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    last_login_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )


class AdminCreate(AdminBase):
    password: str = Field(min_length=8, max_length=128)


class AdminPublic(AdminBase):
    id: uuid.UUID
    created_at: datetime | None = None
