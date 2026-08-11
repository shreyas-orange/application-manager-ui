// src/features/dashboard/components/RecentUploadsTable.tsx
import { EmptyState } from "@/components/ui";

import type { RecentUpload } from "../types/dashboard.types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecentUploadsTableProps {
  uploads: RecentUpload[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function uploadStatusClass(status: string): string {
  const s = status.trim().toLowerCase();

  if (s === "completed" || s === "success")
    return "ods-badge ods-badge-success";

  if (s === "failed" || s === "failure")
    return "ods-badge ods-badge-danger";

  if (s === "in progress" || s === "in_progress" || s === "processing")
    return "ods-badge ods-badge-warning";

  return "ods-badge ods-badge-neutral";
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RecentUploadsTable({ uploads }: RecentUploadsTableProps) {
  return (
    <div className="ods-card">

      {/* ── Card header ───────────────────────────────────────── */}
      <div className="ods-card-header">
        <h2 className="ods-card-title">Recent Uploads</h2>

        {/* Upload count badge */}
        {uploads.length > 0 && (
          <span className="ods-badge ods-badge-neutral no-dot">
            {uploads.length} file{uploads.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="ods-card-body" style={{ padding: 0 }}>

        {/* Empty state */}
        {uploads.length === 0 ? (
          <EmptyState compact icon="📂" text="No recent uploads found." />
        ) : (

          /* Table */
          <div className="ods-table-wrapper">
            <table className="ods-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Uploaded By</th>
                  <th>Created At</th>
                </tr>
              </thead>

              <tbody>
                {uploads.map((upload) => (
                  <tr key={upload.id}>

                    {/* File name */}
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color:      "var(--ods-gray-900)",
                          fontSize:   "var(--ods-font-size-sm)",
                        }}
                      >
                        {upload.file_name}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td>
                      <span className={uploadStatusClass(upload.status)}>
                        {upload.status}
                      </span>
                    </td>

                    {/* Uploaded by */}
                    <td style={{ color: "var(--ods-gray-600)" }}>
                      {upload.uploaded_by || "—"}
                    </td>

                    {/* Date */}
                    <td style={{ color: "var(--ods-gray-600)" }}>
                      {formatDate(upload.created_at)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}
      </div>
    </div>
  );
}
