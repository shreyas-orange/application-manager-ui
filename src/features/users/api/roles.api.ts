import { apiClient } from "@/lib/api-client";

import type {
  CreateRoleRequest,
  Role,
  RolesResponse,
  UpdateRoleRequest,
} from "../types/role.types";

export async function getRoles(): Promise<Role[]> {
  const response =
    await apiClient.get<Role[] | RolesResponse>(
      "/roles",
    );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.items ?? [];
}

export async function getRole(roleId: number): Promise<Role> {
  const response =
    await apiClient.get<Role>(`/roles/${roleId}`);

  return response.data;
}

export async function createRole(
  data: CreateRoleRequest,
): Promise<Role> {
  const response =
    await apiClient.post<Role>("/roles", data);

  return response.data;
}

export async function updateRole(
  roleId: number,
  data: UpdateRoleRequest,
): Promise<Role> {
  const response =
    await apiClient.patch<Role>(
      `/roles/${roleId}`,
      data,
    );

  return response.data;
}

export async function deleteRole(
  roleId: number,
): Promise<void> {
  await apiClient.delete(`/roles/${roleId}`);
}
