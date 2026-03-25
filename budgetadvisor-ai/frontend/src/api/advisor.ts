import type { AgentChart } from "@/components/budget-advisor/types";
import { apiClient } from "./client";

export interface AdvisorResponse {
  text: string;
  chart?: AgentChart | null;
}

export async function sendAdvisorMessage(message: string): Promise<AdvisorResponse> {
  const { data } = await apiClient.post<AdvisorResponse>("/advisor/chat", { message });
  return data;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "recording.webm");
  const { data } = await apiClient.post<{ transcription: string }>(
    "/advisor/speech-to-text",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.transcription;
}
