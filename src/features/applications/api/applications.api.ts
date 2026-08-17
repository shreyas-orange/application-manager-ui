import { apiClient } from "@/lib/api-client";
import { publicApiClient } from "@/lib/public-api-client";

import type {
  Application,
  ApplicationsApiResponse,
  ApplicationsResponse,
  CreateApplicationPayload,
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

export interface SharePointSyncResponse {
  message?: string;
  detail?: string;
}

interface ApplicationDetailsApiResponse {
  application: Partial<Application> & Pick<Application, "id" | "application_name">;
  meta_data: Application["meta_data"];
  migration: (Application["migration"] & {
    assessment_status?: string | null;
    data_anonymization_status?: string | null;
  }) | null;
  security: Application["security"];
  remark: Application["remarks"];
  owners: Application["owners"];
  clouds: Array<{ id: number; name: string }>;
}

interface MyApplicationsApiResponse {
  items: ApplicationDetailsApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

function normalizeApplicationDetails(
  raw: ApplicationDetailsApiResponse,
): Application {
  const migration = raw.migration;
  const metaData = raw.meta_data
    ? {
        ...raw.meta_data,
        assessment_status:
          raw.meta_data.assessment_status ?? migration?.assessment_status ?? null,
        data_anonymization_status:
          raw.meta_data.data_anonymization_status ??
          migration?.data_anonymization_status ??
          null,
      }
    : null;

  return {
    uploaded_file_id: null,
    application_status: null,
    domain: null,
    confirmed_domain: null,
    portfolio: null,
    carto_id: null,
    basicat: null,
    priority: null,
    business_importance: null,
    sov_type: null,
    out_of_scope: false,
    ns_migration_status_azure_count: null,
    ns_to_migrate_bleu_environment_names: null,
    ns_migration_status_bleu_count: null,
    has_roadmap: false,
    created_at: "",
    updated_at: "",
    ...raw.application,
    owners: raw.owners ?? [],
    migration,
    meta_data: metaData,
    security: raw.security,
    remarks: raw.remark ?? [],
    cloud_mappings: (raw.clouds ?? []).map((cloud) => ({
      id: cloud.id,
      cloud_id: cloud.id,
      application_id: raw.application.id,
      cloud,
    })),
  };
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

export async function getMyApplications({
  page = 1,
  pageSize = 10,
}: Pick<GetApplicationsParams, "page" | "pageSize"> = {}): Promise<ApplicationsResponse> {
  const response = await apiClient.get<MyApplicationsApiResponse>(
    "/application/my-applications",
    {
      params: {
        page,
        page_size: pageSize,
      },
    },
  );

  return {
    page: response.data.page,
    pageSize: response.data.page_size,
    total: response.data.total,
    items: response.data.items.map(normalizeApplicationDetails),
  };
}

export async function getApplicationDomains(): Promise<string[]> {
  const response = await apiClient.get<string[]>("/clouds/all/domains");
  return response.data;
}

export async function runSharePointSync(): Promise<SharePointSyncResponse> {
  const response = await apiClient.post<SharePointSyncResponse>(
    "/sharepoint-sync/run",
  );
  return response.data;
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


export async function createApplication(
  payload: CreateApplicationPayload,
): Promise<Application> {
  const response =
    await apiClient.post<Application>(
      "/application",
      payload,
    );

  return response.data;
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
    await apiClient.get<ApplicationDetailsApiResponse>(
      `/application/${applicationId}`,
    );

  return normalizeApplicationDetails(response.data);
}
