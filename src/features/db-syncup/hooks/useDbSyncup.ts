import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDbSyncup,
  deleteDbSyncup,
  getDbSyncups,
  getDbSyncupsByApplication,
  type GetDbSyncupsParams,
  updateDbSyncup,
  updateDbSyncupEnvironmentStatus,
} from "../api/db-syncup.api";

import type {
  CreateDbSyncupPayload,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";

export const dbSyncupKeys = {
  all: ["db-syncups"] as const,
  byApplication: (applicationId: number) =>
    [...dbSyncupKeys.all, "application", applicationId] as const,
};

export function useDbSyncups(applicationId: number) {
  return useQuery({
    queryKey: dbSyncupKeys.byApplication(applicationId),
    queryFn: () => getDbSyncupsByApplication(applicationId),
    enabled: Number.isFinite(applicationId) && applicationId > 0,
  });
}

export function useAllDbSyncups(params: GetDbSyncupsParams = {}) {
  return useQuery({
    queryKey: [...dbSyncupKeys.all, "list", params] as const,
    queryFn: () => getDbSyncups(params),
  });
}

export function useCreateDbSyncup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDbSyncupPayload) =>
      createDbSyncup(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dbSyncupKeys.all,
      });
    },
  });
}

export function useUpdateDbSyncup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      syncupId,
      payload,
    }: {
      syncupId: number;
      payload: UpdateDbSyncupPayload;
    }) => updateDbSyncup(syncupId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dbSyncupKeys.all,
      });
    },
  });
}

export function useUpdateDbSyncupEnvironmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      syncupId,
      environmentId,
      version,
      requestStatus,
    }: {
      syncupId: number;
      environmentId: number;
      version: number;
      requestStatus: string;
    }) => updateDbSyncupEnvironmentStatus(syncupId, environmentId, version, requestStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dbSyncupKeys.all });
    },
  });
}

export function useDeleteDbSyncup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (syncupId: number) =>
      deleteDbSyncup(syncupId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dbSyncupKeys.all,
      });
    },
  });
}
