"""
FastAPI dependency that provides the active ReceiptScanner.

Changing the AI backend only requires editing this file.
All routes call get_scanner() and receive a ReceiptScanner — they never
import a concrete implementation.
"""

from functools import lru_cache

from fastapi import HTTPException, status

from app.ai.base import ReceiptScanner
from app.ai.openai_vision import OpenAIVisionScanner
from app.core.config import settings


@lru_cache
def _build_scanner() -> ReceiptScanner:
    """
    Build and cache the scanner singleton.

    To switch to a different AI backend:
      return OllamaVisionScanner(model="qwen2.5vl:7b")
      return HuaweiPanguScanner(api_key=settings.HUAWEI_API_KEY)
    """
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set. Add it to your .env file.")
    return OpenAIVisionScanner(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
    )


def get_scanner() -> ReceiptScanner:
    """FastAPI dependency — inject into route handlers."""
    try:
        return _build_scanner()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
