import {
  createBrowserRouter,
  Navigate,
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



function ForbiddenPage() {
  return (
    <h1>
      You do not have permission to access this page.
    </h1>
  );
}

function NotFoundPage() {
  return <h1>Page not found</h1>;
}


export const router = createBrowserRouter([
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

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: (
              <Navigate
                to="/applications"
                replace
              />
            ),
          },

          {
            path: "/applications",
            element: <ApplicationsPage />,
          },

          {
            path: "/forbidden",
            element: <ForbiddenPage />,
          },

          {
            element: (
              <RoleProtectedRoute
                allowedRoles={["Admin"]}
              />
            ),
            children: [
              {
                path: "/dashboard",
                element: <DashboardPage />,
              },
              {
                path: "/users",
                element: <UsersPage />,
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);