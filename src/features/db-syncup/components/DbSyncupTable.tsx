import { Trash2 } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { sanitizeDomainName } from "@/features/applications/utils/domain";

import { getPriorityBadgeClass } from "../constants";
import type { DbSyncup } from "../types/db-syncup.types";

interface DbSyncupTableProps {
  items: DbSyncup[];
  deletingId?: number | null;
  onRowClick?: (item: DbSyncup) => void;
  onDelete?: (item: DbSyncup) => void;
}

export default function DbSyncupTable({
  items,
  deletingId = null,
  onRowClick,
  onDelete,
}: DbSyncupTableProps) {
  const hasActions = Boolean(onDelete);
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
            <th style={{ minWidth: 140 }}>Application Priority</th>
            {hasActions && <th style={{ width: 50 }} />}
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
                  {item.application_name || "NA"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.carto_id || "NA"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {sanitizeDomainName(item.domain) || "NA"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.basicat || "NA"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.hosting || "NA"}
                </td>
                <td style={{ color: "var(--ods-gray-700)" }}>
                  {item.data_anonymization_status || "NA"}
                </td>
                <td>
                  <span className={getPriorityBadgeClass(item.requests?.[0]?.application_priority)}>
                    {item.requests?.[0]?.application_priority || "NA"}
                  </span>
                </td>
                {hasActions && (
                  <td>
                    <button
                      type="button"
                      className="ods-icon-btn danger"
                      title="Delete syncup"
                      disabled={deletingId === item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
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
