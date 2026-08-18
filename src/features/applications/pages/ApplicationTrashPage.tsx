import { type FormEvent, useState } from "react";
import { RefreshCw, RotateCcw, Search, Trash2 } from "lucide-react";

import { EmptyState, PageHeader, PageLoader, useConfirmDialog } from "@/components/ui";
import { formatDate } from "@/lib/format";

import { useApplicationTrash, useRestoreApplication } from "../hooks/useApplicationTrash";
import type { TrashedApplication } from "../types/application.types";

export default function ApplicationTrashPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const trashQuery = useApplicationTrash(page, search, 10);
  const restoreMutation = useRestoreApplication();
  const { confirm, dialog } = useConfirmDialog();

  const restore = async (application: TrashedApplication) => {
    const confirmed = await confirm({
      title: "Restore application",
      message: `Restore ${application.application_name || `application ${application.id}`} to the application list?`,
      confirmLabel: "Restore",
    });
    if (!confirmed) return;
    await restoreMutation.mutateAsync(application.id);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  if (trashQuery.isLoading) return <PageLoader label="Loading trashed applications..." />;
  if (trashQuery.isError) {
    return <EmptyState icon="⚠️" title="Unable to load trash" text={trashQuery.error instanceof Error ? trashQuery.error.message : "Something went wrong."} />;
  }

  const data = trashQuery.data;
  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <div>
      <PageHeader
        title="Application Trash"
        subtitle="Review and restore deleted applications."
        actions={(
          <button type="button" className="btn btn-outline-secondary" disabled={trashQuery.isFetching} onClick={() => { void trashQuery.refetch(); }}>
            <RefreshCw size={15} /> {trashQuery.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        )}
      />

      {restoreMutation.isError && (
        <div className="ods-form-message error" style={{ marginBottom: "1rem" }}>
          {restoreMutation.error instanceof Error ? restoreMutation.error.message : "Unable to restore application."}
        </div>
      )}

      <div className="ods-card">
        <div className="ods-card-header">
          <form onSubmit={submitSearch} style={{ display: "flex", gap: "0.5rem", width: "100%", maxWidth: 520 }}>
            <div className="ods-search" style={{ flex: 1 }}>
              <Search className="ods-search-icon" size={15} />
              <input className="form-control form-control-sm" value={searchInput} placeholder="Search deleted applications" onChange={(event) => setSearchInput(event.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
        </div>

        <div className="ods-table-wrapper">
          <table className="ods-table">
            <thead><tr><th>Application</th><th>Carto ID</th><th>Domain</th><th>Status</th><th>Deleted At</th><th>Action</th></tr></thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6}><EmptyState compact icon={<Trash2 size={22} />} text="Trash is empty." /></td></tr>
              ) : items.map((application) => (
                <tr key={application.id}>
                  <td><strong>{application.application_name || "NA"}</strong><div style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-xs)" }}>ID: {application.id}</div></td>
                  <td>{application.carto_id || "NA"}</td>
                  <td>{application.confirmed_domain || application.domain || "NA"}</td>
                  <td>{application.application_status || "NA"}</td>
                  <td>{formatDate(application.deleted_at)}</td>
                  <td><button type="button" className="btn btn-outline-secondary btn-sm" disabled={restoreMutation.isPending} onClick={() => { void restore(application); }}><RotateCcw size={14} /> Restore</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderTop: "1px solid var(--ods-gray-200)" }}>
          <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong> · Total <strong>{data?.total ?? 0}</strong></span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        </div>
      </div>
      {dialog}
    </div>
  );
}
