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
    <div className="table-container">
      <table className="data-table">
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
              <td
                colSpan={7}
                className="empty-table-cell"
              >
                No cloud configurations
                found.
              </td>
            </tr>
          ) : (
            items.map((cloud, index) => (
              <tr key={cloud.id}>
                <td>
                  {(page - 1) *
                    pageSize +
                    index +
                    1}
                </td>

                <td>
                  <strong>
                    {cloud.name}
                  </strong>
                </td>

                <td>
                  <span className="cloud-provider-badge">
                    {cloud.provider}
                  </span>
                </td>

                <td>
                  {cloud.region || "—"}
                </td>

                <td>
                  <span
                    className={
                      cloud.is_active
                        ? "cloud-status cloud-status--active"
                        : "cloud-status cloud-status--inactive"
                    }
                  >
                    {cloud.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                <td>
                  {new Date(
                    cloud.created_at,
                  ).toLocaleString()}
                </td>

                <td>
                  <div className="cloud-row-actions">
                    <button
                      type="button"
                      className="icon-button"
                      title="Test connection"
                      disabled={
                        testingId ===
                        cloud.id
                      }
                      onClick={() =>
                        onTest(cloud)
                      }
                    >
                      <PlugZap size={16} />
                    </button>

                    <button
                      type="button"
                      className="icon-button"
                      title="Edit"
                      onClick={() =>
                        onEdit(cloud)
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="icon-button icon-button--danger"
                      title="Delete"
                      disabled={
                        deletingId ===
                        cloud.id
                      }
                      onClick={() =>
                        onDelete(cloud)
                      }
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
