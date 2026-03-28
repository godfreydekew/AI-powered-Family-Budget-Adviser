import uuid
from datetime import datetime, timezone
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Index, Text
from sqlmodel import Field, SQLModel, Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import ForeignKey


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Document
# ---------------------------------------------------------------------------

class DocumentBase(SQLModel):
    title: str = Field(max_length=255)
    source: str = Field(max_length=255)          
    full_text: str                              
    page_type: Optional[str] = Field(         
        default=None, max_length=50           
    )
    benefit_name: Optional[str] = Field(       
        default=None, max_length=255
    )
    country: str = Field(default="UK", max_length=10)
    doc_metadata: Optional[dict] = Field(      
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )


class Document(DocumentBase, table=True):
    __tablename__ = "documents"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True), 
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )


# ---------------------------------------------------------------------------
# Chunk
# ---------------------------------------------------------------------------

class ChunkBase(SQLModel):
    chunk_index: int
    chunk_text: str
    page_type: Optional[str] = Field(           
        default=None, max_length=50             
    )
    benefit_name: Optional[str] = Field(        
        default=None, max_length=255
    )
    country: str = Field(default="UK", max_length=10)
    token_count: Optional[int] = None
    chunk_metadata: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )


class Chunk(ChunkBase, table=True):
    __tablename__ = "chunks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True
    )
    document_id: uuid.UUID = Field(
        default=None,
        foreign_key="documents.id",
        index=True
    )
    embedding: Optional[list[float]] = Field(
        default=None,
        sa_column=Column(Vector(1536), nullable=True)
    )
    created_at: datetime | None = Field(
        default_factory=_utcnow,
        sa_type=DateTime(timezone=True), 
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),
    )