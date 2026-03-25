import { apiClient } from "./client";
import type { User, UpdateProfileRequest, UpdatePasswordRequest, ApiMessage } from "./types";

/**
 * Get the currently authenticated user's profile.
 */
export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/users/me");
  return data;
}

/**
 * Update the current user's profile fields.
 */
export async function updateMe(payload: UpdateProfileRequest): Promise<User> {
  const { data } = await apiClient.patch<User>("/users/me", payload);
  return data;
}

/**
 * Change the current user's password.
 * Requires the existing password for verification.
 */
export async function updatePassword(
  payload: UpdatePasswordRequest
): Promise<ApiMessage> {
  const { data } = await apiClient.patch<ApiMessage>(
    "/users/me/password",
    payload
  );
  return data;
}

/**
 * Permanently delete the current user's account and all data.
 */
export async function deleteAccount(): Promise<ApiMessage> {
  const { data } = await apiClient.delete<ApiMessage>("/users/me");
  return data;
}
