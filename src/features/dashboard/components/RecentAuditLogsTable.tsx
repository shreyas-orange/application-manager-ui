// src/features/dashboard/components/RecentAuditLogsTable.tsx
import { EmptyState } from "@/components/ui";

import type { RecentAuditLog } from "../types/dashboard.types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecentAuditLogsTableProps {
  logs: RecentAuditLog[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function auditActionClass(action: string): string {
  const a = action.trim().toLowerCase();
  if (a === "create") return "ods-badge ods-badge-success";
  if (a === "delete") return "ods-badge ods-badge-danger";
  return "ods-badge ods-badge-info";
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RecentAuditLogsTable({ logs }: RecentAuditLogsTableProps) {
  return (
    <div className="ods-card">

      {/* ── Card header ───────────────────────────────────────── */}
      <div className="ods-card-header">
        <h2 className="ods-card-title">Recent Audit Logs</h2>

        {logs.length > 0 && (
          <span className="ods-badge ods-badge-neutral no-dot">
            {logs.length} {logs.length !== 1 ? "entries" : "entry"}
          </span>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="ods-card-body" style={{ padding: 0 }}>

        {/* Empty state */}
        {logs.length === 0 ? (
          <EmptyState compact icon="📋" text="No recent audit logs found." />
        ) : (

          /* Log list */
          <div>
            {logs.map((log, index) => (
              <article
                key={`${log.created_at}-${index}`}
                style={{
                  padding:      "0.875rem 1.25rem",
                  borderBottom: "1px solid var(--ods-gray-200)",
                  display:      "flex",
                  flexDirection: "column",
                  gap:          "0.375rem",
                }}
              >

                {/* ── Top row — user + module + action badge ── */}
                <div
                  style={{
                    display:         "flex",
                    justifyContent:  "space-between",
                    alignItems:      "center",
                    gap:             "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display:    "flex",
                      alignItems: "center",
                      gap:        "0.5rem",
                    }}
                  >
                    {/* User initial avatar */}
                    <div
                      style={{
                        width:           28,
                        height:          28,
                        background:      "var(--ods-orange)",
                        color:           "var(--ods-black)",
                        display:         "flex",
                        alignItems:      "center",
                        justifyContent:  "center",
                        fontSize:        "0.7rem",
                        fontWeight:      700,
                        flexShrink:      0,
                      }}
                    >
                      {String(log.user ?? "S").charAt(0).toUpperCase()}
                    </div>

                    {/* User name */}
                    <strong
                      style={{
                        fontSize: "var(--ods-font-size-sm)",
                        color:    "var(--ods-gray-900)",
                      }}
                    >
                      {log.user || "System"}
                    </strong>

                    {/* Module tag */}
                    {log.module && (
                      <span
                        style={{
                          fontSize:       "0.65rem",
                          color:          "var(--ods-gray-500)",
                          background:     "var(--ods-gray-100)",
                          padding:        "0.1rem 0.4rem",
                          border:         "1px solid var(--ods-gray-300)",
                          textTransform:  "uppercase",
                          letterSpacing:  "0.05em",
                        }}
                      >
                        {log.module}
                      </span>
                    )}
                  </div>

                  {/* Action badge */}
                  <span className={auditActionClass(log.action)}>
                    {log.action}
                  </span>
                </div>

                {/* ── Description ─────────────────────────────── */}
                {log.description && (
                  <p
                    style={{
                      fontSize:   "var(--ods-font-size-sm)",
                      color:      "var(--ods-gray-600)",
                      margin:     0,
                      paddingLeft: "2.25rem",
                    }}
                  >
                    {log.description}
                  </p>
                )}

                {/* ── Timestamp ───────────────────────────────── */}
                <time
                  style={{
                    fontSize:    "var(--ods-font-size-xs)",
                    color:       "var(--ods-gray-400)",
                    paddingLeft: "2.25rem",
                  }}
                >
                  {formatDate(log.created_at)}
                </time>

              </article>
            ))}
          </div>

        )}
      </div>
    </div>
  );
}
