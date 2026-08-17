import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search } from "lucide-react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { normalizeValue } from "@/lib/format";

import ApplicationsTable from "../components/ApplicationsTable";
import { useMyApplications } from "../hooks/useMyApplications";
import type { Application } from "../types/application.types";

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError, error, isFetching, refetch } = useMyApplications(page, pageSize);
  const [search, setSearch] = useState("");

  const applications = useMemo(() => {
    const searchValue = normalizeValue(search);

    return (data?.items ?? []).filter((application) => {
      const matchesSearch = !searchValue || [
        application.application_name,
        application.carto_id,
        application.domain,
        application.confirmed_domain,
      ].some((value) => normalizeValue(value).includes(searchValue));

      return matchesSearch;
    });
  }, [data?.items, search]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openApplication = (application: Application) => {
    navigate(`/app/applications/${application.id}`, { state: { application } });
  };

  if (isLoading) return <PageLoader label="Loading your applications..." />;

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load your applications"
        text={error instanceof Error ? error.message : "Something went wrong."}
        action={(
          <button type="button" className="btn btn-primary mt-3" onClick={() => { void refetch(); }}>
            Try Again
          </button>
        )}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Applications assigned to your account."
        actions={(
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isFetching}
            onClick={() => { void refetch(); }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <RefreshCw size={15} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        )}
      />

      <div className="ods-card">
        <div className="ods-card-body" style={{ borderBottom: "1px solid var(--ods-gray-200)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", maxWidth: 420 }}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              className="form-control"
              value={search}
              placeholder="Search my applications"
              aria-label="Search my applications"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        <div style={{ padding: "0.5rem 1.25rem", color: "var(--ods-gray-600)" }}>
          <strong>{applications.length}</strong> applications assigned to you
        </div>

        <div className="ods-card-body" style={{ padding: 0 }}>
          <ApplicationsTable applications={applications} onOpen={openApplication} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid var(--ods-gray-200)",
          }}
        >
          <span style={{ color: "var(--ods-gray-600)" }}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong> · Total <strong>{total}</strong>
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
