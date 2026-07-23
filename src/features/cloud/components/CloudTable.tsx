import {
  Pencil,
  PlugZap,
  Trash2,
} from "lucide-react";

import type {
  CloudConfiguration,
} from "../types/cloud";

interface CloudTableProps {
  items: CloudConfiguration[];
  page: number;
  pageSize: number;
  deletingId?: number;
  testingId?: number;
  onEdit: (
    cloud: CloudConfiguration,
  ) => void;
  onDelete: (
    cloud: CloudConfiguration,
  ) => void;
  onTest: (
    cloud: CloudConfiguration,
  ) => void;
}

export default function CloudTable({
  items,
  page,
  pageSize,
  deletingId,
  testingId,
  onEdit,
  onDelete,
  onTest,
}: CloudTableProps) {
  return (
    <div className="ods-table-wrapper">
      <table className="ods-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Provider</th>
            <th>Region</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className="ods-empty-state" style={{ padding: "2rem" }}>
                  <span className="ods-empty-icon">☁️</span>
                  <p className="ods-empty-text">
                    No cloud configurations found.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((cloud, index) => (
              <tr key={cloud.id}>
                <td style={{ color: "var(--ods-gray-500)" }}>
                  {(page - 1) * pageSize + index + 1}
                </td>

                <td>
                  <strong style={{ color: "var(--ods-gray-900)" }}>
                    {cloud.name}
                  </strong>
                </td>

                <td>
                  <span className="ods-role-badge">
                    {cloud.provider}
                  </span>
                </td>

                <td style={{ color: "var(--ods-gray-600)" }}>
                  {cloud.region || "—"}
                </td>

                <td>
                  <span
                    className={`ods-status-badge ${cloud.is_active ? "active" : "inactive"}`}
                  >
                    {cloud.is_active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td style={{ color: "var(--ods-gray-500)", whiteSpace: "nowrap" }}>
                  {new Date(cloud.created_at).toLocaleString()}
                </td>

                <td>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button
                      type="button"
                      className="ods-icon-btn"
                      title="Test connection"
                      disabled={testingId === cloud.id}
                      onClick={() => onTest(cloud)}
                    >
                      <PlugZap size={16} />
                    </button>

                    <button
                      type="button"
                      className="ods-icon-btn"
                      title="Edit"
                      onClick={() => onEdit(cloud)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="ods-icon-btn danger"
                      title="Delete"
                      disabled={deletingId === cloud.id}
                      onClick={() => onDelete(cloud)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
