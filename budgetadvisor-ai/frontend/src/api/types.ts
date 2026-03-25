// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string; // OAuth2 form field name (maps to email)
  password: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  country_code: string;
  preferred_currency: string;
  monthly_budget: number | null;
  household_size: number;
  is_active: boolean;
  is_superuser: boolean;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  country_code?: string;
  preferred_currency?: string;
  monthly_budget?: number;
  household_size?: number;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  country_code?: string;
  preferred_currency?: string;
  monthly_budget?: number;
  household_size?: number;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordRecoveryRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ---------------------------------------------------------------------------
// Receipts — mirrors app/models/receipt_scan.py and app/models/receipt*.py
// ---------------------------------------------------------------------------

export interface MerchantExtraction {
  name: string | null;
  type: string | null;
  country_code: string | null;
}

export interface TransactionExtraction {
  date: string | null;   // YYYY-MM-DD
  time: string | null;   // HH:MM
  currency: string;      // ISO 4217, default GBP
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
}

export interface LineItemExtraction {
  raw_description: string;
  clean_description: string | null;
  category: string;
  quantity: number;
  unit_price: number | null;
  line_total: number | null;
  on_promotion: boolean;
  promotion_saving: number | null;
}

export interface SavingsExtraction {
  total_promotions: number;
  total_saved: number;
}

export interface ReceiptExtraction {
  merchant: MerchantExtraction;
  transaction: TransactionExtraction;
  items: LineItemExtraction[];
  savings: SavingsExtraction;
}

/** What the scan endpoint returns — ReceiptExtraction + the log id for linking */
export interface ReceiptScanResponse extends ReceiptExtraction {
  _log_id?: string;
}

export interface ReceiptConfirmRequest {
  extraction: ReceiptExtraction;
  scan_method: string;
  image_path: string | null;
  log_id: string | null;
}

export interface ReceiptItemPublic {
  id: string;
  receipt_id: string;
  user_id: string;
  raw_description: string;
  clean_description: string | null;
  category: string;
  quantity: number;
  unit_price: number | null;
  line_total: number | null;
  on_promotion: boolean;
  promotion_saving: number | null;
  user_edited: boolean;
  created_at: string | null;
}

export interface ReceiptPublic {
  id: string;
  user_id: string;
  merchant_id: string | null;
  merchant_name_raw: string | null;
  transaction_date: string | null;
  transaction_time: string | null;
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  currency: string;
  total_promotions: number;
  total_saved: number;
  item_count: number | null;
  scan_method: string;
  image_path: string | null;
  status: string;
  user_notes: string | null;
  scanned_at: string | null;
  confirmed_at: string | null;
  created_at: string | null;
}

export interface ReceiptWithItems extends ReceiptPublic {
  items: ReceiptItemPublic[];
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface DashboardStats {
  this_month: number;
  budget: number | null;
  budget_percent: number;
  saved: number;
  receipt_count: number;
}

export interface CategoryBreakdownItem {
  key: string;
  label: string;
  amount: number;
  color: string;
  percent: number;
}

export interface WeeklyTrendItem {
  week: string;
  amount: number;
}

export interface TopMerchant {
  name: string;
  visits: number;
  total: number;
  avg: number;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminStats {
  total_users: number;
  receipts_today: number;
  failed_scans: number;
  active_users_7d: number;
}

export interface ReceiptsPerDayItem {
  day: string;
  count: number;
}

export interface OcrLogPublic {
  id: string;
  user_email: string | null;
  scan_method: string;
  status: string;
  llm_model_used: string | null;
  processing_ms: number | null;
  flagged_items_count: number;
  error_message: string | null;
  created_at: string | null;
}

export interface OcrLogsPublic {
  data: OcrLogPublic[];
  count: number;
}

export interface UsersPublic {
  data: User[];
  count: number;
}

// ---------------------------------------------------------------------------
// Generic
// ---------------------------------------------------------------------------

export interface ApiMessage {
  message: string;
}

export interface ApiError {
  detail: string;
}
