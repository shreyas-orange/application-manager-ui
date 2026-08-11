import { Pencil, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

import type { User } from "../types/user.types";

function getInitials(firstName?: string, lastName?: string): string {
  const firstInitial = firstName?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
}

interface UsersTableProps {
  users: User[];
  search: string;
  deletingUserId?: number;
  isDeleting: boolean;
  isUpdating: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({
  users,
  search,
  deletingUserId,
  isDeleting,
  isUpdating,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
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
                <EmptyState
                  compact
                  icon="👤"
                  text={search ? "No users match your search." : "No users found."}
                />
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const fullName =
                [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
                "Unnamed user";

              const isDeletingThisUser = isDeleting && deletingUserId === user.id;

              return (
                <tr key={user.id}>
                  <td style={{ color: "var(--ods-gray-500)" }}>{user.id}</td>

                  <td>
                    <div className="ods-user-cell">
                      <div className="ods-user-avatar-sm">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--ods-gray-900)" }}>{fullName}</span>
                    </div>
                  </td>

                  <td style={{ color: "var(--ods-gray-600)" }}>{user.email}</td>

                  <td>
                    <span className="ods-role-badge">{user.role?.name ?? "No role"}</span>
                  </td>

                  <td>
                    <span className={`ods-status-badge ${user.is_active ? "active" : "inactive"}`}>
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
                        disabled={isDeleting}
                        onClick={() => onEdit(user)}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="ods-action-btn danger"
                        disabled={isDeleting || isUpdating}
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 size={14} />
                        {isDeletingThisUser ? "Deleting..." : "Delete"}
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
  );
}
