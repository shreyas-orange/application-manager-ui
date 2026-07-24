import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCloudConfiguration,
  deleteCloudConfiguration,
  getCloudConfigurations,
  updateCloudConfiguration,
} from "../api/cloud.api";

import type {
  CreateCloudRequest,
  GetCloudParams,
  UpdateCloudRequest,
} from "../types/clouds.types";

export const cloudQueryKeys = {
  all: ["cloud"] as const,

  list: (params: GetCloudParams) =>
    [
      ...cloudQueryKeys.all,
      "list",
      params,
    ] as const,
};

export function useCloudConfigurations(
  params: GetCloudParams,
) {
  return useQuery({
    queryKey:
      cloudQueryKeys.list(params),

    queryFn: () =>
      getCloudConfigurations(params),
  });
}

export function useCreateCloud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateCloudRequest,
    ) => createCloudConfiguration(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cloudQueryKeys.all,
      });
    },
  });
}

export function useUpdateCloud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCloudRequest;
    }) =>
      updateCloudConfiguration(
        id,
        payload,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cloudQueryKeys.all,
      });
    },
  });
}

export function useDeleteCloud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      id: number,
    ) => deleteCloudConfiguration(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cloudQueryKeys.all,
      });
    },
  });
}

