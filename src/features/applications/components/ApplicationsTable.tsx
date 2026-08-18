import { EmptyState } from "@/components/ui";

import { getCloudNames, getMigrationStatus, getOwnerByType, getStatusBadgeClass } from "../utils/status";
import type { Application } from "../types/application.types";

function getOwnerName(app: Application, ownerType: string): string {
  return getOwnerByType(app, ownerType)?.owner_name || "NA";
}

interface ApplicationsTableProps {
  applications: Application[];
  onOpen: (app: Application) => void;
}

export default function ApplicationsTable({ applications, onOpen }: ApplicationsTableProps) {
  return (
    <div className="ods-table-wrapper">
      <table className="ods-table">
        <thead>
          <tr>
            <th>Application</th>
            <th>Domain</th>
            <th>DevOps Owner</th>
            <th>DOMs</th>
            <th>Cloud</th>
            <th>Migration</th>
            <th>Progress</th>
            <th>NS Migration</th>
            <th>Nexus</th>
            <th>Security (RootId) PROD</th>
            <th>Security (Net Pol) PROD</th>
            <th>Sov Type</th>
            <th>DX-uid</th>
            <th>MCP-id</th>
          </tr>
        </thead>

        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={14}>
                <EmptyState compact icon="📋" text="No applications found." />
              </td>
            </tr>
          ) : (
            applications.map((app) => {
              const migStatus = getMigrationStatus(app);
              const progress  = app.migration?.migration_progress ?? 0;

              return (
                <tr
                  key={app.id}
                  onClick={() => onOpen(app)}
                  style={{ cursor: "pointer" }}
                  title={`Open ${app.application_name}`}
                >
                  {/* Application name */}
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      <strong style={{ color: "var(--ods-gray-900)", fontSize: "var(--ods-font-size-sm)" }}>
                        {app.application_name}
                      </strong>
                      <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
                        Carto: {app.carto_id || "NA"}
                      </span>
                      <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)" }}>
                        Basicat: {app.basicat || "NA"}
                      </span>
                    </div>
                  </td>

                  {/* Domain */}
                  <td style={{ color: "var(--ods-gray-700)" }}>
                    {app.confirmed_domain || app.domain || "NA"}
                  </td>

                  {/* Owners */}
                  <td style={{ color: "var(--ods-gray-600)" }}>{getOwnerName(app, "DevOps")}</td>
                  <td style={{ color: "var(--ods-gray-600)" }}>{getOwnerName(app, "Application Manager")}</td>

                  {/* Cloud */}
                  <td>
                    <span
                      style={{
                        fontSize:   "var(--ods-font-size-xs)",
                        background: "var(--ods-gray-100)",
                        color:      "var(--ods-gray-700)",
                        padding:    "0.2rem 0.5rem",
                        border:     "1px solid var(--ods-gray-300)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getCloudNames(app)}
                    </span>
                  </td>

                  {/* Migration status badge */}
                  <td>
                    <span
                      className={getStatusBadgeClass(migStatus)}
                      style={{ textTransform: "none" }}
                    >
                      {migStatus}
                    </span>
                  </td>

                  {/* Progress bar */}
                  <td style={{ minWidth: 100 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-600)", textAlign: "right" }}>
                        {progress}%
                      </span>
                      <div style={{ height: 6, background: "var(--ods-gray-200)", overflow: "hidden" }}>
                        <div
                          style={{
                            height:     "100%",
                            width:      `${Math.min(100, Math.max(0, progress))}%`,
                            background: progress >= 100 ? "var(--ods-success)" : "var(--ods-orange)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* NS Migration Progress */}
                  <td style={{ minWidth: 140 }}>
                    {app.migration?.ns_migration_progress ? (
                      <span
                        style={{
                          display:      "block",
                          fontSize:     "var(--ods-font-size-xs)",
                          color:        "var(--ods-gray-700)",
                          maxWidth:     180,
                          overflow:     "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace:   "nowrap",
                        }}
                        title={app.migration.ns_migration_progress}
                      >
                        {app.migration.ns_migration_progress.split("\n").map((s) => s.trim()).filter(Boolean).length}{" "}
                        ns migrated
                      </span>
                    ) : (
                      <span style={{ color: "var(--ods-gray-400)" }}>NA</span>
                    )}
                  </td>

                  {/* Nexus */}
                  <td style={{ color: "var(--ods-gray-600)" }}>{app.security?.nexus_status || "NA"}</td>

                  {/* Security (RootId) PROD */}
                  <td style={{ color: "var(--ods-gray-600)" }}>{app.security?.security_prod_status || "NA"}</td>

                  {/* Security (Net Pol) PROD */}
                  <td style={{ color: "var(--ods-gray-600)" }}>{app.security?.network_policy_status || "NA"}</td>

                  {/* Sov Type */}
                  <td style={{ color: "var(--ods-gray-600)" }}>{app.sov_type || "NA"}</td>

                  {/* DX-uid */}
                  <td style={{ color: "var(--ods-gray-600)" }}>{app.meta_data?.dx_uid || "NA"}</td>

                  {/* MCP-id */}
                  <td style={{ color: "var(--ods-gray-600)" }}>{app.meta_data?.mcp_id || "NA"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
