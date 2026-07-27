import {
  createBrowserRouter,
  Link,
  Outlet,
} from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/features/auth/components/RoleProtectedRoute";

import  LoginPage  from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";

import UsersPage from "@/features/users/pages/UsersPage";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ApplicationsPage from "@/features/applications/pages/ApplicationsPage";
import ApplicationDetailsPage from "@/features/applications/pages/ApplicationDetailsPage";
import RoadmapPage from "@/features/roadmap/pages/RoadmapPage";
import AnalyticsPage from "@/features/applications/pages/AnalyticsPage";
import HomeOverviewPage from "@/features/applications/pages/HomeOverviewPage";
import UploadFilePage from "@/features/uploads/pages/UploadFilePage";
import AuditLogsPage from  "../features/audit-logs/pages/AuditLogsPage";

import CloudPage from "@/features/cloud/pages/CloudPage";

// ─── Public layout (no auth required) ────────────────────────────────────────
function PublicLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--ods-gray-100)" }}>
      {/* Public header */}
      <header
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "0.75rem 1.5rem",
          background:     "var(--ods-black)",
          borderBottom:   "3px solid var(--ods-orange)",
          position:       "sticky",
          top:            0,
          zIndex:         100,
        }}
      >
        <Link
          to="/"
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         "0.75rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width:           36,
              height:          36,
              background:      "var(--ods-orange)",
              color:           "var(--ods-black)",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              fontWeight:      700,
              fontSize:        "0.8rem",
            }}
          >
            AM
          </div>
          <span style={{ color: "var(--ods-white)", fontWeight: 700, fontSize: "1rem" }}>
            Application Manager
          </span>
        </Link>

        <Link
          to="/login"
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          Sign in
        </Link>
      </header>

      {/* Main content */}
      <main style={{ padding: "1.5rem", maxWidth: 1400, margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}

// ─── Error pages ─────────────────────────────────────────────────────────────
function ForbiddenPage() {
  return (
    <div className="ods-empty-state">
      <span className="ods-empty-icon">🔒</span>
      <div className="ods-empty-title">Access Denied</div>
      <p className="ods-empty-text">
        You do not have permission to access this page.
      </p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="ods-empty-state">
      <span className="ods-empty-icon">🔍</span>
      <div className="ods-empty-title">Page Not Found</div>
      <p className="ods-empty-text">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}

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
            path: "applications/:id/roadmap",
            element: <RoadmapPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
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
