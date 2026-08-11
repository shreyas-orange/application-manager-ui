import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui";

import {
  inviteUserSchema,
  type InviteUserFormInput,
  type InviteUserFormValues,
} from "../schemas/user.schema";
import type { Role } from "../types/role.types";

interface InviteUserModalProps {
  open: boolean;
  roles: Role[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: InviteUserFormValues) => void;
}

const EMPTY_FORM: InviteUserFormInput = { first_name: "", last_name: "", email: "", role_id: "" };

export default function InviteUserModal({
  open,
  roles,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: InviteUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteUserFormInput, unknown, InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (open) {
      reset(EMPTY_FORM);
    }
  }, [open, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite user"
      description="Create a new user account and assign a role."
      closeDisabled={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="ods-form-grid" style={{ marginBottom: "1rem" }}>
          <div className="ods-form-group">
            <label htmlFor="invite-first-name">First name</label>
            <input
              id="invite-first-name"
              type="text"
              placeholder="Enter first name"
              aria-invalid={Boolean(errors.first_name)}
              {...register("first_name")}
            />
            {errors.first_name && (
              <div className="invalid-feedback d-block">{errors.first_name.message}</div>
            )}
          </div>

          <div className="ods-form-group">
            <label htmlFor="invite-last-name">Last name</label>
            <input
              id="invite-last-name"
              type="text"
              placeholder="Enter last name"
              aria-invalid={Boolean(errors.last_name)}
              {...register("last_name")}
            />
            {errors.last_name && (
              <div className="invalid-feedback d-block">{errors.last_name.message}</div>
            )}
          </div>
        </div>

        <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
          <label htmlFor="invite-email">Email address</label>
          <input
            id="invite-email"
            type="email"
            placeholder="user@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && (
            <div className="invalid-feedback d-block">{errors.email.message}</div>
          )}
        </div>

        <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
          <label htmlFor="invite-role">Role</label>
          <select id="invite-role" aria-invalid={Boolean(errors.role_id)} {...register("role_id")}>
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.role_id && (
            <div className="invalid-feedback d-block">{errors.role_id.message}</div>
          )}
        </div>

        {errorMessage && (
          <div className="ods-form-message error">{errorMessage}</div>
        )}

        <div
          style={{
            display:        "flex",
            justifyContent: "flex-end",
            gap:            "0.75rem",
            paddingTop:     "1rem",
            borderTop:      "1px solid var(--ods-gray-200)",
            marginTop:      "1rem",
          }}
        >
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Inviting..." : "Invite User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
