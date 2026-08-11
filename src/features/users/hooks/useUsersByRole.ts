import { useQuery } from "@tanstack/react-query";

import { normalizeValue } from "@/lib/format";

import { getUsers } from "../api/users.api";

// Large enough to cover realistic user counts in one page — there is no
// dedicated "list users by role" endpoint, so we fetch broadly and filter.
const ALL_USERS_PAGE_SIZE = 200;

export function useUsersByRole(roleName: string) {
  return useQuery({
    queryKey: ["users", "by-role", roleName],
    queryFn: () => getUsers({ page: 1, pageSize: ALL_USERS_PAGE_SIZE }),
    select: (data) =>
      data.items.filter(
        (user) => normalizeValue(user.role?.name) === normalizeValue(roleName),
      ),
  });
}
