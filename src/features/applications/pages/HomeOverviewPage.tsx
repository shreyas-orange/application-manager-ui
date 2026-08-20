// src/features/applications/pages/HomeOverviewPage.tsx
import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import { Download } from "lucide-react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { formatDate, formatMonthYear, getMonthKey, normalizeValue } from "@/lib/format";

import { usePublicApplications } from "../hooks/useAllApplications";
import {
  getCloudNames,
  getCloudPrimary,
  getMigrationStatus,
  normalizeStatus,
} from "../utils/status";
import { getApplicationOverviewSummary } from "../utils/application-overview";
import OverviewStatCards from "../components/OverviewStatCards";
import OverviewCharts from "../components/OverviewCharts";
import OverviewApplicationsPanel from "../components/OverviewApplicationsPanel";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeOverviewPage() {
  const { data, isLoading, isError, error, isFetching } = usePublicApplications();
  const applications = useMemo(() => data?.items ?? [], [data]);

  // ── Filters ────────────────────────────────────────────────────
  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cloudFilter, setCloudFilter]   = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [page, setPage]                 = useState(1);

  // ── Derived domain list ────────────────────────────────────────
  const domains = useMemo(() => {
    const values = new Set<string>();
    applications.forEach((app) => {
      const d = app.confirmed_domain || app.domain;
      if (d) values.add(d);
    });
    return Array.from(values).sort();
  }, [applications]);

  // ── Filtered list ──────────────────────────────────────────────
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const selectedStatus = normalizeValue(statusFilter);
      const statuses = [
        app.application_status,
        app.migration?.migration_status,
      ].map(normalizeValue);
      const domain = normalizeValue(app.confirmed_domain || app.domain);
      const cloudNames = app.cloud_mappings
        ?.map((m) => m.cloud?.name)
        .filter((n): n is string => Boolean(n))
        .map((n) => normalizeValue(n)) ?? [];

      const matchesSearch =
        !search ||
        normalizeValue(app.application_name).includes(normalizeValue(search)) ||
        normalizeValue(app.carto_id).includes(normalizeValue(search)) ||
        normalizeValue(app.domain).includes(normalizeValue(search));
      const matchesStatus = statusFilter === "all" || statuses.includes(selectedStatus);
      const matchesDomain = domainFilter === "all" || domain === normalizeValue(domainFilter);
      const matchesCloud  = cloudFilter === "all" || cloudNames.includes(normalizeValue(cloudFilter));
      return matchesSearch && matchesStatus && matchesDomain && matchesCloud;
    });
  }, [applications, search, statusFilter, domainFilter, cloudFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const pagedApplications = filteredApplications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Summary counts (from filtered) ─────────────────────────────
  const summary = useMemo(
    () => getApplicationOverviewSummary(filteredApplications),
    [filteredApplications],
  );

  // ── Cloud counts ───────────────────────────────────────────────
  // ── Monthly migration bar chart ────────────────────────────────
  const monthlyData = useMemo(() => {
    const buckets: Record<string, { azure: number; blue: number }> = {};
    filteredApplications.forEach((app) => {
      const c = getCloudPrimary(app);
      if (c === "Other") return;
      const key =
        getMonthKey(app.migration?.tentative_start) ??
        getMonthKey(app.migration?.confirmed_end) ??
        getMonthKey(app.created_at);
      if (!key) return;
      if (!buckets[key]) buckets[key] = { azure: 0, blue: 0 };
      if (c === "Azure") buckets[key].azure += 1;
      else buckets[key].blue += 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        month,
        monthLabel: formatMonthYear(month),
        Azure: counts.azure,
        Blue:  counts.blue,
      }));
  }, [filteredApplications]);

  // ── Status pie chart data ──────────────────────────────────────
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApplications.forEach((app) => {
      const s = normalizeStatus(getMigrationStatus(app));
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredApplications]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setCloudFilter("all");
    setDomainFilter("all");
    setPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      "Application",
      "Carto ID",
      "Domain",
      "Cloud",
      "Migration Status",
      "Progress",
      "DevOps Owner",
      "Created",
    ];

    const rows = filteredApplications.map((app) => {
      const owners = app.owners ?? [];
      const getOwner = (type: string) =>
        owners.find((o) => o.owner_type?.toLowerCase() === type.toLowerCase());
      return [
        app.application_name,
        app.carto_id || "",
        app.confirmed_domain || app.domain || "",
        getCloudNames(app),
        getMigrationStatus(app),
        String(app.migration?.migration_progress ?? 0),
        getOwner("DevOps")?.owner_name || "",
        formatDate(app.created_at),
      ];
    });

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading / Error ────────────────────────────────────────────
  if (isLoading) {
    return <PageLoader label="Loading overview..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load overview"
        text={error instanceof Error ? error.message : "Something went wrong."}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={`Application migration overview — ${filteredApplications.length} of ${applications.length} applications`}
        actions={
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleExportCsv}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Download size={15} />
            Export CSV
          </button>
        }
      />

      <OverviewStatCards
        total={summary.total}
        azure={summary.azure}
        blue={summary.blue}
        completed={summary.completed}
        inProgress={summary.inProgress}
        pending={summary.pending}
        failed={summary.failed}
      />

      <OverviewCharts monthlyData={monthlyData} statusPieData={statusPieData} />

      <OverviewApplicationsPanel
        applications={pagedApplications}
        totalCount={filteredApplications.length}
        isFetching={isFetching}
        search={search}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => { setStatusFilter(value); setPage(1); }}
        cloudFilter={cloudFilter}
        onCloudFilterChange={(value) => { setCloudFilter(value); setPage(1); }}
        domainFilter={domainFilter}
        onDomainFilterChange={(value) => { setDomainFilter(value); setPage(1); }}
        domains={domains}
        onClearFilters={handleClearFilters}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
