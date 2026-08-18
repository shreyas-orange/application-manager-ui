// src/components/layout/AppLayout.tsx
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Cloud,
  ScrollText,
  LayoutDashboard,
  AppWindow,
  Upload,
  Users,
  Menu,
  LogOut,
  ChevronRight,
  BarChart3,
  Database,
  UserCog,
} from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { getUserRole } from "@/features/auth/utils/get-user-role";
import { isDbTeamRole } from "@/features/auth/utils/is-db-team-role";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  to:       string;
  label:    string;
  icon:     React.ReactNode;
  adminOnly?: boolean;
  allowedRoles?: string[];
}

// ─── Nav Items Config ─────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    to:        "/app/dashboard",
    label:     "Dashboard",
    icon:      <LayoutDashboard size={18} />,
    adminOnly: true,
  },
  {
    to:    "/app/applications",
    label: "Application List",
    icon:  <AppWindow size={18} />,
  },
  {
    to: "/app/my-applications",
    label: "My Applications",
    icon: <UserCog size={18} />,
    allowedRoles: ["manager"],
  },
  {
    to:    "/app/analytics",
    label: "Analytics",
    icon:  <BarChart3 size={18} />,
  },
  {
    to:    "/app/db-syncups",
    label: "DB Syncup",
    icon:  <Database size={18} />,
  },
  {
    to: "/app/db-environment-requests",
    label: "DB Sync Requests",
    icon: <Database size={18} />,
    allowedRoles: ["admin", "manager", "db validator"],
  },
  {
    to:    "/app/uploads",
    label: "Upload Files",
    icon:  <Upload size={18} />,
  },
  {
    to:        "/app/users",
    label:     "Users",
    icon:      <Users size={18} />,
    adminOnly: true,
  },
  {
    to:    "/app/audit-logs",
    label: "Audit Logs",
    icon:  <ScrollText size={18} />,
  },
  {
    to:    "/app/cloud",
    label: "Cloud",
    icon:  <Cloud size={18} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function AppLayout() {
  const [sidebarCollapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── Current user (already cached by ProtectedRoute's query) ───────
  const { data: currentUser } = useCurrentUser();
  const role        = getUserRole(currentUser);
  const isDbTeam    = isDbTeamRole(role);
  const userInitial = String(currentUser?.email ?? "U").charAt(0).toUpperCase();

  // ── Logout ───────────────────────────────────────────────────────
  const logoutMutation = useLogout();
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // ── Nav link class helper ────────────────────────────────────────
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `ods-nav-link${isActive ? " active" : ""}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ods-gray-100)" }}>

      {/* ── TOP NAVBAR ──────────────────────────────────────────── */}
      <header className="ods-navbar">

        {/* Sidebar toggle */}
        <button
          className="ods-navbar-toggle"
          onClick={() => {
            setCollapsed((prev) => !prev);
            setMobileOpen((prev) => !prev);
          }}
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronRight size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand */}
        <NavLink to="/app/applications" className="ods-navbar-brand">
          <div className="ods-brand-icon">AM</div>
          {!sidebarCollapsed && (
            <span>Application Manager</span>
          )}
        </NavLink>

        <div className="ods-navbar-spacer" />

        {/* Right section */}
        <div className="ods-navbar-right">

          {/* User dropdown */}
          <div className="ods-navbar-dropdown">
            <div
              className="ods-user-avatar"
              onClick={() => setDropdownOpen((prev) => !prev)}
              role="button"
              aria-label="User menu"
            >
              {userInitial}
            </div>

            <div className={`ods-dropdown-menu${dropdownOpen ? " open" : ""}`}>
              {/* User info header */}
              <div className="ods-dropdown-header">
                <strong style={{ display: "block", color: "var(--ods-gray-800)" }}>
                  {currentUser?.email ?? "Current User"}
                </strong>
                <span style={{ textTransform: "capitalize" }}>
                  {role || "User"}
                </span>
              </div>

              <div className="ods-dropdown-divider" />

              <NavLink
                to="/app/profile"
                className="ods-dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <UserCog size={14} style={{ marginRight: "0.5rem" }} />
                My Profile
              </NavLink>

              <button
                className="ods-dropdown-item danger"
                onClick={handleLogout}
              >
                <LogOut size={14} style={{ marginRight: "0.5rem" }} />
                Logout
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ── MOBILE OVERLAY ──────────────────────────────────────── */}
      <div
        className={`ods-sidebar-overlay${mobileOpen ? " active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        className={[
          "ods-sidebar",
          sidebarCollapsed ? "collapsed"   : "",
          mobileOpen       ? "mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Section label */}
        <div className="ods-sidebar-section">Navigation</div>

        {/* Nav links */}
        <nav>
          {NAV_ITEMS.filter(
            (item) => role === "manager"
              ? [
                  "/app/applications",
                  "/app/my-applications",
                  "/app/db-syncups",
                  "/app/db-environment-requests",
                ].includes(item.to)
              : isDbTeam
              ? item.to === "/app/applications" || item.to === "/app/db-syncups" || item.allowedRoles?.includes(role)
              : (!item.adminOnly || role === "admin") && (!item.allowedRoles || item.allowedRoles.includes(role))
          ).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={navClass}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="ods-nav-icon">{item.icon}</span>
              <span className="ods-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Sidebar footer — user info + logout ─────────────── */}
        {!sidebarCollapsed && (
          <div
            style={{
              position:   "absolute",
              bottom:     0,
              left:       0,
              right:      0,
              padding:    "1rem",
              borderTop:  "1px solid var(--ods-gray-800)",
              background: "var(--ods-black)",
            }}
          >
            {/* User info */}
            <div
              style={{
                display:     "flex",
                alignItems:  "center",
                gap:         "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width:           32,
                  height:          32,
                  background:      "var(--ods-orange)",
                  color:           "var(--ods-black)",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  fontWeight:      "var(--ods-font-weight-bold)" as never,
                  fontSize:        "0.8rem",
                  flexShrink:      0,
                }}
              >
                {userInitial}
              </div>

              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize:     "0.8rem",
                    fontWeight:   700,
                    color:        "var(--ods-white)",
                    whiteSpace:   "nowrap",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser?.email ?? "Current User"}
                </div>
                <div
                  style={{
                    fontSize:      "0.7rem",
                    color:         "var(--ods-gray-500)",
                    textTransform: "capitalize",
                  }}
                >
                  {role || "User"}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              style={{
                fontSize:    "0.8rem",
                padding:     "0.4rem 0.75rem",
                color:       "var(--ods-gray-400)",
                borderColor: "var(--ods-gray-700)",
                display:     "flex",
                alignItems:  "center",
                gap:         "0.5rem",
                justifyContent: "center",
              }}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}

        {/* Collapsed state — just logout icon */}
        {sidebarCollapsed && (
          <div
            style={{
              position:  "absolute",
              bottom:    0,
              left:      0,
              right:     0,
              padding:   "0.75rem",
              borderTop: "1px solid var(--ods-gray-800)",
              display:   "flex",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              className="ods-navbar-toggle"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div
        className={`ods-main-content${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
      >
        <main>
          <Outlet />
        </main>
      </div>

    </div>
  );
}
