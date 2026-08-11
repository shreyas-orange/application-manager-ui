import { useEffect, useState, type FormEvent } from "react";

import { Plus, Search, X } from "lucide-react";

import { EmptyState, PageHeader, PageLoader, Tabs, useConfirmDialog } from "@/components/ui";

import { useUsers } from "../hooks/useUsers";
import { useCreateUser } from "../hooks/useCreateUser";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { useDeleteUser } from "../hooks/useDeleteUser";
import { useRoles } from "../hooks/useRoles";

import RolesSection from "../components/RolesSection";
import UsersTable from "../components/UsersTable";
import InviteUserModal from "../components/InviteUserModal";
import EditUserModal from "../components/EditUserModal";

import type { InviteUserFormValues, EditUserFormValues } from "../schemas/user.schema";
import type { User } from "../types/user.types";

const PAGE_SIZE = 10;

const USER_TABS = [
  { id: "users" as const, label: "Users" },
  { id: "roles" as const, label: "Roles" },
];

export default function UsersPage() {
  const { confirm, dialog } = useConfirmDialog();
  const [activeSection, setActiveSection] = useState<"users" | "roles">("users");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const { data: roles } = useRoles();
  const roleOptions = roles ?? [];

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? page;
  const totalPages = Math.max(1, data?.total_pages ?? 1);

  useEffect(() => {
    if (data && data.total_pages > 0 && page > data.total_pages) {
      setPage(data.total_pages);
    }
  }, [data, page]);

  useEffect(() => {
    if (data && data.total === 0 && page > 1) {
      setPage(1);
    }
  }, [data, page]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
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
    createUserMutation.reset();
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    if (createUserMutation.isPending) return;
    setIsInviteModalOpen(false);
    createUserMutation.reset();
  };

  const handleInviteSubmit = async (values: InviteUserFormValues) => {
    try {
      await createUserMutation.mutateAsync(values);
      setIsInviteModalOpen(false);
      setPage(1);
    } catch {
      // The mutation error is displayed in the modal.
    }
  };

  const openEditModal = (user: User) => {
    updateUserMutation.reset();
    setEditingUser(user);
  };

  const closeEditModal = () => {
    if (updateUserMutation.isPending) return;
    setEditingUser(null);
    updateUserMutation.reset();
  };

  const handleEditSubmit = async (values: EditUserFormValues) => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data: values,
      });
      setEditingUser(null);
    } catch {
      // The mutation error is displayed in the modal.
    }
  };

  const handleDeleteUser = async (user: User) => {
    const fullName =
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email;

    const confirmed = await confirm({
      title: "Delete user",
      message: `Are you sure you want to delete ${fullName}? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await deleteUserMutation.mutateAsync(user.id);

      if (users.length === 1 && currentPage > 1) {
        setPage((previousPage) => Math.max(1, previousPage - 1));
      }
    } catch {
      // The mutation error is displayed above the table.
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading users..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load users"
        text={error instanceof Error ? error.message : "Something went wrong while loading users."}
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
    <>
      <div>

        <PageHeader
          title="Users"
          subtitle="Manage user accounts and roles."
          actions={
            <>
              {activeSection === "users" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openInviteModal}
                >
                  <Plus size={16} style={{ marginRight: "0.35rem" }} />
                  Invite User
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={isFetching}
                onClick={() => {
                  void refetch();
                }}
              >
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>
            </>
          }
        />

        <Tabs items={USER_TABS} active={activeSection} onChange={setActiveSection} />

        {/* ── Roles section ───────────────────────────────────────── */}
        {activeSection === "roles" && <RolesSection />}

        {/* ── Main panel ──────────────────────────────────────── */}
        {activeSection === "users" && (
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
            <UsersTable
              users={users}
              search={search}
              deletingUserId={deleteUserMutation.variables}
              isDeleting={deleteUserMutation.isPending}
              isUpdating={updateUserMutation.isPending}
              onEdit={openEditModal}
              onDelete={(user) => { void handleDeleteUser(user); }}
            />
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
        )}

      </div>

      <InviteUserModal
        open={isInviteModalOpen}
        roles={roleOptions}
        isSubmitting={createUserMutation.isPending}
        errorMessage={
          createUserMutation.isError
            ? createUserMutation.error instanceof Error
              ? createUserMutation.error.message
              : "Unable to invite user."
            : null
        }
        onClose={closeInviteModal}
        onSubmit={(values) => { void handleInviteSubmit(values); }}
      />

      <EditUserModal
        user={editingUser}
        isSubmitting={updateUserMutation.isPending}
        errorMessage={
          updateUserMutation.isError
            ? updateUserMutation.error instanceof Error
              ? updateUserMutation.error.message
              : "Unable to update user."
            : null
        }
        onClose={closeEditModal}
        onSubmit={(values) => { void handleEditSubmit(values); }}
      />

      {dialog}
    </>
  );
}
