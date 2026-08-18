import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

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
      {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
    ],

    queryFn: () => getUsers(params),

    placeholderData: keepPreviousData,
  });
}
