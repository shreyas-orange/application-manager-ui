import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "../api/roles.api";

import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "../types/role.types";

export const roleKeys = {
  all: ["roles"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: () => getRoles(),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) =>
      createRole(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: number;
      data: UpdateRoleRequest;
    }) => updateRole(roleId, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: number) =>
      deleteRole(roleId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      });
    },
  });
}
