import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus, RefreshCw } from "lucide-react";

import { useAllApplications } from "@/features/applications/hooks/useAllApplications";
import { sanitizeDomainName } from "@/features/applications/utils/domain";
import { getApiErrorMessage } from "@/lib/api-error";
import { downloadBlob, getResponseFilename } from "@/lib/download-file";
import { EmptyState, PageHeader, PageLoader, useConfirmDialog } from "@/components/ui";

import DbSyncupCreateDrawer from "../components/DbSyncupCreateDrawer";
import DbSyncupTable from "../components/DbSyncupTable";
import DbSyncupSummaryCards from "../components/DbSyncupSummaryCards";
import DbSyncupToolbar from "../components/DbSyncupToolbar";
import {
  useAllDbSyncups,
  useCreateDbSyncup,
  useDeleteDbSyncup,
} from "../hooks/useDbSyncup";
import { exportDbSyncupsExcel } from "../api/db-syncup.api";
import type { CreateDbSyncupPayload, DbSyncup } from "../types/db-syncup.types";

const PAGE_SIZE = 10;

export default function DbSyncupPage() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirmDialog();

  const applicationsQuery = useAllApplications();
  const applications = applicationsQuery.data?.items ?? [];
  const createMutation = useCreateDbSyncup();
  const deleteMutation = useDeleteDbSyncup();

  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // ── Search / filters ─────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("");
  const [cloudFilter, setCloudFilter] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("");
  const hasApiFilters = Boolean(
    search || statusFilter !== "all" || domainFilter || cloudFilter || environmentFilter,
  );

  // Keep dashboard cards based on the complete worklist. The table query below
  // can then be filtered without changing the numbers shown on the cards.
  const summaryQuery = useAllDbSyncups({ pageSize: 1 });

  const { data, isLoading, isError, error, isFetching, refetch } = useAllDbSyncups({
    pageSize: 100,
    search,
    domain: domainFilter,
    cloud: cloudFilter,
    environment: environmentFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const filteredTotal = data?.total ?? 0;
  const totalSyncups = summaryQuery.data?.total ?? filteredTotal;

  const domains = useMemo(() => {
    const values = new Set<string>();
    applications.forEach((application) => {
      const domain = sanitizeDomainName(
        application.confirmed_domain || application.domain,
      );
      if (domain) values.add(domain);
    });
    return Array.from(values).sort();
  }, [applications]);

  const cloudOptions = useMemo(() => {
    const values = new Set<string>();
    applications.forEach((application) => {
      application.cloud_mappings.forEach((mapping) => {
        const cloud = mapping.cloud?.name?.trim();
        if (cloud) values.add(cloud);
      });
    });
    return Array.from(values).sort();
  }, [applications]);

  const filteredItems = items;

  // ── Summary counts (from filtered) ───────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const syncedApplicationIds = new Set(
    items.map((i) => i.application_id),
  );
  const availableApplications = applications.filter(
    (app) => !syncedApplicationIds.has(app.id),
  );

  const nextSerialNumber =
    items.length > 0
      ? Math.max(...items.map((item) => item.serial_number ?? item.id)) + 1
      : 1;

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setDomainFilter("");
    setCloudFilter("");
    setEnvironmentFilter("");
    setPage(1);
  };

  const handleCreate = async (payload: CreateDbSyncupPayload) => {
    setPageError("");
    setMessage("");
    await createMutation.mutateAsync(payload);
    setMessage("Database migration created successfully.");
  };

  const handleDelete = async (item: DbSyncup) => {
    const confirmed = await confirm({
      title: "Delete database migration",
      message: `Delete database migration #${item.serial_number ?? item.id}? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    setPageError("");
    setMessage("");

    try {
      await deleteMutation.mutateAsync(item.id);
      setMessage("Database migration deleted successfully.");
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  const handleExport = async () => {
    setPageError("");
    setIsExporting(true);
    try {
      const result = await exportDbSyncupsExcel();
      downloadBlob(
        result.blob,
        getResponseFilename(result.contentDisposition, "db_syncups_by_cloud.xlsx"),
      );
    } catch (exportError) {
      setPageError(getApiErrorMessage(exportError));
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading database migrations..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load database migrations"
        text={error instanceof Error ? error.message : "Something went wrong while loading database migrations."}
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => {
              void refetch();
            }}
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Database Migrations"
        subtitle="View, create and manage database migration records across applications."
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

            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={isFetching}
              onClick={() => {
                void refetch();
              }}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <RefreshCw
                size={15}
                style={{
                  animation: isFetching ? "ods-spin 0.7s linear infinite" : "none",
                }}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setPageError("");
                setCreating(true);
              }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Plus size={16} />
              Add Database Migration
            </button>
          </>
        }
      />

      {/* ── Alerts ───────────────────────────────────────────── */}
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

      <DbSyncupSummaryCards
        total={totalSyncups}
        inProgress={summaryQuery.data?.inProgressCount ?? 0}
        completed={summaryQuery.data?.completedCount ?? 0}
        pending={summaryQuery.data?.pendingCount ?? 0}
        failed={summaryQuery.data?.failedCount ?? 0}
      />

      {totalSyncups === 0 && !hasApiFilters ? (
        <div className="ods-card" style={{ padding: "3rem" }}>
          <EmptyState icon="🗄️" title="No database migration data" text="No database migration records found yet." />
        </div>
      ) : (
        <div className="ods-card">
          <DbSyncupToolbar
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
            cloudOptions={cloudOptions}
            environmentFilter={environmentFilter}
            onEnvironmentFilterChange={(value) => { setEnvironmentFilter(value); setPage(1); }}
            onClearFilters={handleClearFilters}
          />

          {/* ── Result count ────────────────────────────────────── */}
          <div className="ods-list-toolbar">
            <span className="ods-list-count">
              <strong style={{ color: "var(--ods-gray-900)" }}>{filteredItems.length}</strong>{" "}
              of <strong style={{ color: "var(--ods-gray-900)" }}>{filteredTotal}</strong> matching database migration record{filteredTotal === 1 ? "" : "s"}
            </span>
          </div>

          <div className="ods-card-body" style={{ padding: 0 }}>
            <DbSyncupTable
              items={pagedItems}
              deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
              onRowClick={(item) => navigate(`/app/db-syncups/${item.id}?applicationId=${item.application_id}`)}
              onDelete={handleDelete}
            />
          </div>

          {/* ── Pagination ──────────────────────────────────── */}
          <div className="ods-pagination">
            <span className="ods-pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <div className="ods-pagination-actions">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                }}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setPage((current) => Math.min(totalPages, current + 1));
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create drawer ────────────────────────────────────── */}
      <DbSyncupCreateDrawer
        application={null}
        isOpen={creating}
        nextSerialNumber={nextSerialNumber}
        applications={availableApplications}
        onClose={() => setCreating(false)}
        onSave={handleCreate}
      />

      {dialog}
    </div>
  );
}
