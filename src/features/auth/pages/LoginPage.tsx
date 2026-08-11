// src/features/auth/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Spinner } from "@/components/ui";

import { useLogin } from "../hooks/useLogin";
import { getUserRole } from "../utils/get-user-role";
import { getAuthErrorMessage } from "../utils/auth-error";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [serverError, setServerError]   = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = isSubmitting || loginMutation.isPending;

  // ── Handlers ─────────────────────────────────────────────────────
  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setServerError("");

    try {
      const loginResponse = await loginMutation.mutateAsync({
        ...values,
        remember: rememberMe,
      });

      const role = getUserRole(loginResponse.user);
      const redirectTo =
        (location.state as { from?: string } | null)?.from ??
        (role === "admin" ? "/app/dashboard" : "/app/applications");

      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setServerError(getAuthErrorMessage(loginError));
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
      {serverError && (
        <div
          className="ods-alert ods-alert-danger"
          role="alert"
          style={{ marginBottom: "1.25rem" }}
        >
          {serverError}
        </div>
      )}

      {/* ── Login form ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>

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
              type="email"
              className={`form-control${errors.email ? " is-invalid" : ""}`}
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={isLoading}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <div className="invalid-feedback d-block">{errors.email.message}</div>
          )}
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
              type={showPassword ? "text" : "password"}
              className={`form-control${errors.password ? " is-invalid" : ""}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
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
          {errors.password && (
            <div className="invalid-feedback d-block">{errors.password.message}</div>
          )}
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
            disabled={isLoading}
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
          disabled={isLoading}
          style={{ padding: "0.625rem" }}
        >
          {isLoading ? (
            <span
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            "0.5rem",
              }}
            >
              <Spinner size={16} />
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
