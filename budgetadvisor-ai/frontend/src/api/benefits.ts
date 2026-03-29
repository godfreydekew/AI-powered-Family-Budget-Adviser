import { apiClient } from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SourceRef {
  title: string;
  source: string;
  benefit_name: string | null;
}

export interface BenefitsAnswer {
  answer: string;
  sources: SourceRef[];
  chunks_used: number;
}

export interface DocumentPublic {
  id: string;
  title: string;
  source: string;
  page_type: string | null;
  benefit_name: string | null;
  country: string;
  doc_metadata: Record<string, unknown> | null;
  created_at: string | null;
  chunk_count: number;
}

export interface DocumentsPublic {
  data: DocumentPublic[];
  count: number;
}

export interface DocumentIngest {
  title: string;
  source: string;
  full_text: string;
  page_type?: string;
  benefit_name?: string;
  country?: string;
  doc_metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// User endpoints
// ---------------------------------------------------------------------------

export async function askBenefitsQuestion(
  question: string,
  options?: { top_k?: number; country?: string; benefit_name?: string },
): Promise<BenefitsAnswer> {
  const { data } = await apiClient.post<BenefitsAnswer>("/benefits/ask", {
    question,
    top_k: options?.top_k ?? 5,
    country: options?.country ?? null,
    benefit_name: options?.benefit_name ?? null,
  });
  return data;
}

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

export async function listBenefitsDocuments(
  skip = 0,
  limit = 50,
): Promise<DocumentsPublic> {
  const { data } = await apiClient.get<DocumentsPublic>("/benefits/documents", {
    params: { skip, limit },
  });
  return data;
}

export async function getBenefitsDocument(id: string): Promise<DocumentPublic> {
  const { data } = await apiClient.get<DocumentPublic>(`/benefits/documents/${id}`);
  return data;
}

export async function ingestBenefitsDocument(
  body: DocumentIngest,
): Promise<DocumentPublic> {
  const { data } = await apiClient.post<DocumentPublic>("/benefits/documents", body);
  return data;
}

export async function deleteBenefitsDocument(id: string): Promise<void> {
  await apiClient.delete(`/benefits/documents/${id}`);
}
