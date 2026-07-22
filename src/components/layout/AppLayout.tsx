import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import "./AppLayout.css";


import {
  Cloud,
  ScrollText,
} from "lucide-react";

export function AppLayout() {
  const navigate = useNavigate();

  const storedUser =
    localStorage.getItem("auth_user");

  const currentUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  const role = String(
    currentUser?.role ?? "",
  )
    .trim()
    .toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <div className="app-sidebar__logo">
            AM
          </div>

          <div>
            <h2>Application Manager</h2>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className="app-sidebar__nav">
          {role === "admin" && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link sidebar-link--active"
                  : "sidebar-link"
              }
            >
              <span className="sidebar-link__icon">
                ▦
              </span>

              Dashboard
            </NavLink>
          )}

          <NavLink
            to="/applications"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link sidebar-link--active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-link__icon">
              ◫
            </span>

            Applications
          </NavLink>

            <NavLink
            to="/uploads"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link sidebar-link--active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-link__icon">
              ◫
            </span>

            Upload Files
          </NavLink>

          {role === "admin" && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link sidebar-link--active"
                  : "sidebar-link"
              }
            >
              <span className="sidebar-link__icon">
                ◉
              </span>

              Users
            </NavLink>
          )}
          <NavLink
            to="/audit-logs"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link sidebar-link--active"
                : "sidebar-link"
            }
          >
            <ScrollText size={19} />
            <span>Audit Logs</span>
        </NavLink>
        <NavLink
          to="/cloud"
          className={({ isActive }) =>
            isActive
              ? "sidebar-link sidebar-link--active"
              : "sidebar-link"
          }
        >
          <Cloud size={19} />
          <span>Cloud</span>
        </NavLink>
        </nav>

        <div className="app-sidebar__footer">
          <div className="sidebar-user">
            <div className="sidebar-user__avatar">
              {String(
                currentUser?.email ?? "U",
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="sidebar-user__details">
              <strong>
                {currentUser?.email ??
                  "Current User"}
              </strong>

              <span>
                {currentUser?.role ?? "User"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="app-header">
          <div>
            <h1>Application Manager</h1>

            <p>
              Manage applications, migrations,
              uploads and users.
            </p>
          </div>

          <div className="app-header__actions">
            <div className="app-header__search">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search..."
              />
            </div>

            <button
              type="button"
              className="header-notification"
              aria-label="Notifications"
            >
              ♢
            </button>

            <div className="header-profile">
              <div className="header-profile__avatar">
                {String(
                  currentUser?.email ?? "U",
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {currentUser?.email ??
                    "Current User"}
                </strong>

                <span>
                  {currentUser?.role ?? "User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}