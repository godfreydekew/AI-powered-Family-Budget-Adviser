"""
Abstract scanner interface.

Any AI backend (OpenAI, Ollama, Huawei Pangu) must implement this.
The rest of the application only depends on this contract — never on a
concrete implementation — so swapping models requires zero route changes.
"""
from abc import ABC, abstractmethod

from app.models.receipt_scan import ReceiptExtraction


class ReceiptScanner(ABC):
    """Strategy interface for receipt scanning."""

    @property
    @abstractmethod
    def scan_method(self) -> str:
        """
        Identifier stored in the DB on every scan.
        Must be one of: 'vision', 'ocr_llm'
        """

    @abstractmethod
    async def scan(self, image_bytes: bytes, mime_type: str) -> ReceiptExtraction:
        """
        Parse a receipt image and return structured extraction data.

        Args:
            image_bytes: Raw bytes of the uploaded image.
            mime_type:   MIME type string (e.g. 'image/jpeg').

        Returns:
            ReceiptExtraction — the parsed receipt data.

        Raises:
            ScanError: if the model fails or returns invalid data.
        """


class ScanError(Exception):
    """Raised when a scanner implementation cannot parse the receipt."""
