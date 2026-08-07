import {
  type FormEvent,
  useState,
} from "react";
import {
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";

import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from "../hooks/useRoles";

import type { Role } from "../types/role.types";

export default function RolesSection() {
  const { data, isLoading, isError, error, refetch, isFetching } = useRoles();

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");

  const roles = data ?? [];

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setValidationError(null);
    setPageError("");
    setModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setValidationError(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);
    setPageError("");

    const name = roleName.trim();

    if (name.length < 2 || name.length > 50) {
      setValidationError("Role name must be between 2 and 50 characters.");
      return;
    }

    try {
      if (editingRole) {
        await updateMutation.mutateAsync({
          roleId: editingRole.id,
          data: { name },
        });
      } else {
        await createMutation.mutateAsync({ name });
      }
      setModalOpen(false);
      setEditingRole(null);
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (role: Role) => {
    const confirmed = window.confirm(
      `Delete the role "${role.name}"?`,
    );
    if (!confirmed) return;

    setPageError("");

    try {
      await deleteMutation.mutateAsync(role.id);
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "30vh",
          gap: "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading roles...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load roles</div>
        <p className="ods-empty-text">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => {
            void refetch();
          }}
        >
          Try again
        </button>
      </div>
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
                      <div className="ods-empty-state" style={{ padding: "2rem" }}>
                        <span className="ods-empty-icon">🛡️</span>
                        <p className="ods-empty-text">No roles found.</p>
                      </div>
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
      {modalOpen && (
        <div
          className="ods-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="ods-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-modal-title"
          >
            <div className="ods-modal-header">
              <div>
                <h2 className="ods-modal-title" id="role-modal-title">
                  {editingRole ? "Edit role" : "Add role"}
                </h2>
                <p style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", margin: "0.25rem 0 0" }}>
                  {editingRole
                    ? "Update the role name."
                    : "Create a new role for user accounts."}
                </p>
              </div>
              <button
                type="button"
                className="ods-modal-close"
                aria-label="Close role modal"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}
            >
              <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
                <label htmlFor="role-name">Role name</label>
                <input
                  id="role-name"
                  type="text"
                  value={roleName}
                  minLength={2}
                  maxLength={50}
                  required
                  placeholder="e.g. Manager"
                  autoFocus
                  onChange={(event) => {
                    setRoleName(event.target.value);
                  }}
                />
              </div>

              {validationError && (
                <div className="ods-form-message error">
                  {validationError}
                </div>
              )}

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
          </div>
        </div>
      )}
    </div>
  );
}
