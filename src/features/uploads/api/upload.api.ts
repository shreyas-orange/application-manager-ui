import { apiClient } from "@/lib/api-client";

import type {
  GetUploadsParams,
  UploadFileResponse,
  UploadListResponse,
} from "../types/upload.types";

export async function uploadApplicationFiles(
  files: File[],
): Promise<UploadFileResponse[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response =
    await apiClient.post<UploadFileResponse[]>(
      "/uploads",
      formData,
    );

  return response.data;
}

export async function getUploadedFiles(
  params: GetUploadsParams,
): Promise<UploadListResponse> {
  const response =
    await apiClient.get<UploadListResponse>(
      "/uploads",
      {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search:
            params.search?.trim() || undefined,
        },
      },
    );

  return response.data;
}

export async function updateUploadedFile(
  uploadId: number,
  file: File,
): Promise<UploadFileResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await apiClient.put<UploadFileResponse>(
      `/uploads/${uploadId}`,
      formData,
    );

  return response.data;
}

export async function deleteUploadedFile(
  uploadId: number,
): Promise<void> {
  await apiClient.delete(
    `/uploads/${uploadId}`,
  );
}