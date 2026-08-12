// src/features/profile/pages/ProfilePage.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, User as UserIcon } from "lucide-react";

import { PageHeader, PageLoader, Spinner } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/api-error";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getUserRole } from "@/features/auth/utils/get-user-role";

import { useChangePassword } from "../hooks/useChangePassword";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/change-password.schema";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const changePasswordMutation = useChangePassword();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const isLoadingSubmit = isSubmitting || changePasswordMutation.isPending;

  const onSubmit = async (values: ChangePasswordFormValues) => {
    changePasswordMutation.reset();

    try {
      await changePasswordMutation.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      reset();
    } catch {
      // Error is displayed via changePasswordMutation.isError below.
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading profile..." />;
  }

  const role = getUserRole(user);

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account and password." />

      {/* ── Account info ─────────────────────────────────────────── */}
      <div className="ods-card" style={{ marginBottom: "1.5rem" }}>
        <div className="ods-card-header">
          <h2 className="ods-card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <UserIcon size={16} />
            Account
          </h2>
        </div>
        <div className="ods-card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
                Name
              </label>
              <div style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-900)" }}>
                {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "NA"}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
                Email
              </label>
              <div style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-900)" }}>
                {user?.email || "NA"}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
                Role
              </label>
              <span className="ods-role-badge" style={{ textTransform: "capitalize" }}>
                {role || "NA"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Change password ─────────────────────────────────────── */}
      <div className="ods-card">
        <div className="ods-card-header">
          <h2 className="ods-card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <KeyRound size={16} />
            Change Password
          </h2>
        </div>
        <div className="ods-card-body">
          {changePasswordMutation.isError && (
            <div className="ods-alert ods-alert-danger" role="alert" style={{ marginBottom: "1.25rem" }}>
              {getApiErrorMessage(changePasswordMutation.error)}
            </div>
          )}

          {changePasswordMutation.isSuccess && (
            <div className="ods-alert ods-alert-success" role="status" style={{ marginBottom: "1.25rem" }}>
              Your password has been updated.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ maxWidth: 420 }}>
            <div className="mb-3">
              <label htmlFor="current_password" className="form-label">Current password</label>
              <div className="input-group">
                <input
                  id="current_password"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  className={`form-control${errors.current_password ? " is-invalid" : ""}`}
                  disabled={isLoadingSubmit}
                  aria-invalid={Boolean(errors.current_password)}
                  {...register("current_password")}
                />
                <button
                  type="button"
                  className="input-group-text"
                  style={{ cursor: "pointer", background: "var(--ods-gray-100)", border: "1px solid var(--ods-gray-400)", borderLeft: "none", color: "var(--ods-gray-600)" }}
                  onClick={() => setShowCurrent((prev) => !prev)}
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.current_password && (
                <div className="invalid-feedback d-block">{errors.current_password.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="new_password" className="form-label">New password</label>
              <div className="input-group">
                <input
                  id="new_password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-control${errors.new_password ? " is-invalid" : ""}`}
                  disabled={isLoadingSubmit}
                  aria-invalid={Boolean(errors.new_password)}
                  {...register("new_password")}
                />
                <button
                  type="button"
                  className="input-group-text"
                  style={{ cursor: "pointer", background: "var(--ods-gray-100)", border: "1px solid var(--ods-gray-400)", borderLeft: "none", color: "var(--ods-gray-600)" }}
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-control${errors.confirm_password ? " is-invalid" : ""}`}
                  disabled={isLoadingSubmit}
                  aria-invalid={Boolean(errors.confirm_password)}
                  {...register("confirm_password")}
                />
                <button
                  type="button"
                  className="input-group-text"
                  style={{ cursor: "pointer", background: "var(--ods-gray-100)", border: "1px solid var(--ods-gray-400)", borderLeft: "none", color: "var(--ods-gray-600)" }}
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && (
                <div className="invalid-feedback d-block">{errors.confirm_password.message}</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoadingSubmit}>
              {isLoadingSubmit ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Spinner size={16} />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
