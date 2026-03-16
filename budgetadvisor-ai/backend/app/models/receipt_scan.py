"""
Schemas for the two-step receipt scanning flow.

These combine data from the existing DB models (Merchant, Receipt, ReceiptItem)
into the nested structure the LLM returns and the client reviews.

- ReceiptExtraction      — LLM output / client scan preview
- ReceiptConfirmRequest  — client request to persist after review
- Mapper functions       — convert extraction → existing DB Create models
"""

import uuid
from datetime import date, time

from pydantic import BaseModel, Field

from app.models.merchant import MerchantCreate
from app.models.receipt import ReceiptCreate
from app.models.receipt_item import ReceiptItemCreate

# ---------------------------------------------------------------------------
# LLM structured output schemas  (pure Pydantic — no SQLModel noise)
# Fields mirror the DB models so the LLM can populate them directly.
# ---------------------------------------------------------------------------


class MerchantExtraction(BaseModel):
    """Maps to Merchant / MerchantCreate."""

    name: str | None = None
    type: str | None = Field(
        default=None,
        description="supermarket | convenience_store | market | online | pharmacy | other",
    )
    country_code: str | None = Field(default=None, description="ISO 3166-1 alpha-2")


class TransactionExtraction(BaseModel):
    """Maps to Receipt / ReceiptCreate date/amount fields."""

    date: str | None = Field(default=None, description="YYYY-MM-DD")
    time: str | None = Field(default=None, description="HH:MM")
    currency: str = Field(default="GBP", description="ISO 4217")
    subtotal: float | None = None
    tax_amount: float | None = None
    total_amount: float | None = None


class LineItemExtraction(BaseModel):
    """Maps to ReceiptItem / ReceiptItemCreate fields."""

    raw_description: str = Field(description="Exact text from receipt, never modified")
    clean_description: str | None = None
    category: str = Field(
        default="other",
        description=(
            "dairy | meat | bakery | fresh_produce | processed_foods "
            "| household | personal_care | alcohol | other"
        ),
    )
    quantity: float = 1.0
    unit_price: float | None = None
    line_total: float | None = None
    on_promotion: bool = False
    promotion_saving: float | None = Field(
        default=None,
        description="Positive number — e.g. 0.80 not -0.80",
    )


class SavingsExtraction(BaseModel):
    """Maps to Receipt.total_promotions / total_saved."""

    total_promotions: float = 0.0
    total_saved: float = 0.0


class ReceiptExtraction(BaseModel):
    """
    Root object returned by the LLM and sent to the client as the scan preview.
    Combines Merchant + Receipt header + ReceiptItems + savings into one
    nested structure the user can review and edit before confirming.
    """

    merchant: MerchantExtraction
    transaction: TransactionExtraction
    items: list[LineItemExtraction]
    savings: SavingsExtraction


# ---------------------------------------------------------------------------
# API request for the confirm step
# ---------------------------------------------------------------------------


class ReceiptConfirmRequest(BaseModel):
    """
    Sent by the client after the user reviews (and optionally edits) the preview.
    Contains the (possibly edited) extraction plus metadata from the original scan.
    """

    extraction: ReceiptExtraction
    scan_method: str = "vision"  # 'vision' | 'ocr_llm'
    image_path: str | None = None  # relative path stored in object storage
    log_id: uuid.UUID | None = None  # OcrProcessingLog.id — linked after confirm


# ---------------------------------------------------------------------------
# Mappers: extraction → existing DB Create models
# ---------------------------------------------------------------------------


def extraction_to_merchant_create(m: MerchantExtraction) -> MerchantCreate | None:
    if not m.name:
        return None
    return MerchantCreate(
        name=m.name,
        type=m.type,
        country_code=m.country_code,
    )


def extraction_to_receipt_create(
    extraction: ReceiptExtraction,
    user_id: uuid.UUID,
    merchant_id: uuid.UUID | None,
    scan_method: str,
    image_path: str | None,
) -> ReceiptCreate:
    tx = extraction.transaction
    transaction_date: date = date.today()
    transaction_time: time | None = None

    if tx.date:
        try:
            transaction_date = date.fromisoformat(tx.date)
        except ValueError:
            transaction_date = date.today()

    if tx.time:
        try:
            transaction_time = time.fromisoformat(tx.time)
        except ValueError:
            pass

    return ReceiptCreate(
        user_id=user_id,
        merchant_id=merchant_id,
        merchant_name_raw=extraction.merchant.name,
        transaction_date=transaction_date,
        transaction_time=transaction_time,
        currency=tx.currency,
        subtotal=tx.subtotal,
        tax_amount=tx.tax_amount,
        total_amount=tx.total_amount,
        total_promotions=extraction.savings.total_promotions,
        total_saved=extraction.savings.total_saved,
        item_count=len(extraction.items),
        scan_method=scan_method,
        image_path=image_path,
        status="confirmed",
    )


def extraction_to_item_creates(
    items: list[LineItemExtraction],
    receipt_id: uuid.UUID,
    user_id: uuid.UUID,
) -> list[ReceiptItemCreate]:
    return [
        ReceiptItemCreate(
            receipt_id=receipt_id,
            user_id=user_id,
            raw_description=item.raw_description,
            clean_description=item.clean_description,
            category=item.category,
            quantity=item.quantity,
            unit_price=item.unit_price,
            line_total=item.line_total,
            on_promotion=item.on_promotion,
            promotion_saving=item.promotion_saving,
        )
        for item in items
    ]
