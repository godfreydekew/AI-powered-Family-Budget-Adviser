import { apiClient } from "./client";
import type {
  AdminStats,
  OcrLogsPublic,
  ReceiptsPerDayItem,
  UsersPublic,
} from "./types";

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>("/admin/stats");
  return data;
}

export async function getAdminLogs(skip = 0, limit = 50): Promise<OcrLogsPublic> {
  const { data } = await apiClient.get<OcrLogsPublic>("/admin/logs", { params: { skip, limit } });
  return data;
}

export async function getReceiptsPerDay(): Promise<ReceiptsPerDayItem[]> {
  const { data } = await apiClient.get<ReceiptsPerDayItem[]>("/admin/receipts-per-day");
  return Array.isArray(data) ? data : [];
}

export async function getAdminUsers(skip = 0, limit = 100): Promise<UsersPublic> {
  const { data } = await apiClient.get<UsersPublic>("/users/", { params: { skip, limit } });
  return data;
}
