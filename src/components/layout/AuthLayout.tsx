// src/components/layout/AuthLayout.tsx
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="ods-auth-wrapper">

      {/* Orange decorative side strip */}
      <div
        style={{
          position:   "fixed",
          top:        0,
          left:       0,
          width:      4,
          height:     "100vh",
          background: "var(--ods-orange)",
        }}
      />

      {/* Auth card */}
      <div className="ods-auth-card">

        {/* Logo / Brand */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                width:           40,
                height:          40,
                background:      "var(--ods-orange)",
                color:           "var(--ods-black)",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                fontWeight:      700,
                fontSize:        "0.9rem",
                flexShrink:      0,
              }}
            >
              DM
            </div>

            <div>
              <div className="ods-auth-logo">
                DOMS
              </div>
              <div className="ods-auth-tagline">
                Admin Portal
              </div>
            </div>
          </div>

          {/* Orange divider under brand */}
          <div
            style={{
              height:     2,
              background: "var(--ods-orange)",
              marginTop:  "1.25rem",
            }}
          />
        </div>

        {/* Page content — LoginPage or RegisterPage renders here */}
        <Outlet />

      </div>
    </div>
  );
}
