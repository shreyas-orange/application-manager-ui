import { apiClient } from "@/lib/api-client";

import type {
  User,
  UsersResponse,
} from "../types/user.types";

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getUsers({
  page = 1,
  pageSize = 10,
  search = "",
}: GetUsersParams = {}): Promise<UsersResponse> {
  const response = await apiClient.get<User[]>(
    "/users",
    {
      params: {
        page,
        page_size: pageSize,
        search: search || undefined,
      },
    },
  );

  return {
    items: response.data,
    total: response.data.length,
  };
}