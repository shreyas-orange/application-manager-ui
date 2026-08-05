import { Pencil, Trash2 } from "lucide-react";

import {
  ENVIRONMENT_STATUS_FIELDS,
  getStatusBadgeClass,
} from "../constants";
import type { DbSyncup } from "../types/db-syncup.types";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 10);
}

interface DbSyncupTableProps {
  items: DbSyncup[];
  deletingId: number | null;
  onEdit: (item: DbSyncup) => void;
  onDelete: (item: DbSyncup) => void;
}

export default function DbSyncupTable({
  items,
  deletingId,
  onEdit,
  onDelete,
}: DbSyncupTableProps) {
  return (
    <div className="ods-table-wrapper">
      <table className="ods-table">
        <thead>
          <tr>
            <th style={{ minWidth: 48 }}>#</th>
            <th style={{ minWidth: 140 }}>Domain</th>
            <th style={{ minWidth: 130 }}>DB Validation</th>
            <th style={{ minWidth: 140 }}>Migration Incharge</th>
            <th style={{ minWidth: 110 }}>Date of Request</th>
            <th style={{ minWidth: 60 }}>Env</th>
            {ENVIRONMENT_STATUS_FIELDS.map((field) => (
              <th key={field.key} style={{ minWidth: 90 }}>
                {field.label}
              </th>
            ))}
            <th style={{ minWidth: 110 }}>Time in Prod</th>
            <th style={{ minWidth: 160 }}>Remarks</th>
            <th style={{ width: 84 }} />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={17}>
                <div
                  className="ods-empty-state"
                  style={{ padding: "2rem" }}
                >
                  <p className="ods-empty-text">
                    No DB syncup records found.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td
                  style={{
                    color: "var(--ods-gray-500)",
                    textAlign: "center",
                    fontSize: "var(--ods-font-size-xs)",
                  }}
                >
                  {item.serial_number}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.domain || "—"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.db_validation || "—"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.migration_incharge || "—"}
                </td>
                <td
                  style={{
                    color: "var(--ods-gray-600)",
                    whiteSpace: "nowrap",
                    fontSize: "var(--ods-font-size-sm)",
                  }}
                >
                  {formatDate(item.date_of_request)}
                </td>
                <td
                  style={{
                    color: "var(--ods-gray-700)",
                    textAlign: "center",
                  }}
                >
                  {item.environment_count}
                </td>
                {ENVIRONMENT_STATUS_FIELDS.map((field) => (
                  <td key={field.key}>
                    <span className={getStatusBadgeClass(item[field.key])}>
                      {item[field.key] || "—"}
                    </span>
                  </td>
                ))}
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.time_taken_in_prod || "—"}
                </td>
                <td
                  style={{
                    color: "var(--ods-gray-600)",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "var(--ods-font-size-xs)",
                  }}
                  title={item.remarks}
                >
                  {item.remarks || "—"}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.25rem",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      type="button"
                      className="ods-icon-btn"
                      title="Edit syncup"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="ods-icon-btn"
                      title="Delete syncup"
                      disabled={deletingId === item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      <Trash2 size={14} />
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
