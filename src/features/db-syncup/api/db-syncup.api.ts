import { apiClient } from "@/lib/api-client";

import type {
  CreateDbSyncupPayload,
  DbSyncEnvironmentRequest,
  DbEnvironmentWorklistResponse,
  DbSyncup,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";
import type { DbSyncHistoryResponse } from "../types/history.types";

export async function getDbSyncupsByApplication(
  applicationId: number,
): Promise<DbSyncup[]> {
  const response =
    await apiClient.get<DbSyncup[]>(
      `/db-syncups/application/${applicationId}`,
    );

  return response.data;
}

export async function exportDbSyncupsExcel(): Promise<{
  blob: Blob;
  contentDisposition?: string;
}> {
  const response = await apiClient.get<Blob>("/db-syncups/export", {
    responseType: "blob",
  });
  return {
    blob: response.data,
    contentDisposition: response.headers["content-disposition"],
  };
}

export interface GetEnvironmentWorklistParams {
  page?: number;
  pageSize?: number;
  search?: string;
  deploymentTarget?: string;
  status?: string;
}

export async function getEnvironmentWorklist(
  params: GetEnvironmentWorklistParams = {},
): Promise<DbEnvironmentWorklistResponse> {
  const response = await apiClient.get<DbEnvironmentWorklistResponse>(
    "/db-syncups/environment-worklist",
    {
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
        search: params.search || undefined,
        deployment_target: params.deploymentTarget || undefined,
        status: params.status || undefined,
      },
    },
  );
  return response.data;
}

export interface GetDbSyncupsParams {
  page?: number;
  pageSize?: number;
  applicationId?: number;
  search?: string;
  domain?: string;
  cloud?: string;
  environment?: string;
  status?: string;
}

export interface DbSyncupListResult {
  items: DbSyncup[];
  total: number;
  inProgressCount: number;
  failedCount: number;
  completedCount: number;
  pendingCount: number;
}

export async function getDbSyncups(
  params: GetDbSyncupsParams = {},
): Promise<DbSyncupListResult> {
  const response =
    await apiClient.get<
      DbSyncup[] | {
        items?: DbSyncup[];
        data?: DbSyncup[];
        total?: number;
        in_progress_count?: number;
        failed_count?: number;
        completed_count?: number;
        pending_count?: number;
      }
    >("/db-syncups", {
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 100,
        application_id: params.applicationId || undefined,
        search: params.search || undefined,
        domain: params.domain || undefined,
        cloud: params.cloud || undefined,
        environment: params.environment || undefined,
        status: params.status || undefined,
      },
    });

  if (Array.isArray(response.data)) {
    return {
      items: response.data,
      total: response.data.length,
      inProgressCount: 0,
      failedCount: 0,
      completedCount: 0,
      pendingCount: 0,
    };
  }

  const items = response.data?.items ?? response.data?.data ?? [];
  return {
    items,
    total: typeof response.data?.total === "number" ? response.data.total : items.length,
    inProgressCount: response.data?.in_progress_count ?? 0,
    failedCount: response.data?.failed_count ?? 0,
    completedCount: response.data?.completed_count ?? 0,
    pendingCount: response.data?.pending_count ?? 0,
  };
}

export async function createDbSyncup(
  payload: CreateDbSyncupPayload,
): Promise<DbSyncup> {
  const response =
    await apiClient.post<DbSyncup>(
      "/db-syncups",
      payload,
    );

  return response.data;
}

export async function updateDbSyncup(
  syncupId: number,
  payload: UpdateDbSyncupPayload,
): Promise<DbSyncup> {
  const response =
    await apiClient.patch<DbSyncup>(
      `/db-syncups/${syncupId}`,
      payload,
    );

  return response.data;
}

export async function updateDbSyncupEnvironmentStatus(
  syncupId: number,
  environmentId: number,
  version: number,
  requestStatus: string,
): Promise<DbSyncEnvironmentRequest> {
  const response = await apiClient.patch<DbSyncEnvironmentRequest>(
    `/db-syncups/${syncupId}/environments/${environmentId}/status`,
    { version, request_status: requestStatus },
  );
  return response.data;
}

export async function deleteDbSyncup(
  syncupId: number,
): Promise<void> {
  await apiClient.delete(
    `/db-syncups/${syncupId}`,
  );
}

export interface GetDbSyncupHistoryParams {
  page?: number;
  pageSize?: number;
  dbSyncupId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
}

export async function getDbSyncupHistory(
  params: GetDbSyncupHistoryParams = {},
): Promise<DbSyncHistoryResponse> {
  const response =
    await apiClient.get<DbSyncHistoryResponse>(
      "/db-syncups/history",
      {
        params: {
          page: params.page ?? 1,
          page_size: params.pageSize ?? 20,
          db_syncup_id: params.dbSyncupId ?? undefined,
          start_date: params.startDate ?? undefined,
          end_date: params.endDate ?? undefined,
          search: params.search ?? undefined,
        },
      },
    );

  return response.data;
}
