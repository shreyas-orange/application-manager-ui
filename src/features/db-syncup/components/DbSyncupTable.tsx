import { History, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/ui";

import { getStatusBadgeClass } from "../constants";
import type { DbSyncup } from "../types/db-syncup.types";

interface DbSyncupTableProps {
  items: DbSyncup[];
  deletingId?: number | null;
  onRowClick?: (item: DbSyncup) => void;
  onDelete?: (item: DbSyncup) => void;
  onHistory?: (item: DbSyncup) => void;
}

export default function DbSyncupTable({
  items,
  deletingId = null,
  onRowClick,
  onDelete,
  onHistory,
}: DbSyncupTableProps) {
  const hasActions = Boolean(onDelete || onHistory);
  const colSpan = 8;

  return (
    <div className="ods-table-wrapper">
      <table className="ods-table">
        <thead>
          <tr>
            <th style={{ minWidth: 180 }}>Application</th>
            <th style={{ minWidth: 130 }}>Carto</th>
            <th style={{ minWidth: 140 }}>Domain</th>
            <th style={{ minWidth: 130 }}>Basiat</th>
            <th style={{ minWidth: 140 }}>Hosting</th>
            <th style={{ minWidth: 180 }}>Data Anonymization</th>
            <th style={{ minWidth: 110 }}>Prod Status</th>
            {hasActions && <th style={{ width: 84 }} />}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={colSpan}>
                <EmptyState compact icon="🗄️" text="No DB syncup records found." />
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                style={{ cursor: onRowClick ? "pointer" : undefined }}
                title={onRowClick ? "Open syncup details" : undefined}
              >
                <td style={{ color: "var(--ods-gray-700)", fontWeight: 500 }}>
                  {item.application_name || "—"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.carto_id || "—"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.domain || "—"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.basicat || "—"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.hosting || "—"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.data_anonymization_status || "—"}
                </td>
                <td>
                  <span className={getStatusBadgeClass(item.prod_status)}>
                    {item.prod_status || "—"}
                  </span>
                </td>
                {hasActions && (
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
                      title="View history"
                      onClick={(e) => {
                        e.stopPropagation();
                        onHistory?.(item);
                      }}
                    >
                      <History size={14} />
                    </button>
                    <button
                      type="button"
                      className="ods-icon-btn"
                      title="Delete syncup"
                      disabled={deletingId === item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}