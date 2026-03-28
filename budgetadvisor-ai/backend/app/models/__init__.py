from sqlmodel import SQLModel

from app.models.admin import Admin, AdminCreate, AdminPublic
from app.models.category import Category, CategoryCreate, CategoryPublic
from app.models.chat import Chat, ChatCreate, ChatMessage, ChatMessageCreate
from app.models.common import Message, NewPassword, Token, TokenPayload
from app.models.merchant import Merchant, MerchantCreate, MerchantPublic
from app.models.ocr_processing_log import OcrProcessingLog, OcrProcessingLogCreate
from app.models.receipt import (
    Receipt,
    ReceiptCreate,
    ReceiptPublic,
    ReceiptsPublic,
    ReceiptWithItemsPublic,
)
from app.models.receipt_item import (
    ReceiptItem,
    ReceiptItemCreate,
    ReceiptItemPublic,
    ReceiptItemUpdate,
)
from app.models.receipt_scan import (
    LineItemExtraction,
    MerchantExtraction,
    ReceiptConfirmRequest,
    ReceiptExtraction,
    SavingsExtraction,
    TransactionExtraction,
    extraction_to_item_creates,
    extraction_to_merchant_create,
    extraction_to_receipt_create,
)
from app.models.user import (
    UpdatePassword,
    User,
    UserBase,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.models.user_session import UserSession, UserSessionCreate
from app.models.rag import (
    Chunk,
    ChunkBase,
    Document,
    DocumentBase,
)

__all__ = [
    "SQLModel",
    # User
    "User",
    "UserBase",
    "UserCreate",
    "UserRegister",
    "UserUpdate",
    "UserUpdateMe",
    "UpdatePassword",
    "UserPublic",
    "UsersPublic",
    # Admin
    "Admin",
    "AdminCreate",
    "AdminPublic",
    # Merchant
    "Merchant",
    "MerchantCreate",
    "MerchantPublic",
    # Receipt
    "Receipt",
    "ReceiptCreate",
    "ReceiptPublic",
    "ReceiptsPublic",
    "ReceiptWithItemsPublic",
    # ReceiptItem
    "ReceiptItem",
    "ReceiptItemCreate",
    "ReceiptItemPublic",
    "ReceiptItemUpdate",
    # Category
    "Category",
    "CategoryCreate",
    "CategoryPublic",
    # OcrProcessingLog
    "OcrProcessingLog",
    "OcrProcessingLogCreate",
    # Receipt scan schemas (LLM extraction + confirm request)
    "MerchantExtraction",
    "TransactionExtraction",
    "LineItemExtraction",
    "SavingsExtraction",
    "ReceiptExtraction",
    "ReceiptConfirmRequest",
    "extraction_to_merchant_create",
    "extraction_to_receipt_create",
    "extraction_to_item_creates",
    # UserSession
    "UserSession",
    "UserSessionCreate",
    # Chat
    "Chat",
    "ChatCreate",
    "ChatMessage",
    "ChatMessageCreate",
    # RAG
    "Document",
    "DocumentBase",
    "Chunk",
    "ChunkBase",
    # Common
    "Message",
    "Token",
    "TokenPayload",
    "NewPassword",
    
]
