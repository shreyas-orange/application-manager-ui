import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createRoadmapItem,
  getRoadmapDetails,
  importRoadmap,
  updateRoadmapItem,
} from "../api/roadmap.api";

import type {
  UpdateRoadmapItemPayload,
} from "../types/roadmap.types";

export const roadmapKeys = {
  all: ["roadmap"] as const,
  details: (appId: number) =>
    [...roadmapKeys.all, "details", appId] as const,
};

export function useRoadmapDetails(appId: number) {
  return useQuery({
    queryKey: roadmapKeys.details(appId),
    queryFn: () => getRoadmapDetails(appId),
  });
}

export function useUpdateRoadmapItem(appId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: number;
      payload: UpdateRoadmapItemPayload;
    }) => updateRoadmapItem(appId, itemId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roadmapKeys.details(appId),
      });
    },
  });
}

export function useCreateRoadmapItem(appId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: UpdateRoadmapItemPayload }) =>
      createRoadmapItem(appId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roadmapKeys.details(appId),
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    },
  });
}

export function useImportRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      file,
      replaceExisting,
    }: {
      applicationId: number;
      file: File;
      replaceExisting: boolean;
    }) => importRoadmap(applicationId, file, replaceExisting),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roadmapKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });
    },
  });
}
