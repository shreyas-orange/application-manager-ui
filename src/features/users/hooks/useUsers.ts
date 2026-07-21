import { useQuery } from "@tanstack/react-query";

import {
  getUsers,
  type GetUsersParams,
} from "../api/users.api";

export function useUsers(
  params: GetUsersParams,
) {
  return useQuery({
    queryKey: [
      "users",
      params.page,
      params.pageSize,
      params.search,
    ],
    queryFn: () => getUsers(params),
  });
}