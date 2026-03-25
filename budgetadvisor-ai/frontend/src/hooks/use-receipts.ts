import { useQuery } from "@tanstack/react-query";
import { getReceipts, getReceipt } from "@/api/receipts";

export const receiptKeys = {
  all: ["receipts"] as const,
  list: () => [...receiptKeys.all, "list"] as const,
  detail: (id: string) => [...receiptKeys.all, "detail", id] as const,
};

export function useReceipts() {
  return useQuery({
    queryKey: receiptKeys.list(),
    queryFn: getReceipts,
  });
}

export function useReceipt(id: string | undefined) {
  return useQuery({
    queryKey: receiptKeys.detail(id!),
    queryFn: () => getReceipt(id!),
    enabled: !!id,
  });
}
