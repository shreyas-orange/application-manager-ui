import { Navigate, Outlet } from "react-router-dom";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { getUserRole } from "../utils/get-user-role";
import { isDbTeamRole } from "../utils/is-db-team-role";

export function NonDbTeamRoute() {
  const currentUserQuery = useCurrentUser();

  if (currentUserQuery.isLoading) {
    return <div>Checking permission...</div>;
  }

  const user = currentUserQuery.data;
  if (!user) return <Navigate to="/login" replace />;

  if (isDbTeamRole(getUserRole(user))) {
    return <Navigate to="/app/forbidden" replace />;
  }

  return <Outlet />;
}
