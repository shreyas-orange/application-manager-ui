import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import ApplicationDetailsDrawer from "../components/ApplicationDetailsDrawer";
import ApplicationSummaryCard from "../components/ApplicationSummaryCard";
import { useApplications } from "../hooks/useApplications";
import type {
  Application,
  ApplicationOwner,
} from "../types/application.types";

import "../styles/applications.css";

function normalizeValue(
  value: string | null | undefined,
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOwnerByType(
  owners: ApplicationOwner[] | undefined,
  ownerType: string,
): ApplicationOwner | undefined {
  return owners?.find(
    (owner) =>
      normalizeValue(owner.owner_type) ===
      normalizeValue(ownerType),
  );
}

function getOwnerName(
  application: Application,
  ownerType: string,
): string {
  return (
    getOwnerByType(
      application.owners,
      ownerType,
    )?.owner_name || "—"
  );
}

function getCloudNames(
  application: Application,
): string {
  const cloudNames =
    application.cloud_mappings
      ?.map((mapping) => mapping.cloud?.name)
      .filter(
        (name): name is string =>
          Boolean(name),
      ) ?? [];

  return cloudNames.length > 0
    ? cloudNames.join(", ")
    : "—";
}

function getMigrationStatus(
  application: Application,
): string {
  return (
    application.migration?.migration_status ||
    application.application_status ||
    "Pending"
  );
}

function getStatusClass(
  status: string | null | undefined,
): string {
  const normalized = normalizeValue(status);

  if (
    [
      "completed",
      "complete",
      "done",
      "production",
    ].includes(normalized)
  ) {
    return "application-status application-status--success";
  }

  if (
    [
      "failed",
      "failure",
      "cancelled",
    ].includes(normalized)
  ) {
    return "application-status application-status--failed";
  }

  if (
    [
      "in progress",
      "in_progress",
      "ongoing",
      "started",
    ].includes(normalized)
  ) {
    return "application-status application-status--progress";
  }

  return "application-status application-status--pending";
}

function getLatestRemark(
  application: Application,
): string {
  const remarks =
    application.remarks ?? [];

  if (remarks.length === 0) {
    return "—";
  }

  const latestRemark =
    remarks[remarks.length - 1];

  return (
    latestRemark.remark ||
    latestRemark.remarks_imp ||
    latestRemark.source_comments ||
    "—"
  );
}

export default function ApplicationsPage() {
  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [domainFilter, setDomainFilter] =
    useState("all");

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState<Application | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const pageSize = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useApplications({
    page,
    pageSize,
    search,
  });

  const applications =
    data?.items ?? [];

  const total =
    data?.total ?? applications.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );

  const domains = useMemo(() => {
    const values = new Set<string>();

    applications.forEach((application) => {
      const domain =
        application.confirmed_domain ||
        application.domain;

      if (domain) {
        values.add(domain);
      }
    });

    return Array.from(values).sort();
  }, [applications]);

  const filteredApplications =
    useMemo(() => {
      return applications.filter(
        (application) => {
          const status =
            normalizeValue(
              getMigrationStatus(application),
            );

          const domain =
            normalizeValue(
              application.confirmed_domain ||
                application.domain,
            );

          const matchesStatus =
            statusFilter === "all" ||
            status ===
              normalizeValue(statusFilter);

          const matchesDomain =
            domainFilter === "all" ||
            domain ===
              normalizeValue(domainFilter);

          return (
            matchesStatus &&
            matchesDomain
          );
        },
      );
    }, [
      applications,
      statusFilter,
      domainFilter,
    ]);

  const summary = useMemo(() => {
    let inProgress = 0;
    let completed = 0;
    let failed = 0;
    let pending = 0;

    applications.forEach((application) => {
      const status =
        normalizeValue(
          application.migration
            ?.migration_status,
        );

      if (
        [
          "completed",
          "complete",
          "done",
        ].includes(status)
      ) {
        completed += 1;
      } else if (
        [
          "in progress",
          "in_progress",
          "ongoing",
        ].includes(status)
      ) {
        inProgress += 1;
      } else if (
        [
          "failed",
          "failure",
          "cancelled",
        ].includes(status)
      ) {
        failed += 1;
      } else {
        pending += 1;
      }
    });

    return {
      total,
      inProgress,
      completed,
      failed,
      pending,
    };
  }, [applications, total]);

  const handleSearch = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setDomainFilter("all");
    setPage(1);
  };

  const handleOpenApplication = (
    application: Application,
  ) => {
    setSelectedApplication(application);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedApplication(null);
    setIsDrawerOpen(false);
  };

  const handleApplicationUpdated = (
    updatedApplication: Application,
  ) => {
    setSelectedApplication(
      updatedApplication,
    );

    void refetch();
  };

  if (isLoading) {
    return (
      <div className="application-state">
        Loading applications...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="application-state application-state--error">
        <h2>
          Unable to load applications
        </h2>

        <p>
          {error instanceof Error
            ? error.message
            : "Something went wrong."}
        </p>

        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <section className="applications-page">
        <div className="applications-header">
          

          <button
            type="button"
            className="application-refresh"
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
          >
            {isFetching
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        <div className="application-summary-grid">
          <ApplicationSummaryCard
            title="Total Applications"
            value={summary.total}
            description="All registered applications"
          />

          <ApplicationSummaryCard
            title="In Progress"
            value={summary.inProgress}
            description="Active migrations"
          />

          <ApplicationSummaryCard
            title="Completed"
            value={summary.completed}
            description="Completed migrations"
          />

          <ApplicationSummaryCard
            title="Pending"
            value={summary.pending}
            description="Pending migrations"
          />

          <ApplicationSummaryCard
            title="Failed"
            value={summary.failed}
            description="Failed migrations"
          />
        </div>

        <div className="applications-panel">
          <div className="applications-toolbar">
            <form
              className="application-search"
              onSubmit={handleSearch}
            >
              <input
                type="search"
                value={searchInput}
                placeholder="Search application, domain or Carto ID"
                onChange={(event) => {
                  setSearchInput(
                    event.target.value,
                  );
                }}
              />

              <button type="submit">
                Search
              </button>
            </form>

            <div className="application-filter-group">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value,
                  );
                  setPage(1);
                }}
              >
                <option value="all">
                  All statuses
                </option>

                <option value="In progress">
                  In progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Failed">
                  Failed
                </option>
              </select>

              <select
                value={domainFilter}
                onChange={(event) => {
                  setDomainFilter(
                    event.target.value,
                  );
                  setPage(1);
                }}
              >
                <option value="all">
                  All domains
                </option>

                {domains.map((domain) => (
                  <option
                    key={domain}
                    value={domain}
                  >
                    {domain}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="application-clear"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            </div>
          </div>

          <div className="applications-result-header">
            <span>
              {filteredApplications.length}{" "}
              applications shown
            </span>

            <span>
              Total records: {total}
            </span>
          </div>

          <div className="applications-table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Domain</th>
                  <th>QA Owner</th>
                  <th>DevOps Owner</th>
                  <th>PM Owner</th>
                  <th>Application Manager</th>
                  <th>Cloud</th>
                  <th>Migration</th>
                  <th>Progress</th>
                  <th>Assessment</th>
                  <th>Security</th>
                  <th>Latest Remark</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={14}
                      className="applications-empty"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map(
                    (application) => {
                      const migrationStatus =
                        getMigrationStatus(
                          application,
                        );

                      const progress =
                        application.migration
                          ?.migration_progress ??
                        0;

                      return (
                        <tr key={application.id}>
                          <td>
                            <div className="application-name-cell">
                              <strong>
                                {
                                  application.application_name
                                }
                              </strong>

                              <span>
                                Carto ID:{" "}
                                {application.carto_id ||
                                  "—"}
                              </span>

                              <small>
                                Basicat:{" "}
                                {application.basicat ||
                                  "—"}
                              </small>
                            </div>
                          </td>

                          <td>
                            {application.confirmed_domain ||
                              application.domain ||
                              "—"}
                          </td>

                          <td>
                            {getOwnerName(
                              application,
                              "QA",
                            )}
                          </td>

                          <td>
                            {getOwnerName(
                              application,
                              "DevOps",
                            )}
                          </td>

                          <td>
                            {getOwnerName(
                              application,
                              "PM",
                            )}
                          </td>

                          <td>
                            {getOwnerName(
                              application,
                              "Application Manager",
                            )}
                          </td>

                          <td>
                            <span className="cloud-badge">
                              {getCloudNames(
                                application,
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={getStatusClass(
                                migrationStatus,
                              )}
                            >
                              {migrationStatus}
                            </span>
                          </td>

                          <td>
                            <div className="migration-progress-cell">
                              <span>
                                {progress}%
                              </span>

                              <div className="migration-progress-track">
                                <div
                                  className="migration-progress-fill"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        progress,
                                      ),
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td>
                            {application.meta_data
                              ?.assessment_status ||
                              "—"}
                          </td>

                          <td>
                            <div className="security-summary">
                              <span>
                                Nexus:{" "}
                                {application.security
                                  ?.nexus_status ||
                                  "—"}
                              </span>

                              <span>
                                Rooted:{" "}
                                {application.security
                                  ?.rooted_status ||
                                  "—"}
                              </span>

                              <span>
                                Network:{" "}
                                {application.security
                                  ?.network_policy_status ||
                                  "—"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div
                              className="application-remark-cell"
                              title={getLatestRemark(
                                application,
                              )}
                            >
                              {getLatestRemark(
                                application,
                              )}
                            </div>
                          </td>

                          <td>
                            {formatDate(
                              application.created_at,
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="application-view-button"
                              onClick={() =>
                                handleOpenApplication(
                                  application,
                                )
                              }
                            >
                              View / Edit
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="applications-pagination">
            <span>
              Page {page} of {totalPages}
            </span>

            <div className="applications-pagination-actions">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                  );
                }}
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  applications.length === 0
                }
                onClick={() => {
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1,
                    ),
                  );
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <ApplicationDetailsDrawer
        application={selectedApplication}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdated={
          handleApplicationUpdated
        }
      />
    </>
  );
}