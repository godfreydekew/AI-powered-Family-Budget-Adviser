import uuid
from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Column, Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Shared constants
# ---------------------------------------------------------------------------

VALID_COUNTRIES = ["UK", "US", "CA", "AU", "IE"]


# ---------------------------------------------------------------------------
# Document
# ---------------------------------------------------------------------------

class DocumentBase(SQLModel):
    title: str = Field(max_length=255)
    source: str = Field(max_length=255)
    full_text: str
    page_type: str | None = Field(
        default=None, max_length=50
    )
    benefit_name: str | None = Field(
        default=None, max_length=255
    )
    country: str = Field(default="UK", max_length=10)
    doc_metadata: dict | None = Field(
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
    page_type: str | None = Field(
        default=None, max_length=50
    )
    benefit_name: str | None = Field(
        default=None, max_length=255
    )
    country: str = Field(default="UK", max_length=10)
    token_count: int | None = None
    chunk_metadata: dict | None = Field(
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
    embedding: list[float] | None = Field(
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


# ---------------------------------------------------------------------------
# ingest_document → POST /benefits/documents
# ---------------------------------------------------------------------------

class DocumentIngest(SQLModel):
    """Request body for uploading a new benefits document."""

    title: str = Field(
        max_length=255,
        description="Human-readable document title shown in answers.",
    )
    source: str = Field(
        max_length=255,
        description="Origin reference — admin name, filename, or URL.",
    )
    full_text: str = Field(
        description="The raw document text to chunk and embed.",
    )
    page_type: str | None = Field(
        default=None,
        max_length=50,
        description="Optional classification, e.g. 'eligibility', 'rates', 'how-to-claim'.",
    )
    benefit_name: str | None = Field(
        default=None,
        max_length=255,
        description="Optional benefit label, e.g. 'Universal Credit', 'Housing Benefit'.",
    )
    country: str = Field(
        default="UK",
        max_length=10,
        description="ISO country code. Defaults to 'UK'.",
    )
    doc_metadata: dict | None = Field(
        default=None,
        description="Any extra key/value pairs stored alongside the document.",
    )


class DocumentPublic(SQLModel):
    """Response returned after a document is ingested or retrieved."""

    id: uuid.UUID
    title: str
    source: str
    page_type: str | None = None
    benefit_name: str | None = None
    country: str
    doc_metadata: dict | None = None
    created_at: datetime | None = None
    chunk_count: int = Field(
        default=0,
        description="Number of chunks stored for this document.",
    )


class DocumentsPublic(SQLModel):
    """Paginated list of documents (admin listing endpoint)."""

    data: list[DocumentPublic]
    count: int


# ---------------------------------------------------------------------------
# retrieve_chunks → POST /benefits/retrieve
# ---------------------------------------------------------------------------

class ChunkQuery(SQLModel):
    """Request body for the raw semantic-search endpoint."""

    question: str = Field(description="Natural-language question to search for.")
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of closest chunks to return.",
    )
    country: str | None = Field(
        default=None,
        description="Restrict results to this country code.",
    )
    benefit_name: str | None = Field(
        default=None,
        description="Restrict results to this benefit.",
    )


class ChunkResult(SQLModel):
    """A single chunk returned from semantic search."""

    chunk_text: str
    document_id: uuid.UUID
    title: str
    source: str
    benefit_name: str | None = None
    country: str
    distance: float = Field(description="Cosine distance — lower is more similar.")


class ChunksResult(SQLModel):
    """Response from the retrieve endpoint."""

    data: list[ChunkResult]
    count: int


# ---------------------------------------------------------------------------
# answer_question → POST /benefits/ask
# ---------------------------------------------------------------------------

class BenefitsQuestion(SQLModel):
    """Request body for the RAG answer endpoint."""

    question: str = Field(description="The user's natural-language question.")
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of chunks to use as context for the LLM.",
    )
    country: str | None = Field(
        default=None,
        description="Restrict retrieval to this country code.",
    )
    benefit_name: str | None = Field(
        default=None,
        description="Restrict retrieval to this benefit.",
    )


class SourceRef(SQLModel):
    """A deduplicated source reference included in a RAG answer."""

    title: str
    source: str
    benefit_name: str | None = None


class BenefitsAnswer(SQLModel):
    """Response from the RAG answer endpoint."""

    answer: str = Field(description="LLM-generated answer grounded in retrieved chunks.")
    sources: list[SourceRef] = Field(
        description="Unique source documents that contributed to the answer.",
    )
    chunks_used: int = Field(description="Number of chunks used as context.")
