import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal } from "@/components/ui";

import { editUserSchema, type EditUserFormValues } from "../schemas/user.schema";
import type { User } from "../types/user.types";

interface EditUserModalProps {
  user: User | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: EditUserFormValues) => void;
}

export default function EditUserModal({
  user,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { first_name: "", last_name: "", email: "", is_active: true },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email,
        is_active: user.is_active,
      });
    }
  }, [user, reset]);

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title="Edit user"
      description="Update the user's account information."
      closeDisabled={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="ods-form-grid" style={{ marginBottom: "1rem" }}>
          <div className="ods-form-group">
            <label htmlFor="edit-first-name">First name</label>
            <input
              id="edit-first-name"
              type="text"
              aria-invalid={Boolean(errors.first_name)}
              {...register("first_name")}
            />
            {errors.first_name && (
              <div className="invalid-feedback d-block">{errors.first_name.message}</div>
            )}
          </div>

          <div className="ods-form-group">
            <label htmlFor="edit-last-name">Last name</label>
            <input
              id="edit-last-name"
              type="text"
              aria-invalid={Boolean(errors.last_name)}
              {...register("last_name")}
            />
            {errors.last_name && (
              <div className="invalid-feedback d-block">{errors.last_name.message}</div>
            )}
          </div>
        </div>

        <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
          <label htmlFor="edit-email">Email</label>
          <input
            id="edit-email"
            type="email"
            readOnly
            style={{ background: "var(--ods-gray-100)", color: "var(--ods-gray-500)" }}
            {...register("email")}
          />
        </div>

        <div className="ods-status-toggle" style={{ marginBottom: "1rem" }}>
          <input id="edit-active" type="checkbox" {...register("is_active")} />
          <label htmlFor="edit-active">User account is active</label>
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
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
