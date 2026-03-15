"""
Receipt scanning endpoints.

Two-step flow (required by system design — never collapse into one):
  POST /receipts/scan     → AI scans image, returns preview JSON. NOTHING is saved.
  POST /receipts/confirm  → User-reviewed data is saved to DB.
"""
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlmodel import Session, select

from app.ai.base import ScanError
from app.ai.base import ReceiptScanner
from app.ai.deps import get_scanner
from app.ai.image_utils import get_mime_type, validate_size
from app.ai.openai_vision import ScanTimer
from app.models.receipt_scan import (
    ReceiptConfirmRequest,
    ReceiptExtraction,
    extraction_to_item_creates,
    extraction_to_merchant_create,
    extraction_to_receipt_create,
)
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Merchant,
    OcrProcessingLog,
    Receipt,
    ReceiptItem,
    ReceiptWithItemsPublic,
)

router = APIRouter(prefix="/receipts", tags=["receipts"])


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
        1 for item in extraction.items
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
    import json

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

    # --- Build response using existing public models ---
    from app.models.receipt_item import ReceiptItemPublic
    from app.models.receipt import ReceiptWithItemsPublic as _RWI

    item_publics = [ReceiptItemPublic.model_validate(i) for i in items]
    result = _RWI.model_validate(receipt)
    result.items = item_publics  # type: ignore[assignment]
    return result
