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
    // The response interceptor removes rejected credentials. A network or
    // server error should leave the session intact and allow the user to retry.
    if (!tokenService.hasAccessToken()) {
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

    return (
      <div className="page-loader">
        <p>Unable to verify your session.</p>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => { void currentUserQuery.refetch(); }}
        >
          Try again
        </button>
      </div>
    );
  }

  return <Outlet />;
}
