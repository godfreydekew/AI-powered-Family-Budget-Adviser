"""
Stage 1 stub — schema only. Not used until Stage 2.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

class ChatBase(SQLModel):
    title: str | None = Field(default=None, max_length=255)


class Chat(ChatBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )


class ChatCreate(ChatBase):
    user_id: uuid.UUID


# ---------------------------------------------------------------------------
# ChatMessage
# ---------------------------------------------------------------------------

class ChatMessageBase(SQLModel):
    role: str = Field(max_length=20)
    content: str


class ChatMessage(ChatMessageBase, table=True):
    __tablename__ = "chatmessage"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    chat_id: uuid.UUID = Field(foreign_key="chat.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class ChatMessageCreate(ChatMessageBase):
    chat_id: uuid.UUID
    user_id: uuid.UUID
