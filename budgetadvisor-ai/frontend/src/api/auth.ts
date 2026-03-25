import { apiClient, tokenStorage } from "./client";
import type { Token, LoginRequest, ApiMessage, ResetPasswordRequest } from "./types";

/**
 * Login — OAuth2 password flow.
 * Returns JWT token and stores it in localStorage.
 */
export async function login(email: string, password: string): Promise<Token> {
  const params = new URLSearchParams();
  params.append("username", email); // OAuth2 expects "username"
  params.append("password", password);

  const { data } = await apiClient.post<Token>("/login/access-token", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  tokenStorage.set(data.access_token);
  return data;
}

/**
 * Logout — clears token from localStorage.
 */
export function logout(): void {
  tokenStorage.clear();
}

/**
 * Register a new account.
 * Returns the new user object.
 */
export async function register(payload: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<import("./types").User> {
  const { data } = await apiClient.post("/users/signup", payload);
  return data;
}

/**
 * Send password recovery email.
 * Safe — always returns success regardless of whether email exists.
 */
export async function requestPasswordReset(email: string): Promise<ApiMessage> {
  const { data } = await apiClient.post<ApiMessage>(
    `/password-recovery/${encodeURIComponent(email)}`
  );
  return data;
}

/**
 * Reset password using the token from the recovery email.
 */
export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ApiMessage> {
  const { data } = await apiClient.post<ApiMessage>("/reset-password/", payload);
  return data;
}

/**
 * Verify the current token is still valid.
 * Returns the current user or throws on 401.
 */
export async function testToken(): Promise<import("./types").User> {
  const { data } = await apiClient.post("/login/test-token");
  return data;
}
