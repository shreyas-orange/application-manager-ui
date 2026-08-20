// src/features/applications/pages/ApplicationsPage.tsx
import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  CloudDownload,
  Download,
  Plus,
  RefreshCw,
} from "lucide-react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { normalizeValue } from "@/lib/format";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getUserRole } from "@/features/auth/utils/get-user-role";
import { isDbTeamRole } from "@/features/auth/utils/is-db-team-role";
import { getApiErrorMessage } from "@/lib/api-error";
import { downloadBlob, getResponseFilename } from "@/lib/download-file";

import ApplicationCreateModal from "../components/ApplicationCreateModal";
import OverviewStatCards from "../components/OverviewStatCards";
import ApplicationsToolbar from "../components/ApplicationsToolbar";
import ApplicationsTable from "../components/ApplicationsTable";
import { useAllApplications } from "../hooks/useAllApplications";
import { useApplicationDomains } from "../hooks/useApplicationDomains";
import { useSharePointSync } from "../hooks/useSharePointSync";
import { exportApplicationsExcel } from "../api/applications.api";
import { getMigrationStatus, normalizeStatus } from "../utils/status";
import { getApplicationOverviewSummary } from "../utils/application-overview";
import { sanitizeDomainName } from "../utils/domain";
import type { Application } from "../types/application.types";

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const navigate                  = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const isDbTeam = isDbTeamRole(getUserRole(currentUser));
  const isAdmin = getUserRole(currentUser) === "admin";
  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [cloudFilter, setCloudFilter]   = useState("all");
  const [createOpen, setCreateOpen]     = useState(false);
  const [message, setMessage]           = useState("");
  const [pageError, setPageError]       = useState("");
  const [isExporting, setIsExporting]   = useState(false);
  const sharePointSync = useSharePointSync();

  const pageSize = 10;

  const { data, isLoading, isError, error, isFetching, refetch } =
    useAllApplications({
      search,
      cloud: cloudFilter === "all" ? undefined : cloudFilter,
      domain: domainFilter === "all" ? undefined : domainFilter,
    });

  const { data: domainData } = useApplicationDomains();

  const applications = useMemo(() => data?.items ?? [], [data]);
  const total        = data?.total  ?? applications.length;

  // ── Derived domain list ──────────────────────────────────────────
  const domains = useMemo(
    () => (domainData ?? []).flatMap((domain) => {
      const value = sanitizeDomainName(domain);
      return value ? [value] : [];
    }),
    [domainData],
  );

  // ── Filtered list ────────────────────────────────────────────────
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const selectedStatus = normalizeValue(statusFilter);
      const summaryFilter: Partial<Record<string, ReturnType<typeof normalizeStatus>>> = {
        "in progress": "In Progress",
        completed: "Completed",
        pending: "Pending",
        failed: "Failed",
      };
      const matchesStatus = statusFilter === "all" || (
        summaryFilter[selectedStatus]
          ? normalizeStatus(getMigrationStatus(app)) === summaryFilter[selectedStatus]
          : normalizeValue(getMigrationStatus(app)) === selectedStatus
      );
      return matchesStatus;
    });
  }, [applications, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const visibleApplications = useMemo(
    () => filteredApplications.slice((page - 1) * pageSize, page * pageSize),
    [filteredApplications, page],
  );

  // ── Summary counts ───────────────────────────────────────────────
  const summary = useMemo(
    () => getApplicationOverviewSummary(applications),
    [applications],
  );

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setDomainFilter("all");
    setCloudFilter("all");
    setPage(1);
  };

  const handleOpenApp = (app: Application) => {
    navigate(`/app/applications/${app.id}`, { state: { application: app } });
  };

  const handleSharePointSync = async () => {
    setMessage("");
    setPageError("");

    try {
      const result = await sharePointSync.mutateAsync();
      setMessage(result.message || result.detail || "SharePoint synchronization completed successfully.");
      setPage(1);
    } catch (syncError) {
      setPageError(getApiErrorMessage(syncError));
    }
  };

  const handleExport = async () => {
    setPageError("");
    setIsExporting(true);
    try {
      const result = await exportApplicationsExcel({
        search,
        cloud: cloudFilter === "all" ? undefined : cloudFilter,
        domain: domainFilter === "all" ? undefined : domainFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      downloadBlob(
        result.blob,
        getResponseFilename(result.contentDisposition, "applications_by_cloud.xlsx"),
      );
    } catch (exportError) {
      setPageError(getApiErrorMessage(exportError));
    } finally {
      setIsExporting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) {
    return <PageLoader label="Loading applications..." />;
  }

  // ── Error ────────────────────────────────────────────────────────
  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load applications"
        text={error instanceof Error ? error.message : "Something went wrong."}
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => { void refetch(); }}
          >
            Try Again
          </button>
        }
      />
    );
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      <div>

        <PageHeader
          title="Applications"
          subtitle="Manage applications, migrations and owners."
          actions={
            <>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={isExporting}
                onClick={() => { void handleExport(); }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Download size={15} />
                {isExporting ? "Exporting..." : "Export Excel"}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={sharePointSync.isPending}
                  onClick={() => { void handleSharePointSync(); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <CloudDownload size={15} />
                  {sharePointSync.isPending ? "Syncing SharePoint..." : "Sync SharePoint"}
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={isFetching}
                onClick={() => { void refetch(); }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <RefreshCw
                  size={15}
                  style={{
                    animation: isFetching
                      ? "ods-spin 0.7s linear infinite"
                      : "none",
                  }}
                />
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>

              {!isDbTeam && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setPageError("");
                    setCreateOpen(true);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Plus size={16} />
                  Create Application
                </button>
              )}
            </>
          }
        />

        {/* ── Alerts ──────────────────────────────────────────── */}
        {message && (
          <div className="ods-form-message success" style={{ margin: "0 0 1rem" }}>
            {message}
          </div>
        )}

        {pageError && (
          <div className="ods-form-message error" style={{ margin: "0 0 1rem" }}>
            {pageError}
          </div>
        )}

        <OverviewStatCards
          total={summary.total}
          azure={summary.azure}
          blue={summary.blue}
          inProgress={summary.inProgress}
          completed={summary.completed}
          pending={summary.pending}
          failed={summary.failed}
        />

        {/* ── Main panel ──────────────────────────────────────── */}
        <div className="ods-card">

          <ApplicationsToolbar
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={handleSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => { setStatusFilter(value); setPage(1); }}
            domainFilter={domainFilter}
            onDomainFilterChange={(value) => { setDomainFilter(value); setPage(1); }}
            domains={domains}
            cloudFilter={cloudFilter}
            onCloudFilterChange={(value) => { setCloudFilter(value); setPage(1); }}
            onClearFilters={handleClearFilters}
          />

          {/* ── Result count ──────────────────────────────────── */}
          <div
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "0.5rem 1.25rem",
              background:     "var(--ods-gray-100)",
              borderBottom:   "1px solid var(--ods-gray-200)",
              fontSize:       "var(--ods-font-size-xs)",
              color:          "var(--ods-gray-600)",
            }}
          >
            <span>
              <strong style={{ color: "var(--ods-gray-900)" }}>
                {filteredApplications.length}
              </strong>{" "}
              applications shown
            </span>
            <span>Total records: <strong>{total}</strong></span>
          </div>

          <div className="ods-card-body" style={{ padding: 0 }}>
            <ApplicationsTable applications={visibleApplications} onOpen={handleOpenApp} />
          </div>

          {/* ── Pagination ────────────────────────────────────── */}
          <div
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "0.75rem 1.25rem",
              borderTop:      "1px solid var(--ods-gray-200)",
            }}
          >
            <span
              style={{
                fontSize: "var(--ods-font-size-sm)",
                color:    "var(--ods-gray-600)",
              }}
            >
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= totalPages || filteredApplications.length === 0}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Create application drawer ────────────────────────── */}
      <ApplicationCreateModal
        isOpen={!isDbTeam && createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(msg) => {
          setMessage(msg);
          setPageError("");
          setPage(1);
        }}
        onError={(msg) => {
          setPageError(msg);
        }}
      />
    </>
  );
}
