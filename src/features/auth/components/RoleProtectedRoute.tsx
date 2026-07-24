import { Navigate, Outlet } from "react-router-dom";

import { useCurrentUser } from "../hooks/useCurrentUser";
import type { UserRole } from "../types/auth.types";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
}

export function RoleProtectedRoute({
  allowedRoles,
}: RoleProtectedRouteProps) {
  const currentUserQuery = useCurrentUser();

  if (currentUserQuery.isLoading) {
    return <div>Checking permission...</div>;
  }

  const user = currentUserQuery.data;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const rawRole =
    typeof user.role === "string"
      ? user.role
      : (user.role as unknown as { name?: string })?.name ?? "";

  const userRole = rawRole.trim().toLowerCase();

  if (!allowedRoles.includes(userRole as UserRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}