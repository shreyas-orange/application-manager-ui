import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useUsers } from "../hooks/useUsers";
import { useCreateUser } from "../hooks/useCreateUser";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useDeleteUser } from "../hooks/useDeleteUser";

import type { User } from "../types/user.types";


const PAGE_SIZE = 10;

interface EditUserForm {
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

interface InviteUserForm {
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
}

const EMPTY_INVITE_FORM: InviteUserForm = {
  first_name: "",
  last_name: "",
  email: "",
  role_id: "",
};

const ROLE_OPTIONS = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Manager" },
  { id: 3, name: "User" },
];

function validateName(
  value: string,
  fieldName: string,
): string | null {
  const trimmedValue = value.trim();

  if (
    trimmedValue.length < 2 ||
    trimmedValue.length > 50
  ) {
    return `${fieldName} must be between 2 and 50 characters.`;
  }

  if (!/^[A-Za-z\s'-]+$/.test(trimmedValue)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes.`;
  }

  return null;
}

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(
  firstName?: string,
  lastName?: string,
): string {
  const firstInitial =
    firstName?.trim().charAt(0) ?? "";

  const lastInitial =
    lastName?.trim().charAt(0) ?? "";

  return (
    `${firstInitial}${lastInitial}`.toUpperCase() ||
    "U"
  );
}

export default function UsersPage() {
  const [searchInput, setSearchInput] =
    useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [editForm, setEditForm] =
    useState<EditUserForm>({
      first_name: "",
      last_name: "",
      email: "",
      is_active: true,
    });

  const [
    isInviteModalOpen,
    setIsInviteModalOpen,
  ] = useState(false);

  const [inviteForm, setInviteForm] =
    useState<InviteUserForm>(
      EMPTY_INVITE_FORM,
    );

  const [
    inviteValidationError,
    setInviteValidationError,
  ] = useState<string | null>(null);

  const [
    editValidationError,
    setEditValidationError,
  ] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUsers({
    page,
    pageSize: PAGE_SIZE,
    search,
  });

  const createUserMutation =
    useCreateUser();
  const updateUserMutation =
    useUpdateUser();
  const deleteUserMutation =
    useDeleteUser();

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? page;

  const totalPages = Math.max(
    1,
    data?.total_pages ?? 1,
  );

  useEffect(() => {
    if (
      data &&
      data.total_pages > 0 &&
      page > data.total_pages
    ) {
      setPage(data.total_pages);
    }
  }, [data, page]);

  useEffect(() => {
    if (
      data &&
      data.total === 0 &&
      page > 1
    ) {
      setPage(1);
    }
  }, [data, page]);

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const openInviteModal = () => {
    setInviteForm(EMPTY_INVITE_FORM);
    setInviteValidationError(null);
    createUserMutation.reset();
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    if (createUserMutation.isPending) {
      return;
    }

    setIsInviteModalOpen(false);
    setInviteValidationError(null);
    createUserMutation.reset();
  };

  const handleInviteUser = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setInviteValidationError(null);

    const firstName =
      inviteForm.first_name.trim();
    const lastName =
      inviteForm.last_name.trim();
    const email =
      inviteForm.email.trim().toLowerCase();
    const roleId = Number(inviteForm.role_id);

    const firstNameError = validateName(
      firstName,
      "First name",
    );

    if (firstNameError) {
      setInviteValidationError(
        firstNameError,
      );
      return;
    }

    const lastNameError = validateName(
      lastName,
      "Last name",
    );

    if (lastNameError) {
      setInviteValidationError(
        lastNameError,
      );
      return;
    }

    if (!email) {
      setInviteValidationError(
        "Email is required.",
      );
      return;
    }

    if (
      !Number.isInteger(roleId) ||
      roleId <= 0
    ) {
      setInviteValidationError(
        "Please select a valid role.",
      );
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        role_id: roleId,
      });

      setIsInviteModalOpen(false);
      setInviteForm(EMPTY_INVITE_FORM);
      setPage(1);
    } catch {
      // The mutation error is displayed in the modal.
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditValidationError(null);
    updateUserMutation.reset();

    setEditForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email,
      is_active: user.is_active,
    });
  };

  const closeEditModal = () => {
    if (updateUserMutation.isPending) {
      return;
    }

    setEditingUser(null);
    setEditValidationError(null);
    updateUserMutation.reset();
  };

  const handleUpdateUser = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setEditValidationError(null);

    const firstName =
      editForm.first_name.trim();
    const lastName =
      editForm.last_name.trim();
    const email =
      editForm.email.trim().toLowerCase();

    const firstNameError = validateName(
      firstName,
      "First name",
    );

    if (firstNameError) {
      setEditValidationError(
        firstNameError,
      );
      return;
    }

    const lastNameError = validateName(
      lastName,
      "Last name",
    );

    if (lastNameError) {
      setEditValidationError(
        lastNameError,
      );
      return;
    }

    if (!email) {
      setEditValidationError(
        "Email is required.",
      );
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          is_active: editForm.is_active,
        },
      });

      setEditingUser(null);
    } catch {
      // The mutation error is displayed in the modal.
    }
  };

  const handleDeleteUser = async (
    user: User,
  ) => {
    const fullName =
      [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || user.email;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${fullName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(
        user.id,
      );

      if (
        users.length === 1 &&
        currentPage > 1
      ) {
        setPage((previousPage) =>
          Math.max(1, previousPage - 1),
        );
      }
    } catch {
      // The mutation error is displayed above the table.
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          minHeight:      "60vh",
          gap:            "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading users...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load users</div>
        <p className="ods-empty-text">
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading users."}
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
    <>
      <div>

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="ods-page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">
              Manage user accounts and roles.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openInviteModal}
            >
              <Plus size={16} style={{ marginRight: "0.35rem" }} />
              Invite User
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={isFetching}
              onClick={() => {
                void refetch();
              }}
            >
              {isFetching
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* ── Main panel ──────────────────────────────────────── */}
        <div className="ods-card">

          {/* ── Toolbar ───────────────────────────────────────── */}
          <div className="ods-card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
            <form
              onSubmit={handleSearch}
              style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 260 }}
            >
              <div className="ods-search" style={{ flex: 1 }}>
                <Search className="ods-search-icon" size={15} />
                <input
                  type="search"
                  className="form-control form-control-sm"
                  value={searchInput}
                  placeholder="Search by name or email"
                  aria-label="Search users"
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isFetching}>
                Search
              </button>
            </form>

            {(search || searchInput) && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleClearSearch}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>

          {/* ── Result count ──────────────────────────────────── */}
          <div className="ods-list-toolbar">
            <span className="ods-list-count">
              <strong style={{ color: "var(--ods-gray-900)" }}>{total}</strong> user{total === 1 ? "" : "s"}
            </span>
          </div>

          {/* ── Error message ─────────────────────────────────── */}
          {(deleteUserMutation.isError || updateUserMutation.isError) && (
            <div className="ods-form-message error" style={{ margin: "1rem 1.25rem" }}>
              {deleteUserMutation.error instanceof Error
                ? deleteUserMutation.error.message
                : updateUserMutation.error instanceof Error
                  ? updateUserMutation.error.message
                  : "Unable to complete the operation."}
            </div>
          )}

          {/* ── Table ─────────────────────────────────────────── */}
          <div className="ods-card-body" style={{ padding: 0 }}>
            <div className="ods-table-wrapper">
              <table className="ods-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="ods-empty-state" style={{ padding: "2rem" }}>
                          <span className="ods-empty-icon">👤</span>
                          <p className="ods-empty-text">
                            {search
                              ? "No users match your search."
                              : "No users found."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const fullName =
                        [
                          user.first_name,
                          user.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ")
                          .trim() || "Unnamed user";

                      const isDeleting =
                        deleteUserMutation.isPending &&
                        deleteUserMutation.variables ===
                          user.id;

                      return (
                        <tr key={user.id}>
                          <td style={{ color: "var(--ods-gray-500)" }}>{user.id}</td>

                          <td>
                            <div className="ods-user-cell">
                              <div className="ods-user-avatar-sm">
                                {getInitials(
                                  user.first_name,
                                  user.last_name,
                                )}
                              </div>
                              <span style={{ fontWeight: 600, color: "var(--ods-gray-900)" }}>{fullName}</span>
                            </div>
                          </td>

                          <td style={{ color: "var(--ods-gray-600)" }}>{user.email}</td>

                          <td>
                            <span className="ods-role-badge">
                              {user.role?.name ?? "No role"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`ods-status-badge ${user.is_active ? "active" : "inactive"}`}
                            >
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td style={{ color: "var(--ods-gray-500)", whiteSpace: "nowrap" }}>
                            {formatDate(user.created_at)}
                          </td>

                          <td>
                            <div style={{ display: "flex", gap: "0.375rem" }}>
                              <button
                                type="button"
                                className="ods-action-btn"
                                disabled={deleteUserMutation.isPending}
                                onClick={() => {
                                  openEditModal(user);
                                }}
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                className="ods-action-btn danger"
                                disabled={
                                  deleteUserMutation.isPending ||
                                  updateUserMutation.isPending
                                }
                                onClick={() => {
                                  void handleDeleteUser(user);
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

          {/* ── Pagination ────────────────────────────────────── */}
          <div className="ods-pagination">
            <span className="ods-pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <div className="ods-pagination-actions">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage <= 1 || isFetching}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                }}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage >= totalPages || users.length === 0 || isFetching}
                onClick={() => {
                  setPage((current) => Math.min(totalPages, current + 1));
                }}
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Invite User Modal ──────────────────────────────────── */}
      {isInviteModalOpen && (
        <div
          className="ods-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeInviteModal();
            }
          }}
        >
          <div
            className="ods-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-user-title"
          >
            <div className="ods-modal-header">
              <div>
                <h2 className="ods-modal-title" id="invite-user-title">
                  Invite user
                </h2>
                <p style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", margin: "0.25rem 0 0" }}>
                  Create a new user account and assign a role.
                </p>
              </div>
              <button
                type="button"
                className="ods-modal-close"
                aria-label="Close invite user modal"
                disabled={createUserMutation.isPending}
                onClick={closeInviteModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleInviteUser}
              style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}
            >
              <div className="ods-form-grid" style={{ marginBottom: "1rem" }}>
                <div className="ods-form-group">
                  <label htmlFor="invite-first-name">First name</label>
                  <input
                    id="invite-first-name"
                    type="text"
                    value={inviteForm.first_name}
                    minLength={2}
                    maxLength={50}
                    required
                    placeholder="Enter first name"
                    onChange={(event) => {
                      setInviteForm((current) => ({
                        ...current,
                        first_name: event.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="ods-form-group">
                  <label htmlFor="invite-last-name">Last name</label>
                  <input
                    id="invite-last-name"
                    type="text"
                    value={inviteForm.last_name}
                    minLength={2}
                    maxLength={50}
                    required
                    placeholder="Enter last name"
                    onChange={(event) => {
                      setInviteForm((current) => ({
                        ...current,
                        last_name: event.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
                <label htmlFor="invite-email">Email address</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  required
                  placeholder="user@example.com"
                  onChange={(event) => {
                    setInviteForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }));
                  }}
                />
              </div>

              <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
                <label htmlFor="invite-role">Role</label>
                <select
                  id="invite-role"
                  value={inviteForm.role_id}
                  required
                  onChange={(event) => {
                    setInviteForm((current) => ({
                      ...current,
                      role_id: event.target.value,
                    }));
                  }}
                >
                  <option value="">Select a role</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {inviteValidationError && (
                <div className="ods-form-message error">
                  {inviteValidationError}
                </div>
              )}

              {createUserMutation.isError && (
                <div className="ods-form-message error">
                  {createUserMutation.error instanceof Error
                    ? createUserMutation.error.message
                    : "Unable to invite user."}
                </div>
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
                  disabled={createUserMutation.isPending}
                  onClick={closeInviteModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "Inviting..." : "Invite User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ────────────────────────────────────── */}
      {editingUser && (
        <div
          className="ods-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div
            className="ods-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
          >
            <div className="ods-modal-header">
              <div>
                <h2 className="ods-modal-title" id="edit-user-title">
                  Edit user
                </h2>
                <p style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", margin: "0.25rem 0 0" }}>
                  Update the user's account information.
                </p>
              </div>
              <button
                type="button"
                className="ods-modal-close"
                aria-label="Close edit user modal"
                disabled={updateUserMutation.isPending}
                onClick={closeEditModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateUser}
              style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}
            >
              <div className="ods-form-grid" style={{ marginBottom: "1rem" }}>
                <div className="ods-form-group">
                  <label htmlFor="edit-first-name">First name</label>
                  <input
                    id="edit-first-name"
                    type="text"
                    value={editForm.first_name}
                    minLength={2}
                    maxLength={50}
                    required
                    onChange={(event) => {
                      setEditForm((current) => ({
                        ...current,
                        first_name: event.target.value,
                      }));
                    }}
                  />
                </div>

                <div className="ods-form-group">
                  <label htmlFor="edit-last-name">Last name</label>
                  <input
                    id="edit-last-name"
                    type="text"
                    value={editForm.last_name}
                    minLength={2}
                    maxLength={50}
                    required
                    onChange={(event) => {
                      setEditForm((current) => ({
                        ...current,
                        last_name: event.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="ods-form-group" style={{ marginBottom: "1rem" }}>
                <label htmlFor="edit-email">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  readOnly
                  style={{ background: "var(--ods-gray-100)", color: "var(--ods-gray-500)" }}
                />
              </div>

              <div className="ods-status-toggle" style={{ marginBottom: "1rem" }}>
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(event) => {
                    setEditForm((current) => ({
                      ...current,
                      is_active: event.target.checked,
                    }));
                  }}
                />
                <label htmlFor="edit-active">
                  User account is active
                </label>
              </div>

              {editValidationError && (
                <div className="ods-form-message error">
                  {editValidationError}
                </div>
              )}

              {updateUserMutation.isError && (
                <div className="ods-form-message error">
                  {updateUserMutation.error instanceof Error
                    ? updateUserMutation.error.message
                    : "Unable to update user."}
                </div>
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
                  disabled={updateUserMutation.isPending}
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
