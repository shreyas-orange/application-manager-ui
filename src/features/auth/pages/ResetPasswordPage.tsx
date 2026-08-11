import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CircleCheck, KeyRound } from "lucide-react";

import { EmptyState, Spinner } from "@/components/ui";

import { useResetPassword } from "../hooks/useResetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password.schema";
import { getAuthErrorMessage } from "../utils/auth-error";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const resetMutation = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const isLoading = isSubmitting || resetMutation.isPending;

  // ── Missing/invalid link ────────────────────────────────────────
  if (!token) {
    return (
      <EmptyState
        icon="⚠️"
        title="Invalid reset link"
        text="This password reset link is missing or invalid. Request a new one to continue."
        action={
          <Link to="/forgot-password" className="btn btn-primary mt-3">
            Request a new link
          </Link>
        }
      />
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues): Promise<void> => {
    try {
      await resetMutation.mutateAsync({ token, new_password: values.new_password });
    } catch {
      // Error is shown below via resetMutation.isError.
    }
  };

  // ── Success state ────────────────────────────────────────────────
  if (resetMutation.isSuccess) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--ods-success-light)",
            color: "var(--ods-success)",
          }}
        >
          <CircleCheck size={24} />
        </div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ods-gray-900)", marginBottom: "0.5rem" }}>
          Password updated
        </h1>
        <p style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-600)", margin: "0 0 1.5rem" }}>
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link to="/login" className="btn btn-primary w-100">
          Sign in
        </Link>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ods-gray-900)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <KeyRound size={20} />
          Set a new password
        </h1>
        <p style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-600)", margin: 0 }}>
          Choose a new password for your account.
        </p>
      </div>

      {resetMutation.isError && (
        <div className="ods-alert ods-alert-danger" role="alert" style={{ marginBottom: "1.25rem" }}>
          {getAuthErrorMessage(resetMutation.error)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label htmlFor="new_password" className="form-label">New password</label>
          <div className="input-group">
            <input
              id="new_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`form-control${errors.new_password ? " is-invalid" : ""}`}
              placeholder="Create a new password"
              disabled={isLoading}
              aria-invalid={Boolean(errors.new_password)}
              {...register("new_password")}
            />
            <button
              type="button"
              className="input-group-text"
              style={{ cursor: "pointer", background: "var(--ods-gray-100)", border: "1px solid var(--ods-gray-400)", borderLeft: "none", color: "var(--ods-gray-600)" }}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.new_password && (
            <div className="invalid-feedback d-block">{errors.new_password.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="confirm_password" className="form-label">Confirm new password</label>
          <div className="input-group">
            <input
              id="confirm_password"
              type={showConfirmPw ? "text" : "password"}
              autoComplete="new-password"
              className={`form-control${errors.confirm_password ? " is-invalid" : ""}`}
              placeholder="Repeat your new password"
              disabled={isLoading}
              aria-invalid={Boolean(errors.confirm_password)}
              {...register("confirm_password")}
            />
            <button
              type="button"
              className="input-group-text"
              style={{ cursor: "pointer", background: "var(--ods-gray-100)", border: "1px solid var(--ods-gray-400)", borderLeft: "none", color: "var(--ods-gray-600)" }}
              onClick={() => setShowConfirmPw((prev) => !prev)}
              aria-label={showConfirmPw ? "Hide password" : "Show password"}
            >
              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && (
            <div className="invalid-feedback d-block">{errors.confirm_password.message}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={isLoading} style={{ padding: "0.625rem" }}>
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <Spinner size={16} />
              Updating password...
            </span>
          ) : (
            "Update password"
          )}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-600)", marginTop: "1.5rem", marginBottom: 0 }}>
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  );
}
