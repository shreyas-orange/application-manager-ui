import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  getUploadedFiles,
} from "../api/upload.api";

import type {
  GetUploadsParams,
} from "../types/upload.types";

export function useUploadedFiles(
  params: GetUploadsParams,
) {
  return useQuery({
    queryKey: [
      "uploads",
      params.page,
      params.pageSize,
      params.search,
    ],

    queryFn: () =>
      getUploadedFiles(params),

    placeholderData: keepPreviousData,
  });
}