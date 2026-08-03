import { apiClient } from "@/lib/api-client";
import { publicApiClient } from "@/lib/public-api-client";

import type {
  Application,
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

function toApplicationsResponse(
  raw: ApplicationsApiResponse,
): ApplicationsResponse {
  return {
    page: raw.page,
    pageSize: raw.size,
    total: raw.total,
    items: raw.data,
  };
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

  return toApplicationsResponse(response.data);
}

export async function getPublicApplications({
  page = 1,
  pageSize = 50,
}: GetApplicationsParams = {}): Promise<ApplicationsResponse> {
  const response =
    await publicApiClient.get<ApplicationsApiResponse>(
      "/clouds/all/applications",
      {
        params: {
          page,
          size: pageSize,
        },
      },
    );

  return toApplicationsResponse(response.data);
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

export async function getApplication(
  applicationId: number,
): Promise<Application> {
  const response =
    await apiClient.get<Application>(
      `/application/${applicationId}`,
    );

  return response.data;
}