import type { User, UserRole } from "../types/auth.types";

/**
 * The API has been observed returning `role` as either a plain string
 * ("admin") or an object ({ name: "admin" }). Normalize both shapes here
 * so every caller agrees on what a user's role is.
 */
export function getUserRole(user: Pick<User, "role"> | null | undefined): UserRole | "" {
  const rawRole =
    typeof user?.role === "string"
      ? user.role
      : ((user?.role as unknown as { name?: string } | undefined)?.name ?? "");

  return rawRole.trim().toLowerCase() as UserRole | "";
}
