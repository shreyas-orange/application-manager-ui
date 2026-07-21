import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <div className="auth-layout__background" />

      <div className="auth-layout__content">
        <Outlet />
      </div>
    </main>
  );
}