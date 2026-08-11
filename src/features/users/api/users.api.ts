import { apiClient } from "@/lib/api-client";

import type {
  UsersResponse,
  UpdateUserRequest,
  User,
  CreateUserRequest,
} from "../types/user.types";


export interface GetUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getUsers(
  params: GetUsersParams,
): Promise<UsersResponse> {
  const response =
    await apiClient.get<UsersResponse>(
      "/users",
      {
        params: {
          page: params.page,
          page_size: params.pageSize,
          sort_by: params.sortBy,
          sort_order: params.sortOrder,
          search:
            params.search?.trim() || undefined,
        },
      },
    );

  return response.data;
}

export async function updateUser(
  userId: number,
  data: UpdateUserRequest,
): Promise<User> {
  const response =
    await apiClient.put<User>(
      `/users/${userId}`,
      data,
    );

  return response.data;
}

export async function deleteUser(
  userId: number,
): Promise<void> {
  await apiClient.delete(
    `/users/${userId}`,
  );
}

export async function createUser(
  data: CreateUserRequest,
): Promise<User> {
  const response = await apiClient.post<User>(
    "/users",
    data,
  );

  return response.data;
}
