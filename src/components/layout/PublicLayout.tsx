import { Link, Outlet } from "react-router-dom";

export function PublicLayout() {
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
            DM
          </div>
          <span style={{ color: "var(--ods-white)", fontWeight: 700, fontSize: "1rem" }}>
            DOMs
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
