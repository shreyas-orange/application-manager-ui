// src/features/auth/pages/RegisterPage.tsx
import { useState }                    from "react";
import { Link, useNavigate }           from "react-router-dom";
import { useForm }                     from "react-hook-form";
import { zodResolver }                 from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus }       from "lucide-react";

import { Spinner }                     from "@/components/ui";

import { useRegister }                 from "../hooks/useRegister";
import { registerSchema, type RegisterFormValues } from "../schemas/register.schema";
import { getAuthErrorMessage }         from "../utils/auth-error";

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate         = useNavigate();
  const registerMutation = useRegister();

  const [serverError, setServerError]       = useState<string | null>(null);
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirmPw, setShowConfirmPw]   = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver:      zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm_password: "" },
  });

  const onSubmit = async (formValues: RegisterFormValues): Promise<void> => {
    setServerError(null);
    try {
      await registerMutation.mutateAsync(formValues);
      navigate("/app/applications", { replace: true });
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    }
  };

  const isLoading = isSubmitting || registerMutation.isPending;

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Brand header ──────────────────────────────────────── */}
      <div
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "0.75rem",
          marginBottom: "1.75rem",
        }}
      >
        <div
          style={{
            width:           44,
            height:          44,
            background:      "var(--ods-orange)",
            color:           "var(--ods-black)",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            flexShrink:      0,
          }}
        >
          <UserPlus size={22} />
        </div>

        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize:   "1.1rem",
              color:      "var(--ods-gray-900)",
              lineHeight: 1.2,
            }}
          >
            Application Manager
          </div>
          <div
            style={{
              fontSize: "0.75rem",
              color:    "var(--ods-gray-500)",
            }}
          >
            Create your account
          </div>
        </div>
      </div>

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
          Create your account
        </h1>
        <p
          style={{
            fontSize: "var(--ods-font-size-sm)",
            color:    "var(--ods-gray-600)",
            margin:   0,
          }}
        >
          Register to access Application Manager.
        </p>
      </div>

      {/* ── Server error ──────────────────────────────────────── */}
      {serverError && (
        <div
          className="ods-alert ods-alert-danger"
          role="alert"
          style={{ marginBottom: "1.25rem" }}
        >
          {serverError}
        </div>
      )}

      {/* ── Register form ─────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Full name */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={`form-control${errors.name ? " is-invalid" : ""}`}
            placeholder="Enter your full name"
            disabled={isLoading}
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name && (
            <div className="invalid-feedback">
              {errors.name.message}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`form-control${errors.email ? " is-invalid" : ""}`}
            placeholder="Enter your email address"
            disabled={isLoading}
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && (
            <div className="invalid-feedback">
              {errors.email.message}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-group">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`form-control${errors.password ? " is-invalid" : ""}`}
              placeholder="Create a password"
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
            <div className="invalid-feedback" style={{ display: "block" }}>
              {errors.password.message}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="mb-4">
          <label htmlFor="confirm_password" className="form-label">
            Confirm password
          </label>
          <div className="input-group">
            <input
              id="confirm_password"
              type={showConfirmPw ? "text" : "password"}
              autoComplete="new-password"
              className={`form-control${errors.confirm_password ? " is-invalid" : ""}`}
              placeholder="Repeat your password"
              disabled={isLoading}
              aria-invalid={Boolean(errors.confirm_password)}
              {...register("confirm_password")}
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
              onClick={() => setShowConfirmPw((prev) => !prev)}
              aria-label={showConfirmPw ? "Hide password" : "Show password"}
            >
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && (
            <div className="invalid-feedback" style={{ display: "block" }}>
              {errors.confirm_password.message}
            </div>
          )}
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
              Creating account...
            </span>
          ) : (
            "Create account"
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
        Already have an account?{" "}
        <Link to="/login">Sign in</Link>
      </p>

    </div>
  );
}
