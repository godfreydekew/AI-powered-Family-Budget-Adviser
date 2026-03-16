"""
Receipt endpoints.

Scan flow (two-step, never collapse):
  POST /receipts/scan     → AI scans image, returns preview JSON. NOTHING is saved.
  POST /receipts/confirm  → User-reviewed data is saved to DB.

Read endpoints:
  GET  /receipts          → List all receipts for the current user (with items).
  GET  /receipts/{id}     → Single receipt with items.
"""

import uuid
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlmodel import col, delete, select

from app.ai.base import ReceiptScanner, ScanError
from app.ai.deps import get_scanner
from app.ai.image_utils import get_mime_type, validate_size
from app.ai.openai_vision import ScanTimer
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Merchant,
    Message,
    OcrProcessingLog,
    Receipt,
    ReceiptItem,
    ReceiptItemPublic,
    ReceiptWithItemsPublic,
)
from app.models.receipt_scan import (
    ReceiptConfirmRequest,
    ReceiptExtraction,
    extraction_to_item_creates,
    extraction_to_merchant_create,
    extraction_to_receipt_create,
)

router = APIRouter(prefix="/receipts", tags=["receipts"])


def _build_receipt_with_items(
    receipt: Receipt, items: list[ReceiptItem]
) -> ReceiptWithItemsPublic:
    data = receipt.model_dump()
    data["items"] = [ReceiptItemPublic.model_validate(i) for i in items]
    return ReceiptWithItemsPublic.model_validate(data)


# ---------------------------------------------------------------------------
# GET /receipts
# ---------------------------------------------------------------------------


@router.get("", response_model=list[ReceiptWithItemsPublic])
def list_receipts(
    current_user: CurrentUser,
    session: SessionDep,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """Return all receipts for the authenticated user, newest first."""
    receipts_list = session.exec(
        select(Receipt)
        .where(Receipt.user_id == current_user.id)
        .order_by(Receipt.created_at.desc())  # type: ignore[arg-type]
        .offset(skip)
        .limit(limit)
    ).all()

    if not receipts_list:
        return []

    # Fetch all items in a single query to avoid N+1
    receipt_ids = [r.id for r in receipts_list]
    all_items = session.exec(
        select(ReceiptItem).where(col(ReceiptItem.receipt_id).in_(receipt_ids))
    ).all()

    items_by_receipt: dict[uuid.UUID, list[ReceiptItem]] = defaultdict(list)
    for item in all_items:
        items_by_receipt[item.receipt_id].append(item)

    return [_build_receipt_with_items(r, items_by_receipt[r.id]) for r in receipts_list]


# ---------------------------------------------------------------------------
# GET /receipts/{receipt_id}
# ---------------------------------------------------------------------------


@router.get("/{receipt_id}", response_model=ReceiptWithItemsPublic)
def get_receipt(
    receipt_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep,
) -> Any:
    """Return a single receipt with all its line items."""
    receipt = session.get(Receipt, receipt_id)
    if not receipt or receipt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Receipt not found.")

    items = session.exec(
        select(ReceiptItem).where(col(ReceiptItem.receipt_id) == receipt_id)
    ).all()

    return _build_receipt_with_items(receipt, list(items))


# ---------------------------------------------------------------------------
# DELETE /receipts/{receipt_id}
# ---------------------------------------------------------------------------


@router.delete("/{receipt_id}", response_model=Message)
def delete_receipt(
    receipt_id: uuid.UUID,
    current_user: CurrentUser,
    session: SessionDep,
) -> Message:
    """Delete a receipt owned by the current user and its related item rows."""
    receipt = session.get(Receipt, receipt_id)
    if not receipt or receipt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Receipt not found.")

    # Break log -> receipt references first, then remove child receipt items.
    logs = session.exec(
        select(OcrProcessingLog).where(col(OcrProcessingLog.receipt_id) == receipt_id)
    ).all()
    for log in logs:
        log.receipt_id = None
        session.add(log)

    session.exec(delete(ReceiptItem).where(col(ReceiptItem.receipt_id) == receipt_id))
    session.flush()

    session.delete(receipt)
    session.commit()

    return Message(message="Receipt deleted successfully")


# ---------------------------------------------------------------------------
# POST /receipts/scan
# ---------------------------------------------------------------------------


@router.post("/scan", response_model=ReceiptExtraction)
async def scan_receipt(
    file: UploadFile,
    current_user: CurrentUser,
    session: SessionDep,
    scanner: ReceiptScanner = Depends(get_scanner),
) -> Any:
    """
    Upload a receipt image and receive structured extraction data.

    The response is a preview for the user to review — NOTHING is saved to
    the database at this stage.
    """
    # --- Validate file ---
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    try:
        mime_type = get_mime_type(file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    image_bytes = await file.read()
    try:
        validate_size(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # --- Scan ---
    timer = ScanTimer()
    log = OcrProcessingLog(
        user_id=current_user.id,
        scan_method=scanner.scan_method,
        status="failed",  # updated on success
        image_path=None,
    )
    session.add(log)
    session.commit()
    session.refresh(log)

    try:
        extraction = await scanner.scan(image_bytes, mime_type)
    except ScanError as exc:
        log.status = "failed"
        log.error_message = str(exc)
        log.processing_ms = timer.elapsed_ms()
        session.add(log)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Receipt scanning failed: {exc}",
        ) from exc

    # Update log — success, no receipt_id yet (not confirmed)
    flagged = sum(
        1
        for item in extraction.items
        if item.category == "other" or item.line_total is None
    )
    log.status = "success"
    log.processing_ms = timer.elapsed_ms()
    log.flagged_items_count = flagged
    session.add(log)
    session.commit()
    session.refresh(log)

    # Return extraction with log_id embedded so the confirm step can link them
    # We return the extraction directly; log.id is passed back via a custom header
    # so the frontend can include it in the confirm request.

    from fastapi.responses import JSONResponse

    body = extraction.model_dump()
    body["_log_id"] = str(log.id)  # non-breaking extra field for confirm step

    return JSONResponse(content=body)


# ---------------------------------------------------------------------------
# POST /receipts/confirm
# ---------------------------------------------------------------------------


@router.post("/confirm", response_model=ReceiptWithItemsPublic, status_code=201)
def confirm_receipt(
    body: ReceiptConfirmRequest,
    current_user: CurrentUser,
    session: SessionDep,
) -> Any:
    """
    Save a reviewed (and optionally edited) receipt extraction to the database.

    Creates rows in: merchants (if new), receipts, receipt_items.
    Updates the related ocr_processing_log with the receipt_id.
    """
    extraction = body.extraction

    # --- 1. Find or create Merchant ---
    merchant_id: uuid.UUID | None = None
    merchant_create = extraction_to_merchant_create(extraction.merchant)

    if merchant_create and merchant_create.name:
        existing = session.exec(
            select(Merchant).where(Merchant.name == merchant_create.name)
        ).first()

        if existing:
            merchant_id = existing.id
        else:
            merchant = Merchant.model_validate(merchant_create)
            session.add(merchant)
            session.flush()  # get id without full commit
            merchant_id = merchant.id

    # --- 2. Create Receipt ---
    receipt_create = extraction_to_receipt_create(
        extraction=extraction,
        user_id=current_user.id,
        merchant_id=merchant_id,
        scan_method=body.scan_method,
        image_path=body.image_path,
    )
    receipt = Receipt.model_validate(receipt_create)
    receipt.confirmed_at = datetime.now(timezone.utc)
    session.add(receipt)
    session.flush()  # get id for items

    # --- 3. Create ReceiptItems ---
    item_creates = extraction_to_item_creates(
        items=extraction.items,
        receipt_id=receipt.id,
        user_id=current_user.id,
    )
    items = [ReceiptItem.model_validate(ic) for ic in item_creates]
    session.add_all(items)

    # --- 4. Link log to receipt ---
    if body.log_id:
        log = session.get(OcrProcessingLog, body.log_id)
        if log and log.user_id == current_user.id:
            log.receipt_id = receipt.id
            session.add(log)

    session.commit()
    session.refresh(receipt)

    return _build_receipt_with_items(receipt, items)
