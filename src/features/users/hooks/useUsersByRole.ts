import { useQuery } from "@tanstack/react-query";

import { normalizeValue } from "@/lib/format";

import { getUsers } from "../api/users.api";
import type { User } from "../types/user.types";

// API caps page_size at 100, so there is no dedicated "list users by role"
// endpoint — fetch every page and filter client-side.
const MAX_USERS_PAGE_SIZE = 100;

async function getAllUsers(): Promise<User[]> {
  const first = await getUsers({ page: 1, pageSize: MAX_USERS_PAGE_SIZE });
  if (first.total_pages <= 1) {
    return first.items;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: first.total_pages - 1 }, (_, index) =>
      getUsers({ page: index + 2, pageSize: MAX_USERS_PAGE_SIZE }),
    ),
  );

  return [
    ...first.items,
    ...remainingPages.flatMap((page) => page.items),
  ];
}

export function useUsersByRole(roleName: string) {
  return useQuery({
    queryKey: ["users", "by-role", roleName],
    queryFn: getAllUsers,
    select: (users) =>
      users.filter(
        (user) => normalizeValue(user.role?.name) === normalizeValue(roleName),
      ),
  });
}

export function useUsersByRoles(roleNames: string[]) {
  const normalizedRoles = roleNames.map(normalizeValue).sort();

  return useQuery({
    queryKey: ["users", "by-roles", ...normalizedRoles],
    queryFn: getAllUsers,
    select: (users) =>
      users.filter(
        (user) => user.is_active
          && normalizedRoles.includes(normalizeValue(user.role?.name)),
      ),
  });
}
