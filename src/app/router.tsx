import { createBrowserRouter, Outlet } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";

import { ForbiddenPage, NotFoundPage, RouteErrorBoundary } from "./error-pages";
import { lazyPage } from "./lazy-page";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/features/auth/components/RoleProtectedRoute";
import { NonDbTeamRoute } from "@/features/auth/components/NonDbTeamRoute";

// ─── Router ──────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // ── Public routes (no auth required) ─────────────────────────
      {
        element: <PublicLayout />,
        children: [
          {
            path: "/",
            element: lazyPage(() => import("@/features/applications/pages/HomeOverviewPage")),
          },
          {
            path: "/overview",
            element: lazyPage(() => import("@/features/applications/pages/HomeOverviewPage")),
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },

      // ── Auth routes ──────────────────────────────────────────────
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: lazyPage(() => import("@/features/auth/pages/LoginPage")),
          },
          {
            path: "/register",
            element: lazyPage(() => import("@/features/auth/pages/RegisterPage")),
          },
          {
            path: "/forgot-password",
            element: lazyPage(() => import("@/features/auth/pages/ForgotPasswordPage")),
          },
          {
            path: "/reset-password",
            element: lazyPage(() => import("@/features/auth/pages/ResetPasswordPage")),
          },
        ],
      },

      // ── Protected routes (require auth) ─────────────────────────
      {
        path: "/app",
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                index: true,
                element: lazyPage(() => import("@/features/applications/pages/ApplicationsPage")),
              },
              {
                path: "applications",
                element: lazyPage(() => import("@/features/applications/pages/ApplicationsPage")),
              },
              {
                path: "applications/:id",
                element: lazyPage(() => import("@/features/applications/pages/ApplicationDetailsPage")),
              },
              {
                element: <RoleProtectedRoute allowedRoles={["manager"]} />,
                children: [
                  {
                    path: "my-applications",
                    element: lazyPage(() => import("@/features/applications/pages/MyApplicationsPage")),
                  },
                ],
              },
              {
                element: <NonDbTeamRoute />,
                children: [
                  {
                    path: "analytics",
                    element: lazyPage(() => import("@/features/applications/pages/AnalyticsPage")),
                  },
                ],
              },
              {
                path: "db-syncups",
                element: lazyPage(() => import("@/features/db-syncup/pages/DbSyncupPage")),
              },
              {
                path: "db-syncups/:id",
                element: lazyPage(() => import("@/features/db-syncup/pages/DbSyncupDetailsPage")),
              },
              {
                element: <RoleProtectedRoute allowedRoles={["admin", "manager", "db validator"]} />,
                children: [
                  {
                    path: "db-environment-requests",
                    element: lazyPage(() => import("@/features/db-syncup/pages/DbEnvironmentWorklistPage")),
                  },
                ],
              },
              {
                path: "forbidden",
                element: <ForbiddenPage />,
              },
              {
                path: "profile",
                element: lazyPage(() => import("@/features/profile/pages/ProfilePage")),
              },
              {
                element: (
                  <RoleProtectedRoute allowedRoles={["admin"]} />
                ),
                children: [
                  {
                    path: "dashboard",
                    element: lazyPage(() => import("@/features/dashboard/pages/DashboardPage")),
                  },
                  {
                    path: "users",
                    element: lazyPage(() => import("@/features/users/pages/UsersPage")),
                  },
                  {
                    path: "uploads",
                    element: lazyPage(() => import("@/features/uploads/pages/UploadFilePage")),
                  },
                  {
                    path: "audit-logs",
                    element: lazyPage(() => import("@/features/audit-logs/pages/AuditLogsPage")),
                  },
                  {
                    path: "cloud",
                    element: lazyPage(() => import("@/features/cloud/pages/CloudPage")),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
