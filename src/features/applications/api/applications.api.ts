import { apiClient } from "@/lib/api-client";

import type {
  ApplicationsApiResponse,
  ApplicationsResponse,
  UpdateApplicationPayload,
} from "../types/application.types";

export interface GetApplicationsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  domain?: string;
  cloud?: string;
}

export async function getApplications({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  domain = "",
  cloud = "",
}: GetApplicationsParams = {}): Promise<ApplicationsResponse> {
  const response =
    await apiClient.get<ApplicationsApiResponse>(
      "/clouds/all/applications",
      {
        params: {
          page,
          size: pageSize,
          search: search || undefined,
          status: status || undefined,
          domain: domain || undefined,
          cloud: cloud || undefined,
        },
      },
    );

  return {
    page: response.data.page,
    pageSize: response.data.size,
    total: response.data.total,
    items: response.data.data,
  };
}


export async function updateApplication(
  applicationId: number,
  payload: UpdateApplicationPayload,
): Promise<Application> {
  const response =
    await apiClient.patch<Application>(
      `/application/${applicationId}`,
      payload,
    );

  return response.data;
}