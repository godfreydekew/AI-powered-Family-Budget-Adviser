import type { AxiosError } from "axios";

interface ApiErrorResponse {
  detail?: string | { msg: string }[];
}

/**
 * Extracts a human-readable error message from an API error.
 * Handles FastAPI validation errors, plain detail strings, and network failures.
 */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (axiosError?.response?.data?.detail) {
    const detail = axiosError.response.data.detail;

    // FastAPI validation error array
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(". ");
    }

    return String(detail);
  }

  if (axiosError?.message === "Network Error") {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  if (axiosError?.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  return fallback;
}
