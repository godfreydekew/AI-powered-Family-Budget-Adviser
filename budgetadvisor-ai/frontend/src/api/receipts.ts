import { apiClient } from "./client";
import type {
  ApiMessage,
  ReceiptConfirmRequest,
  ReceiptScanResponse,
  ReceiptWithItems,
} from "./types";

export async function getReceipts(): Promise<ReceiptWithItems[]> {
  const { data } = await apiClient.get<ReceiptWithItems[] | { data: ReceiptWithItems[] }>("/receipts");
  // Normalise: handle both a plain array and a paginated wrapper { data: [...] }
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { data: ReceiptWithItems[] }).data)) {
    return (data as { data: ReceiptWithItems[] }).data;
  }
  return [];
}

export async function getReceipt(id: string): Promise<ReceiptWithItems> {
  const { data } = await apiClient.get<ReceiptWithItems>(`/receipts/${id}`);
  return data;
}

export async function deleteReceipt(id: string): Promise<ApiMessage> {
  const { data } = await apiClient.delete<ApiMessage>(`/receipts/${id}`);
  return data;
}

/**
 * Step 1 — Upload image, get AI extraction preview.
 * Nothing is saved to the database at this point.
 */
export async function scanReceipt(file: File): Promise<ReceiptScanResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<ReceiptScanResponse>(
    "/receipts/scan",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/**
 * Step 2 — Persist the reviewed (and optionally edited) extraction.
 * Creates rows in merchants, receipts, and receipt_items tables.
 */
export async function confirmReceipt(
  payload: ReceiptConfirmRequest
): Promise<ReceiptWithItems> {
  const { data } = await apiClient.post<ReceiptWithItems>(
    "/receipts/confirm",
    payload
  );
  return data;
}
