import { type FormEvent } from "react";
import { Search, X } from "lucide-react";

interface ApplicationsToolbarProps {
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
  onClearFilters: () => void;
}

export default function ApplicationsToolbar({
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
  onClearFilters,
}: ApplicationsToolbarProps) {
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
            placeholder="Search application, domain or Carto ID…"
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
          <option value="In progress">In progress</option>
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
          <option value="all">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={cloudFilter}
          onChange={(e) => onCloudFilterChange(e.target.value)}
        >
          <option value="all">All clouds</option>
          <option value="Azure">Azure</option>
          <option value="Bleu">Bleu Cloud</option>
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
