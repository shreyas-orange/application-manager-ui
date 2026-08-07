import {
  createBrowserRouter,
} from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";

import { ForbiddenPage, NotFoundPage } from "./error-pages";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/features/auth/components/RoleProtectedRoute";

import  LoginPage  from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";

import UsersPage from "@/features/users/pages/UsersPage";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ApplicationsPage from "@/features/applications/pages/ApplicationsPage";
import ApplicationDetailsPage from "@/features/applications/pages/ApplicationDetailsPage";
import AnalyticsPage from "@/features/applications/pages/AnalyticsPage";
import HomeOverviewPage from "@/features/applications/pages/HomeOverviewPage";
import UploadFilePage from "@/features/uploads/pages/UploadFilePage";
import AuditLogsPage from  "../features/audit-logs/pages/AuditLogsPage";

import CloudPage from "@/features/cloud/pages/CloudPage";

import DbSyncupPage from "@/features/db-syncup/pages/DbSyncupPage";

// ─── Router ──────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // ── Public routes (no auth required) ─────────────────────────
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <HomeOverviewPage />,
      },
      {
        path: "/overview",
        element: <HomeOverviewPage />,
      },
    ],
  },

  // ── Auth routes ──────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
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
            element: <ApplicationsPage />,
          },
          {
            path: "applications",
            element: <ApplicationsPage />,
          },
          {
            path: "applications/:id",
            element: <ApplicationDetailsPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "db-syncups",
            element: <DbSyncupPage />,
          },
          {
            path: "forbidden",
            element: <ForbiddenPage />,
          },
          {
            element: (
              <RoleProtectedRoute allowedRoles={["admin"]} />
            ),
            children: [
              {
                path: "dashboard",
                element: <DashboardPage />,
              },
              {
                path: "users",
                element: <UsersPage />,
              },
              {
                path: "uploads",
                element: <UploadFilePage />,
              },
              {
                path: "audit-logs",
                element: <AuditLogsPage />,
              },
              {
                path: "cloud",
                element: <CloudPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Catch-all ────────────────────────────────────────────────
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
