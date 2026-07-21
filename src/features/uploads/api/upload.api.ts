import { apiClient } from "@/lib/api-client";
import type { UploadFileResponse } from "../types/upload.types";

export async function uploadApplicationFile(
  file: File,
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<UploadFileResponse>(
      "/uploads",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.detail ??
      error?.response?.data?.message ??
      "Unable to upload the file."
    );
  }
}