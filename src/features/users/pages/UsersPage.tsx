import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { useUsers } from "../hooks/useUsers";
import { useCreateUser } from "../hooks/useCreateUser";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useDeleteUser } from "../hooks/useDeleteUser";

import type { User } from "../types/user.types";

import "../styles/users.css";

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
      <div className="list-state">
        Loading users...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="list-state list-state--error">
        <h2>Unable to load users</h2>

        <p>
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading users."}
        </p>

        <button
          type="button"
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
      <section className="users-page">
        <div className="list-page-header">
          <div>
            <h1>Users</h1>
          </div>

          <div className="list-page-actions">
            <button
              type="button"
              className="primary-button"
              onClick={openInviteModal}
            >
              <Plus size={17} />
              Invite User
            </button>

            <button
              type="button"
              className="secondary-button"
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

        <div className="list-toolbar">
          <form
            className="list-search-form"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              value={searchInput}
              placeholder="Search by name or email"
              aria-label="Search users"
              onChange={(event) => {
                setSearchInput(
                  event.target.value,
                );
              }}
            />

            <button
              type="submit"
              disabled={isFetching}
            >
              Search
            </button>

            {(search || searchInput) && (
              <button
                type="button"
                className="clear-button"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            )}
          </form>

          <span className="list-count">
            {total} user
            {total === 1 ? "" : "s"}
          </span>
        </div>

        {(deleteUserMutation.isError ||
          updateUserMutation.isError) && (
          <div className="form-message form-message--error">
            {deleteUserMutation.error instanceof
            Error
              ? deleteUserMutation.error.message
              : updateUserMutation.error instanceof
                  Error
                ? updateUserMutation.error.message
                : "Unable to complete the operation."}
          </div>
        )}

        <div className="table-container">
          <table className="data-table">
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
                  <td
                    colSpan={7}
                    className="empty-table-cell"
                  >
                    {search
                      ? "No users match your search."
                      : "No users found."}
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
                      <td>{user.id}</td>

                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {getInitials(
                              user.first_name,
                              user.last_name,
                            )}
                          </div>

                          <span>{fullName}</span>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className="role-badge">
                          {user.role?.name ??
                            "No role"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            user.is_active
                              ? "status-badge status-badge--active"
                              : "status-badge status-badge--inactive"
                          }
                        >
                          {user.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          user.created_at,
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="action-button action-button--edit"
                            disabled={
                              deleteUserMutation.isPending
                            }
                            onClick={() => {
                              openEditModal(user);
                            }}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="action-button action-button--delete"
                            disabled={
                              deleteUserMutation.isPending ||
                              updateUserMutation.isPending
                            }
                            onClick={() => {
                              void handleDeleteUser(
                                user,
                              );
                            }}
                          >
                            <Trash2 size={15} />
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
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

        <div className="pagination">
          <button
            type="button"
            disabled={
              currentPage <= 1 ||
              isFetching
            }
            onClick={() => {
              setPage((current) =>
                Math.max(1, current - 1),
              );
            }}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of{" "}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              currentPage >= totalPages ||
              users.length === 0 ||
              isFetching
            }
            onClick={() => {
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1,
                ),
              );
            }}
          >
            Next
          </button>
        </div>
      </section>

      {isInviteModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeInviteModal();
            }
          }}
        >
          <div
            className="user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-user-title"
          >
            <div className="user-modal__header">
              <div>
                <h2 id="invite-user-title">
                  Invite user
                </h2>

                <p>
                  Create a new user account and
                  assign a role.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                aria-label="Close invite user modal"
                disabled={
                  createUserMutation.isPending
                }
                onClick={closeInviteModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="user-edit-form"
              onSubmit={handleInviteUser}
            >
              <div className="form-grid">
                <label>
                  <span>First name</span>

                  <input
                    type="text"
                    value={
                      inviteForm.first_name
                    }
                    minLength={2}
                    maxLength={50}
                    required
                    placeholder="Enter first name"
                    onChange={(event) => {
                      setInviteForm(
                        (current) => ({
                          ...current,
                          first_name:
                            event.target.value,
                        }),
                      );
                    }}
                  />
                </label>

                <label>
                  <span>Last name</span>

                  <input
                    type="text"
                    value={
                      inviteForm.last_name
                    }
                    minLength={2}
                    maxLength={50}
                    required
                    placeholder="Enter last name"
                    onChange={(event) => {
                      setInviteForm(
                        (current) => ({
                          ...current,
                          last_name:
                            event.target.value,
                        }),
                      );
                    }}
                  />
                </label>
              </div>

              <label>
                <span>Email address</span>

                <input
                  type="email"
                  value={inviteForm.email}
                  required
                  placeholder="user@example.com"
                  onChange={(event) => {
                    setInviteForm(
                      (current) => ({
                        ...current,
                        email:
                          event.target.value,
                      }),
                    );
                  }}
                />
              </label>

              <label>
                <span>Role</span>

                <select
                  value={inviteForm.role_id}
                  required
                  onChange={(event) => {
                    setInviteForm(
                      (current) => ({
                        ...current,
                        role_id:
                          event.target.value,
                      }),
                    );
                  }}
                >
                  <option value="">
                    Select a role
                  </option>

                  {ROLE_OPTIONS.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>

              {inviteValidationError && (
                <div className="form-message form-message--error">
                  {inviteValidationError}
                </div>
              )}

              {createUserMutation.isError && (
                <div className="form-message form-message--error">
                  {createUserMutation.error instanceof
                  Error
                    ? createUserMutation.error.message
                    : "Unable to invite user."}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    createUserMutation.isPending
                  }
                  onClick={closeInviteModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    createUserMutation.isPending
                  }
                >
                  {createUserMutation.isPending
                    ? "Inviting..."
                    : "Invite User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditModal();
            }
          }}
        >
          <div
            className="user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
          >
            <div className="user-modal__header">
              <div>
                <h2 id="edit-user-title">
                  Edit user
                </h2>

                <p>
                  Update the user's account
                  information.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                aria-label="Close edit user modal"
                disabled={
                  updateUserMutation.isPending
                }
                onClick={closeEditModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="user-edit-form"
              onSubmit={handleUpdateUser}
            >
              <div className="form-grid">
                <label>
                  <span>First name</span>

                  <input
                    type="text"
                    value={editForm.first_name}
                    minLength={2}
                    maxLength={50}
                    required
                    onChange={(event) => {
                      setEditForm(
                        (current) => ({
                          ...current,
                          first_name:
                            event.target.value,
                        }),
                      );
                    }}
                  />
                </label>

                <label>
                  <span>Last name</span>

                  <input
                    type="text"
                    value={editForm.last_name}
                    minLength={2}
                    maxLength={50}
                    required
                    onChange={(event) => {
                      setEditForm(
                        (current) => ({
                          ...current,
                          last_name:
                            event.target.value,
                        }),
                      );
                    }}
                  />
                </label>
              </div>

              <label>
                <span>Email</span>

                <input
                    type="email"
                    value={editForm.email}
                    readOnly
                    className="readonly-input"
                  />
              </label>

              <label className="status-toggle">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(event) => {
                    setEditForm(
                      (current) => ({
                        ...current,
                        is_active:
                          event.target.checked,
                      }),
                    );
                  }}
                />

                <span>
                  User account is active
                </span>
              </label>

              {editValidationError && (
                <div className="form-message form-message--error">
                  {editValidationError}
                </div>
              )}

              {updateUserMutation.isError && (
                <div className="form-message form-message--error">
                  {updateUserMutation.error instanceof
                  Error
                    ? updateUserMutation.error.message
                    : "Unable to update user."}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    updateUserMutation.isPending
                  }
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    updateUserMutation.isPending
                  }
                >
                  {updateUserMutation.isPending
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}