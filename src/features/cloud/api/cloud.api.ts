import { apiClient } from "@/lib/api-client";

import type {
  CloudConfiguration,
  CloudListResponse,
  CreateCloudRequest,
  GetCloudParams,
  UpdateCloudRequest,
} from "../types/clouds.types";

export async function getCloudConfigurations({
  page,
  size,
  search,
}: GetCloudParams): Promise<CloudListResponse> {
  const response =
    await apiClient.get<CloudListResponse>(
      "/clouds",
      {
        params: {
          page,
          size,
          search: search || undefined,
        },
      },
    );

  return response.data;
}

export async function createCloudConfiguration(
  payload: CreateCloudRequest,
): Promise<CloudConfiguration> {
  const response =
    await apiClient.post<CloudConfiguration>(
      "/clouds",
      payload,
    );

  return response.data;
}

export async function updateCloudConfiguration(
  id: number,
  payload: UpdateCloudRequest,
): Promise<CloudConfiguration> {
  const response =
    await apiClient.put<CloudConfiguration>(
      `/clouds/${id}`,
      payload,
    );

  return response.data;
}

export async function deleteCloudConfiguration(
  id: number,
): Promise<void> {
  await apiClient.delete(`/clouds/${id}`);
}
