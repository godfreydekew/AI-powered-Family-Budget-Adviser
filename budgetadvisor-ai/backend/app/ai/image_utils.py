"""
Image handling: MIME detection, base64 encoding, size validation.
These utilities are scanner-agnostic — every AI path uses them.
"""
import base64

SUPPORTED_MIME_TYPES: dict[str, str] = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".heic": "image/heic",
    ".heif": "image/heif",
}

MAX_FILE_BYTES = 20 * 1024 * 1024  # 20 MB


def get_mime_type(filename: str) -> str:
    ext = f".{filename.lower().rsplit('.', 1)[-1]}"
    mime = SUPPORTED_MIME_TYPES.get(ext)
    if not mime:
        raise ValueError(
            f"Unsupported file type '{ext}'. "
            f"Accepted: {', '.join(SUPPORTED_MIME_TYPES)}"
        )
    return mime


def encode_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


def build_data_uri(image_bytes: bytes, mime_type: str) -> str:
    return f"data:{mime_type};base64,{encode_to_base64(image_bytes)}"


def validate_size(image_bytes: bytes) -> None:
    if len(image_bytes) > MAX_FILE_BYTES:
        mb = len(image_bytes) / (1024 * 1024)
        raise ValueError(f"File {mb:.1f} MB exceeds the 20 MB limit.")
