import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

import { EmptyState } from "@/components/ui";

export function ForbiddenPage() {
  return (
    <EmptyState
      icon="🔒"
      title="Access Denied"
      text="You do not have permission to access this page."
      action={
        <Link to="/app" className="btn btn-primary mt-3">
          Back to Applications
        </Link>
      }
    />
  );
}

export function NotFoundPage() {
  return (
    <EmptyState
      icon="🔍"
      title="Page Not Found"
      text="The page you are looking for does not exist."
      action={
        <Link to="/" className="btn btn-primary mt-3">
          Go home
        </Link>
      }
    />
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <EmptyState
      icon="⚠️"
      title="Something went wrong"
      text={message}
      action={
        <button
          type="button"
          className="btn btn-primary mt-3"
          // Full reload, not a router navigate — a render-time throw can leave
          // React's internal tree in a bad state that a client-side nav won't clear.
          onClick={() => window.location.assign("/")}
        >
          Reload app
        </button>
      }
    />
  );
}
