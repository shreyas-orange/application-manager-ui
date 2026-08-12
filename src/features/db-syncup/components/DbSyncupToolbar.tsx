import { type FormEvent } from "react";
import { Search, X } from "lucide-react";

interface DbSyncupToolbarProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent<HTMLFormElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  domainFilter: string;
  onDomainFilterChange: (value: string) => void;
  domains: string[];
  cloudFilter: string;
  onCloudFilterChange: (value: string) => void;
  cloudOptions: string[];
  environmentFilter: string;
  onEnvironmentFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function DbSyncupToolbar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  statusFilter,
  onStatusFilterChange,
  domainFilter,
  onDomainFilterChange,
  domains,
  cloudFilter,
  onCloudFilterChange,
  cloudOptions,
  environmentFilter,
  onEnvironmentFilterChange,
  onClearFilters,
}: DbSyncupToolbarProps) {
  return (
    <div className="ods-card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
      <form
        onSubmit={onSearchSubmit}
        style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 260 }}
      >
        <div className="ods-search" style={{ flex: 1 }}>
          <Search className="ods-search-icon" size={15} />
          <input
            type="search"
            className="form-control form-control-sm"
            value={searchInput}
            placeholder="Search application, domain or Carto ID..."
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
      </form>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="In Progress">In progress</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={domainFilter}
          onChange={(e) => onDomainFilterChange(e.target.value)}
        >
          <option value="">All domains</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>{domain}</option>
          ))}
        </select>

        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={cloudFilter}
          onChange={(e) => onCloudFilterChange(e.target.value)}
        >
          <option value="">All clouds</option>
          {cloudOptions.map((cloud) => (
            <option key={cloud} value={cloud}>{cloud}</option>
          ))}
        </select>

        <select className="form-select form-select-sm" style={{ width: "auto" }} value={environmentFilter} onChange={(e) => onEnvironmentFilterChange(e.target.value)}>
          <option value="">All environments</option>
          <option value="DEV">Dev</option><option value="DEMO">Demo</option>
          <option value="QA">QA</option><option value="UAT_AM">UAT / AM</option>
          <option value="PPROD_PERF">PP / Perf</option><option value="MNT_E">MNT / E</option>
          <option value="BENCH">Bench</option><option value="STAGING">Staging</option>
          <option value="INT">Int</option><option value="PROD">Prod</option>
        </select>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onClearFilters}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          <X size={13} />
          Clear
        </button>
      </div>
    </div>
  );
}
