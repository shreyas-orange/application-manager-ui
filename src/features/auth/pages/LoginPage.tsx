// src/features/auth/pages/LoginPage.tsx
import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { loginUser, getCurrentUser } from "../api/auth.api";
import { getAuthErrorMessage } from "../utils/auth-error";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginForm {
  email:    string;
  password: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm]                 = useState<LoginForm>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState("");

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const loginResponse = await loginUser({
        email:    form.email.trim(),
        password: form.password,
      });

      const accessToken  = loginResponse.access_token;
      const refreshToken = loginResponse.refresh_token;

      if (!accessToken) {
        throw new Error("Access token was not returned by the server.");
      }

      const accessTokenKey  = "application_manager_access_token";
      const refreshTokenKey = "application_manager_refresh_token";

      if (rememberMe) {
        localStorage.setItem(accessTokenKey, accessToken);
        sessionStorage.removeItem(accessTokenKey);
        if (refreshToken) {
          localStorage.setItem(refreshTokenKey, refreshToken);
          sessionStorage.removeItem(refreshTokenKey);
        }
      } else {
        sessionStorage.setItem(accessTokenKey, accessToken);
        localStorage.removeItem(accessTokenKey);
        if (refreshToken) {
          sessionStorage.setItem(refreshTokenKey, refreshToken);
          localStorage.removeItem(refreshTokenKey);
        }
      }

      const currentUser = await getCurrentUser();
      localStorage.setItem("auth_user", JSON.stringify(currentUser));

      const rawRole =
        typeof currentUser?.role === "string"
          ? currentUser.role
          : (currentUser?.role as unknown as { name?: string })?.name ?? "";

      const role = rawRole.trim().toLowerCase();

      navigate(role === "admin" ? "/app/dashboard" : "/app/applications", {
        replace: true,
      });

    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Page heading ──────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize:     "1.25rem",
            fontWeight:   700,
            color:        "var(--ods-gray-900)",
            marginBottom: "0.25rem",
          }}
        >
          Sign in to your account
        </h1>
        <p
          style={{
            fontSize: "var(--ods-font-size-sm)",
            color:    "var(--ods-gray-600)",
            margin:   0,
          }}
        >
          Enter your credentials to continue.
        </p>
      </div>

      {/* ── Error alert ───────────────────────────────────────── */}
      {error && (
        <div
          className="ods-alert ods-alert-danger"
          role="alert"
          style={{ marginBottom: "1.25rem" }}
        >
          {error}
        </div>
      )}

      {/* ── Login form ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <Mail size={16} />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label
            htmlFor="password"
            className="form-label"
          >
            Password
          </label>

          <div className="input-group">
            <span className="input-group-text">
              <LockKeyhole size={16} />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="input-group-text"
              style={{
                cursor:     "pointer",
                background: "var(--ods-gray-100)",
                border:     "1px solid var(--ods-gray-400)",
                borderLeft: "none",
                color:      "var(--ods-gray-600)",
              }}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div
          className="mb-4"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <input
            id="rememberMe"
            type="checkbox"
            className="form-check-input"
            style={{ margin: 0, accentColor: "var(--ods-orange)" }}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
          />
          <label
            htmlFor="rememberMe"
            style={{
              fontSize: "var(--ods-font-size-sm)",
              color:    "var(--ods-gray-700)",
              cursor:   "pointer",
              margin:   0,
            }}
          >
            Remember me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isSubmitting}
          style={{ padding: "0.625rem" }}
        >
          {isSubmitting ? (
            <span
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            "0.5rem",
              }}
            >
              <span
                className="ods-spinner"
                style={{ width: "1rem", height: "1rem", borderWidth: 2 }}
              />
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>

      </form>

      {/* ── Footer ────────────────────────────────────────────── */}
      <p
        style={{
          textAlign:    "center",
          fontSize:     "var(--ods-font-size-sm)",
          color:        "var(--ods-gray-600)",
          marginTop:    "1.5rem",
          marginBottom: 0,
        }}
      >
        <Link
          to="/forgot-password"
          style={{ color: "var(--ods-orange)" }}
        >
          Forgot password?
        </Link>
      </p>

    </div>
  );
}
