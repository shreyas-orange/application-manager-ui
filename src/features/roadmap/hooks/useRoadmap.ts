import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getRoadmapDetails,
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
