import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { tokenService } from "@/services/token.service";

import { useCurrentUser } from "../hooks/useCurrentUser";

export function ProtectedRoute() {
  const location = useLocation();
  const hasToken = tokenService.hasAccessToken();
  const currentUserQuery = useCurrentUser();

  if (!hasToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (currentUserQuery.isLoading) {
    return (
      <div className="page-loader">
        Checking your session...
      </div>
    );
  }

  if (
    currentUserQuery.isError ||
    !currentUserQuery.data
  ) {
    tokenService.clearTokens();

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}