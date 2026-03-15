import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UserSessionBase(SQLModel):
    token_hash: str = Field(unique=True, index=True, max_length=255)
    expires_at: datetime = Field(sa_type=DateTime(timezone=True))


class UserSession(UserSessionBase, table=True):
    __tablename__ = "usersession"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    revoked_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )


class UserSessionCreate(UserSessionBase):
    user_id: uuid.UUID
