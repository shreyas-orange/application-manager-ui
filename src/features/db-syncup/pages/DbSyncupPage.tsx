import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";

import { useAllApplications } from "@/features/applications/hooks/useAllApplications";
import { getApiErrorMessage } from "@/lib/api-error";
import { normalizeValue } from "@/lib/format";
import { EmptyState, PageHeader, PageLoader, useConfirmDialog } from "@/components/ui";

import DbSyncupCreateDrawer from "../components/DbSyncupCreateDrawer";
import DbSyncupTable from "../components/DbSyncupTable";
import DbSyncupSummaryCards from "../components/DbSyncupSummaryCards";
import DbSyncupToolbar from "../components/DbSyncupToolbar";
import { normalizeDbSyncupStatus } from "../constants";
import {
  useAllDbSyncups,
  useCreateDbSyncup,
  useDeleteDbSyncup,
} from "../hooks/useDbSyncup";
import type { CreateDbSyncupPayload, DbSyncup } from "../types/db-syncup.types";

const PAGE_SIZE = 10;

export default function DbSyncupPage() {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirmDialog();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useAllDbSyncups();

  const applicationsQuery = useAllApplications();
  const applications = applicationsQuery.data?.items ?? [];
  const createMutation = useCreateDbSyncup();
  const deleteMutation = useDeleteDbSyncup();

  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");

  // ── Search / filters ─────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [hostingFilter, setHostingFilter] = useState("all");

  const items = useMemo(() => data ?? [], [data]);

  const domains = useMemo(() => {
    const values = new Set<string>();
    items.forEach((item) => {
      if (item.domain) values.add(item.domain);
    });
    return Array.from(values).sort();
  }, [items]);

  const hostingOptions = useMemo(() => {
    const values = new Set<string>();
    items.forEach((item) => {
      if (item.hosting) values.add(item.hosting);
    });
    return Array.from(values).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        normalizeValue(item.application_name).includes(normalizeValue(search)) ||
        normalizeValue(item.carto_id).includes(normalizeValue(search)) ||
        normalizeValue(item.domain).includes(normalizeValue(search));
      const matchesStatus =
        statusFilter === "all" || normalizeDbSyncupStatus(item.prod_status) === statusFilter;
      const matchesDomain =
        domainFilter === "all" || normalizeValue(item.domain) === normalizeValue(domainFilter);
      const matchesHosting =
        hostingFilter === "all" || normalizeValue(item.hosting) === normalizeValue(hostingFilter);
      return matchesSearch && matchesStatus && matchesDomain && matchesHosting;
    });
  }, [items, search, statusFilter, domainFilter, hostingFilter]);

  // ── Summary counts (from filtered) ───────────────────────────────
  const summary = useMemo(() => {
    let inProgress = 0, completed = 0, failed = 0, pending = 0;
    filteredItems.forEach((item) => {
      const s = normalizeDbSyncupStatus(item.prod_status);
      if (s === "Completed") completed += 1;
      else if (s === "In Progress") inProgress += 1;
      else if (s === "Failed") failed += 1;
      else pending += 1;
    });
    return { total: filteredItems.length, inProgress, completed, failed, pending };
  }, [filteredItems]);

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
      ? Math.max(...items.map((i) => i.serial_number)) + 1
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
    setDomainFilter("all");
    setHostingFilter("all");
    setPage(1);
  };

  const handleCreate = async (payload: CreateDbSyncupPayload) => {
    setPageError("");
    setMessage("");
    await createMutation.mutateAsync(payload);
    setMessage("DB syncup created successfully.");
  };

  const handleDelete = async (item: DbSyncup) => {
    const confirmed = await confirm({
      title: "Delete DB syncup record",
      message: `Delete DB syncup record #${item.serial_number}? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    setPageError("");
    setMessage("");

    try {
      await deleteMutation.mutateAsync(item.id);
      setMessage("DB syncup deleted successfully.");
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading DB syncup..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load DB syncup"
        text={error instanceof Error ? error.message : "Something went wrong while loading DB syncup."}
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
        title="DB Syncup"
        subtitle="View, create and manage database syncup records across applications."
        actions={
          <>
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
              Add Syncup
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
        total={summary.total}
        inProgress={summary.inProgress}
        completed={summary.completed}
        pending={summary.pending}
        failed={summary.failed}
      />

      {items.length === 0 ? (
        <div className="ods-card" style={{ padding: "3rem" }}>
          <EmptyState icon="🗄️" title="No DB syncup data" text="No DB syncup records found yet." />
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
            hostingFilter={hostingFilter}
            onHostingFilterChange={(value) => { setHostingFilter(value); setPage(1); }}
            hostingOptions={hostingOptions}
            onClearFilters={handleClearFilters}
          />

          {/* ── Result count ────────────────────────────────────── */}
          <div className="ods-list-toolbar">
            <span className="ods-list-count">
              <strong style={{ color: "var(--ods-gray-900)" }}>{filteredItems.length}</strong>{" "}
              of <strong style={{ color: "var(--ods-gray-900)" }}>{items.length}</strong> syncup record{items.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="ods-card-body" style={{ padding: 0 }}>
            <DbSyncupTable
              items={pagedItems}
              deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
              onRowClick={(item) => navigate(`/app/db-syncups/${item.id}`)}
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
