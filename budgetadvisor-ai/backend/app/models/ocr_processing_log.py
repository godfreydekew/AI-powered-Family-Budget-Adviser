import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class OcrProcessingLogBase(SQLModel):
    scan_method: str = Field(max_length=20)
    status: str = Field(max_length=20, index=True)
    ocr_raw_text: str | None = None
    llm_raw_response: str | None = None
    llm_model_used: str | None = Field(default=None, max_length=100)
    flagged_items_count: int = Field(default=0)
    error_message: str | None = None
    processing_ms: int | None = None
    image_path: str | None = Field(default=None, max_length=500)


class OcrProcessingLog(OcrProcessingLogBase, table=True):
    __tablename__ = "ocrprocessinglog"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", index=True)
    receipt_id: uuid.UUID | None = Field(default=None, foreign_key="receipt.id")
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class OcrProcessingLogCreate(OcrProcessingLogBase):
    user_id: uuid.UUID | None = None
    receipt_id: uuid.UUID | None = None
