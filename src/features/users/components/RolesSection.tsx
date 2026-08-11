import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";
import { EmptyState, Modal, PageLoader, useConfirmDialog } from "@/components/ui";

import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from "../hooks/useRoles";
import { roleFormSchema, type RoleFormValues } from "../schemas/role.schema";

import type { Role } from "../types/role.types";

export default function RolesSection() {
  const { confirm, dialog } = useConfirmDialog();
  const { data, isLoading, isError, error, refetch, isFetching } = useRoles();

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [pageError, setPageError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (modalOpen) {
      reset({ name: editingRole?.name ?? "" });
    }
  }, [modalOpen, editingRole, reset]);

  const roles = data ?? [];

  const openCreateModal = () => {
    setEditingRole(null);
    setPageError("");
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setPageError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }
    setModalOpen(false);
    setEditingRole(null);
  };

  const onSubmit = async (values: RoleFormValues) => {
    setPageError("");

    try {
      if (editingRole) {
        await updateMutation.mutateAsync({
          roleId: editingRole.id,
          data: { name: values.name },
        });
      } else {
        await createMutation.mutateAsync({ name: values.name });
      }
      setModalOpen(false);
      setEditingRole(null);
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (role: Role) => {
    const confirmed = await confirm({
      title: "Delete role",
      message: `Delete the role "${role.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    setPageError("");

    try {
      await deleteMutation.mutateAsync(role.id);
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <PageLoader compact label="Loading roles..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load roles"
        text={error instanceof Error ? error.message : "Something went wrong."}
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => {
              void refetch();
            }}
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span className="ods-list-count">
          <strong style={{ color: "var(--ods-gray-900)" }}>{roles.length}</strong>{" "}
          role{roles.length === 1 ? "" : "s"}
        </span>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openCreateModal}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <Plus size={15} />
            Add Role
          </button>
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────── */}
      {pageError && (
        <div className="ods-form-message error" style={{ margin: "0 0 1rem" }}>
          {pageError}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="ods-card">
        <div className="ods-card-body" style={{ padding: 0 }}>
          <div className="ods-table-wrapper">
            <table className="ods-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>Role</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <EmptyState compact icon="🛡️" text="No roles found." />
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => {
                    const isDeleting =
                      deleteMutation.isPending &&
                      deleteMutation.variables === role.id;

                    return (
                      <tr key={role.id}>
                        <td style={{ color: "var(--ods-gray-500)" }}>{role.id}</td>
                        <td>
                          <span className="ods-role-badge">{role.name}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.375rem" }}>
                            <button
                              type="button"
                              className="ods-action-btn"
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                openEditModal(role);
                              }}
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="ods-action-btn danger"
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                void handleDelete(role);
                              }}
                            >
                              <Trash2 size={14} />
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Role Modal ─────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingRole ? "Edit role" : "Add role"}
        description={
          editingRole ? "Update the role name." : "Create a new role for user accounts."
        }
        closeDisabled={createMutation.isPending || updateMutation.isPending}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
            <label htmlFor="role-name">Role name</label>
            <input
              id="role-name"
              type="text"
              placeholder="e.g. Manager"
              autoFocus
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <div className="invalid-feedback d-block">{errors.name.message}</div>
            )}
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <div className="ods-form-message error">
              {createMutation.isError
                ? getApiErrorMessage(createMutation.error)
                : getApiErrorMessage(updateMutation.error)}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--ods-gray-200)",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingRole
                  ? "Save changes"
                  : "Add Role"}
            </button>
          </div>
        </form>
      </Modal>

      {dialog}
    </div>
  );
}
