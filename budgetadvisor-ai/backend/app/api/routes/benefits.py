import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.ai.benefits_agent.rag import (
    answer_question,
    delete_document,
    ingest_document,
    retrieve_chunks,
)
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models.rag import (
    BenefitsAnswer,
    BenefitsQuestion,
    Chunk,
    ChunkQuery,
    ChunksResult,
    ChunkResult,
    Document,
    DocumentIngest,
    DocumentPublic,
    DocumentsPublic,
)
from sqlmodel import func, select

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Two sub-routers: admin (superuser-only) and public (any authenticated user)
# ---------------------------------------------------------------------------

admin_router = APIRouter(
    prefix="/benefits",
    tags=["benefits"],
    dependencies=[Depends(get_current_active_superuser)],
)

public_router = APIRouter(prefix="/benefits", tags=["benefits"])


# ---------------------------------------------------------------------------
# POST /benefits/documents — ingest a new document
# ---------------------------------------------------------------------------

@admin_router.post("/documents", response_model=DocumentPublic, status_code=201)
def upload_document(body: DocumentIngest, session: SessionDep) -> DocumentPublic:
    """
    Chunk, embed, and store a plain-text benefits document.

    The full text is split into overlapping word chunks, each chunk is embedded
    via OpenAI text-embedding-3-small.
    """
    try:
        return ingest_document(session, body)
    except Exception as e:
        logger.exception("Failed to ingest document: %s", body.title)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}") from e


# ---------------------------------------------------------------------------
# GET /benefits/documents — list all documents
# ---------------------------------------------------------------------------

@admin_router.get("/documents", response_model=DocumentsPublic)
def list_documents(session: SessionDep, skip: int = 0, limit: int = 50) -> DocumentsPublic:
    """Return a paginated list of all documents in the knowledge base."""
    docs = session.exec(
        select(Document).order_by(Document.created_at.desc()).offset(skip).limit(limit)
    ).all()

    total = session.exec(select(func.count(Document.id))).one()

    items = []
    for doc in docs:
        chunk_count = session.exec(
            select(func.count(Chunk.id)).where(Chunk.document_id == doc.id)
        ).one()
        items.append(DocumentPublic(**doc.model_dump(), chunk_count=chunk_count))

    return DocumentsPublic(data=items, count=total)


# ---------------------------------------------------------------------------
# GET /benefits/documents/{id} — get a single document
# ---------------------------------------------------------------------------

@admin_router.get("/documents/{document_id}", response_model=DocumentPublic)
def get_document(document_id: uuid.UUID, session: SessionDep) -> DocumentPublic:
    """Fetch a single document by ID."""
    doc = session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    chunk_count = session.exec(
        select(func.count(Chunk.id)).where(Chunk.document_id == document_id)
    ).one()

    return DocumentPublic(**doc.model_dump(), chunk_count=chunk_count)


# ---------------------------------------------------------------------------
# DELETE /benefits/documents/{id} — delete document + all its chunks
# ---------------------------------------------------------------------------

@admin_router.delete("/documents/{document_id}", status_code=204)
def remove_document(document_id: uuid.UUID, session: SessionDep) -> None:
    """
    Permanently delete a document and all its associated chunks and embeddings.
    """
    found = delete_document(session, document_id)
    if not found:
        raise HTTPException(status_code=404, detail="Document not found.")


# ---------------------------------------------------------------------------
# POST /benefits/ask — answer a question via RAG
# ---------------------------------------------------------------------------

@public_router.post("/ask", response_model=BenefitsAnswer)
def ask(
    body: BenefitsQuestion,
    session: SessionDep,
    current_user: CurrentUser,
) -> BenefitsAnswer:
    """
    Answer a benefits-related question using the RAG pipeline.

    Retrieves the most semantically relevant chunks from the knowledge base,
    then uses an LLM to generate a grounded answer with source references.
    """
    try:
        return answer_question(session, body)
    except Exception as e:
        logger.exception("RAG answer failed for user %s", current_user.id)
        raise HTTPException(
            status_code=500,
            detail="Could not generate an answer. Please try again.",
        ) from e


# ---------------------------------------------------------------------------
# POST /benefits/retrieve — raw semantic search (admin debug)
# ---------------------------------------------------------------------------

@admin_router.post("/retrieve", response_model=ChunksResult)
def retrieve(body: ChunkQuery, session: SessionDep) -> ChunksResult:
    """
    Return the raw ranked chunks for a question without LLM generation.
    Useful for inspecting retrieval quality and tuning top_k.
    """
    chunks = retrieve_chunks(
        session,
        body.question,
        top_k=body.top_k,
        country=body.country,
        benefit_name=body.benefit_name,
    )
    return ChunksResult(data=chunks, count=len(chunks))
