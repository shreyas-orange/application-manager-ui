import { apiClient } from "@/lib/api-client";

import type {
  CreateDbSyncupPayload,
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

export interface GetDbSyncupsParams {
  page?: number;
  pageSize?: number;
  applicationId?: number;
  search?: string;
  domain?: string;
  cloud?: string;
  environment?: string;
}

export async function getDbSyncups(
  params: GetDbSyncupsParams = {},
): Promise<DbSyncup[]> {
  const response =
    await apiClient.get<
      DbSyncup[] | { items?: DbSyncup[]; data?: DbSyncup[] }
    >("/db-syncups", {
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 100,
        application_id: params.applicationId || undefined,
        search: params.search || undefined,
        domain: params.domain || undefined,
        cloud: params.cloud || undefined,
        environment: params.environment || undefined,
      },
    });

  return Array.isArray(response.data)
    ? response.data
    : (response.data?.items ?? response.data?.data ?? []);
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
  applicationId?: number | null;
  applicationName?: string | null;
  cartoId?: string | null;
  dxUid?: string | null;
  mcpId?: string | null;
  action?: string | null;
  changedByUserId?: number | null;
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
          application_id: params.applicationId ?? undefined,
          application_name: params.applicationName ?? undefined,
          carto_id: params.cartoId ?? undefined,
          dx_uid: params.dxUid ?? undefined,
          mcp_id: params.mcpId ?? undefined,
          action: params.action ?? undefined,
          changed_by_user_id: params.changedByUserId ?? undefined,
        },
      },
    );

  return response.data;
}
