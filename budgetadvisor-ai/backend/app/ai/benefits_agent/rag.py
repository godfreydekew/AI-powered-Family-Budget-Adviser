import uuid

from openai import OpenAI
from sqlmodel import Session, select

from app.core.config import settings
from app.models.rag import (
    BenefitsAnswer,
    BenefitsQuestion,
    Chunk,
    ChunkResult,
    Document,
    DocumentIngest,
    DocumentPublic,
    SourceRef,
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

EMBED_MODEL = "text-embedding-3-small" 
CHUNK_SIZE = 400      
CHUNK_OVERLAP = 80   
MIN_CHUNK_WORDS = 50   
EMBED_BATCH_SIZE = 100 

_client = OpenAI(api_key=settings.OPENAI_API_KEY)


# ---------------------------------------------------------------------------
# Step 1 — Chunk
# ---------------------------------------------------------------------------

def chunk_text(text: str) -> list[str]:  # noqa: A002
    """
    Split raw text into overlapping word-based chunks.

    Args:
        text: The full document text to split.

    Returns:
        List of chunk strings, each ≤ CHUNK_SIZE words with CHUNK_OVERLAP
        words of overlap with its neighbours. Chunks shorter than
        MIN_CHUNK_WORDS are discarded.
    """
    words = text.split()
    step = CHUNK_SIZE - CHUNK_OVERLAP
    chunks = []

    for i in range(0, len(words), step):
        window = words[i : i + CHUNK_SIZE]
        if len(window) < MIN_CHUNK_WORDS:
            continue
        chunks.append(" ".join(window))

    return chunks


# ---------------------------------------------------------------------------
# Step 2 — Embed
# ---------------------------------------------------------------------------

def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of strings using OpenAI text-embedding-3-small (1536 dims).

    Args:
        texts: Strings to embed. Keep batches ≤ EMBED_BATCH_SIZE; the caller
               is responsible for batching when passing large lists directly.

    Returns:
        List of float vectors, one per input string, in the same order.
    """
    response = _client.embeddings.create(model=EMBED_MODEL, input=texts)
    return [item.embedding for item in response.data]


# ---------------------------------------------------------------------------
# Step 3 — Ingest
# ---------------------------------------------------------------------------

def ingest_document(session: Session, body: DocumentIngest) -> DocumentPublic:
    """
    Full ingest pipeline for a single text document:
      1. Persist a Document row.
      2. Chunk the full text.
      3. Embed chunks in batches.
      4. Persist Chunk rows with embeddings.

    Args:
        session: Active SQLModel session (caller owns commit/rollback).
        body:    Validated DocumentIngest request — title, source, full_text, and
                 optional page_type, benefit_name, country, doc_metadata.

    Returns:
        DocumentPublic with id, metadata, and chunk_count.
    """
    doc = Document(
        title=body.title,
        source=body.source,
        full_text=body.full_text,
        page_type=body.page_type,
        benefit_name=body.benefit_name,
        country=body.country,
        doc_metadata=body.doc_metadata,
    )
    session.add(doc)
    session.flush()  # assigns doc.id without committing the transaction

    chunks = chunk_text(body.full_text)
    if not chunks:
        session.commit()
        return DocumentPublic(**doc.model_dump(), chunk_count=0)

    # Embed in batches to stay within OpenAI rate limits
    all_embeddings: list[list[float]] = []
    for i in range(0, len(chunks), EMBED_BATCH_SIZE):
        batch = chunks[i : i + EMBED_BATCH_SIZE]
        all_embeddings.extend(embed_texts(batch))

    for idx, (chunk_str, embedding) in enumerate(zip(chunks, all_embeddings)):
        session.add(
            Chunk(
                document_id=doc.id,
                chunk_index=idx,
                chunk_text=chunk_str,
                token_count=len(chunk_str.split()),
                embedding=embedding,
                page_type=body.page_type,
                benefit_name=body.benefit_name,
                country=body.country,
            )
        )

    session.commit()
    session.refresh(doc)
    return DocumentPublic(**doc.model_dump(), chunk_count=len(chunks))


# ---------------------------------------------------------------------------
# Step 4 — Retrieve
# ---------------------------------------------------------------------------

def retrieve_chunks(
    session: Session,
    question: str,
    top_k: int = 5,
    country: str | None = None,
    benefit_name: str | None = None,
) -> list[ChunkResult]:
    query_vector = embed_texts([question])[0]
    distance = Chunk.embedding.cosine_distance(query_vector)

    stmt = (
        select(
            Chunk.id.label("chunk_id"),
            Chunk.chunk_text,
            Chunk.benefit_name,
            Chunk.country,
            Document.id.label("document_id"),
            Document.title,
            Document.source,
            distance.label("distance"),
        )
        .join(Document, Chunk.document_id == Document.id)
        .where(Chunk.embedding.is_not(None))
    )

    if country:
        stmt = stmt.where(Chunk.country == country)

    if benefit_name:
        stmt = stmt.where(Chunk.benefit_name == benefit_name)

    stmt = stmt.order_by(distance).limit(top_k)

    rows = session.exec(stmt).all()

    return [
        ChunkResult(
            chunk_text=r.chunk_text,
            document_id=r.document_id,
            title=r.title,
            source=r.source,
            benefit_name=r.benefit_name,
            country=r.country,
            distance=round(float(r.distance), 4),
        )
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Step 5 — Answer
# ---------------------------------------------------------------------------

def answer_question(
    session: Session,
    body: BenefitsQuestion,
    model: str | None = None,
) -> BenefitsAnswer:
    """
    Full RAG answer: retrieve relevant chunks then generate a grounded response.

    Args:
        session: Active SQLModel session.
        body:    Validated BenefitsQuestion — question, top_k, country, benefit_name.
        model:   OpenAI model override; defaults to settings.OPENAI_MODEL.

    Returns:
        BenefitsAnswer with answer text, deduplicated sources, and chunks_used count.
    """
    llm_model = model or settings.OPENAI_MODEL or "gpt-4o-mini"

    chunks = retrieve_chunks(
        session,
        body.question,
        top_k=body.top_k,
        country=body.country,
        benefit_name=body.benefit_name,
    )

    if not chunks:
        return BenefitsAnswer(
            answer="I don't have information about that in the knowledge base yet.",
            sources=[],
            chunks_used=0,
        )

    context = "\n\n".join(
        f"[{i + 1}] {c.title}\n{c.chunk_text}"
        for i, c in enumerate(chunks)
    )

    prompt = (
        "You are a UK benefits advisor. Answer the user's question using ONLY the context "
        "provided below. If the answer is not covered by the context, say you are not sure "
        "rather than guessing. Be concise, clear, and include key eligibility details when "
        "present.\n\n"
        f"Question: {body.question}\n\n"
        f"Context:\n{context}"
    )

    response = _client.responses.create(model=llm_model, input=prompt)

    # Deduplicate sources while preserving order
    seen: set[str] = set()
    sources: list[SourceRef] = []
    for c in chunks:
        if c.source not in seen:
            seen.add(c.source)
            sources.append(SourceRef(
                title=c.title,
                source=c.source,
                benefit_name=c.benefit_name,
            ))

    return BenefitsAnswer(
        answer=response.output_text.strip(),
        sources=sources,
        chunks_used=len(chunks),
    )


# ---------------------------------------------------------------------------
# Delete document
# ---------------------------------------------------------------------------

def delete_document(session: Session, document_id: uuid.UUID) -> bool:
    """
    Remove a document and all its chunks from the knowledge base.

    Args:
        session:     Active SQLModel session.
        document_id: UUID of the document to delete.

    Returns:
        True if the document was found and deleted, False if not found.
    """
    doc = session.get(Document, document_id)
    if not doc:
        return False

    chunks = session.exec(
        select(Chunk).where(Chunk.document_id == document_id)
    ).all()
    for chunk in chunks:
        session.delete(chunk)

    session.delete(doc)
    session.commit()
    return True

if __name__ == "__main__":
    import json 
    
    question = "What are the eligibility criteria for Universal Credit?"
    
    try:
        embeddings = embed_texts([question])
        print(json.dumps(embeddings, indent=2))
    except Exception as e:
        print(f"Error embedding text: {e}")