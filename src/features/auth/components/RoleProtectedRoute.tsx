import { Navigate, Outlet } from "react-router-dom";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { getUserRole } from "../utils/get-user-role";
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

  const userRole = getUserRole(user);

  if (!allowedRoles.includes(userRole as UserRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}