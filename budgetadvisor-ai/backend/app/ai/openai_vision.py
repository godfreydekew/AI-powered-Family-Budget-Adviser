"""
OpenAI Vision implementation of ReceiptScanner.

Uses the Responses API with structured outputs:
  client.responses.parse(..., text_format=ReceiptExtraction)

Temperature is fixed at 0 — receipt parsing must be deterministic.
"""

import time

import openai
from openai import OpenAI

from app.ai.base import ReceiptScanner, ScanError
from app.ai.image_utils import build_data_uri
from app.ai.prompts import VISION_SYSTEM_PROMPT, VISION_USER_PROMPT
from app.models.receipt_scan import ReceiptExtraction


class OpenAIVisionScanner(ReceiptScanner):
    """
    Parses receipt images using OpenAI Vision + Structured Outputs.

    To swap this for Ollama or Huawei:
      1. Create a new class that extends ReceiptScanner
      2. Register it in deps.py
      3. No route code changes needed
    """

    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        self._client = OpenAI(api_key=api_key)
        self._model = model

    @property
    def scan_method(self) -> str:
        return "vision"

    async def scan(self, image_bytes: bytes, mime_type: str) -> ReceiptExtraction:
        data_uri = build_data_uri(image_bytes, mime_type)

        try:
            response = self._client.responses.parse(
                model=self._model,
                input=[
                    {"role": "system", "content": VISION_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": VISION_USER_PROMPT},
                            {"type": "input_image", "image_url": data_uri},
                        ],
                    },
                ],
                text_format=ReceiptExtraction,
            )
        except openai.OpenAIError as exc:
            raise ScanError(f"OpenAI API error: {exc}") from exc

        parsed = response.output_parsed
        if parsed is None:
            raise ScanError("OpenAI returned an empty or unparseable response.")

        return parsed


# ---------------------------------------------------------------------------
# Timing helper used by the route to record processing_ms
# ---------------------------------------------------------------------------


class ScanTimer:
    def __init__(self) -> None:
        self._start = time.monotonic()

    def elapsed_ms(self) -> int:
        return int((time.monotonic() - self._start) * 1000)
