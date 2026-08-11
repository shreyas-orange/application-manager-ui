import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck } from "lucide-react";

import { Spinner } from "@/components/ui";

import { useForgotPassword } from "../hooks/useForgotPassword";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgot-password.schema";
import { getAuthErrorMessage } from "../utils/auth-error";

export default function ForgotPasswordPage() {
  const resetMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const isLoading = isSubmitting || resetMutation.isPending;

  const onSubmit = async (values: ForgotPasswordFormValues): Promise<void> => {
    try {
      await resetMutation.mutateAsync(values);
    } catch {
      // Server error is shown below via resetMutation.isError.
    }
  };

  // ── Success state — shown once the request has gone through ────────
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
          <MailCheck size={24} />
        </div>
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--ods-gray-900)",
            marginBottom: "0.5rem",
          }}
        >
          Check your email
        </h1>
        <p
          style={{
            fontSize: "var(--ods-font-size-sm)",
            color: "var(--ods-gray-600)",
            margin: "0 0 1.5rem",
          }}
        >
          If an account exists for <strong>{getValues("email")}</strong>, we've sent a link to
          reset your password.
        </p>
        <Link to="/login" className="btn btn-outline-secondary w-100">
          Back to sign in
        </Link>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--ods-gray-900)",
            marginBottom: "0.25rem",
          }}
        >
          Reset your password
        </h1>
        <p
          style={{
            fontSize: "var(--ods-font-size-sm)",
            color: "var(--ods-gray-600)",
            margin: 0,
          }}
        >
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {resetMutation.isError && (
        <div className="ods-alert ods-alert-danger" role="alert" style={{ marginBottom: "1.25rem" }}>
          {getAuthErrorMessage(resetMutation.error)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
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
              autoComplete="email"
              className={`form-control${errors.email ? " is-invalid" : ""}`}
              placeholder="Enter your email address"
              disabled={isLoading}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <div className="invalid-feedback d-block">{errors.email.message}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={isLoading} style={{ padding: "0.625rem" }}>
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <Spinner size={16} />
              Sending link...
            </span>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          fontSize: "var(--ods-font-size-sm)",
          color: "var(--ods-gray-600)",
          marginTop: "1.5rem",
          marginBottom: 0,
        }}
      >
        <Link to="/login">Back to sign in</Link>
      </p>
    </div>
  );
}
