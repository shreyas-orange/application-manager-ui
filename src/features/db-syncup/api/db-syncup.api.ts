import { apiClient } from "@/lib/api-client";

import type {
  CreateDbSyncupPayload,
  DbSyncup,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";

export async function getDbSyncupsByApplication(
  applicationId: number,
): Promise<DbSyncup[]> {
  const response =
    await apiClient.get<DbSyncup[]>(
      `/db-syncups/application/${applicationId}`,
    );

  return response.data;
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
