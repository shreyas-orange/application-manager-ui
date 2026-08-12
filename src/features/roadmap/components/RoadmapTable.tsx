import { Fragment, useMemo, useState } from "react";
import { Pencil, ChevronDown, ChevronRight } from "lucide-react";

import type { RoadmapItem, RoadmapStatus } from "../types/roadmap.types";

const STATUS_OPTIONS: { value: RoadmapStatus; label: string }[] = [
  { value: "TO_DO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
  { value: "NOT_REQUIRED", label: "Not Required" },
];

const STATUS_STYLES: Record<string, { color: string; background: string }> = {
  DONE: { color: "#15803d", background: "#f0fdf4" },
  IN_PROGRESS: { color: "#1d4ed8", background: "#eff6ff" },
  TO_DO: { color: "#c2410c", background: "#fff7ed" },
  NOT_REQUIRED: { color: "#6b7280", background: "#f3f4f6" },
};

function formatDate(v: string | null): string {
  if (!v) return "NA";
  return v.slice(0, 10);
}

interface Filters {
  phase: string;
  environment: string;
  status: string;
  search: string;
}

function getUniqueValues(items: RoadmapItem[], key: keyof RoadmapItem): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const val = item[key];
    if (typeof val === "string" && val) set.add(val);
  }
  return Array.from(set).sort();
}

function StatusBadge({ status }: { status: RoadmapStatus }) {
  if (!status) return <span style={{ color: "var(--ods-gray-400)" }}>NA</span>;
  const style = STATUS_STYLES[status];
  const label = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.15rem 0.5rem",
        borderRadius: "9999px",
        fontSize: "var(--ods-font-size-xs, 0.75rem)",
        fontWeight: 500,
        whiteSpace: "nowrap",
        ...(style ?? {}),
      }}
    >
      {label}
    </span>
  );
}

interface RoadmapTableProps {
  items: RoadmapItem[];
  onEdit: (item: RoadmapItem) => void;
}

interface PhaseGroup {
  phase: string;
  items: RoadmapItem[];
}

export default function RoadmapTable({ items, onEdit }: RoadmapTableProps) {
  const [filters, setFilters] = useState<Filters>({
    phase: "",
    environment: "",
    status: "",
    search: "",
  });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expandedActivity, setExpandedActivity] = useState<Set<number>>(new Set());

  const uniquePhases = useMemo(() => getUniqueValues(items, "phase"), [items]);
  const uniqueEnvs = useMemo(() => getUniqueValues(items, "environment"), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.phase && item.phase !== filters.phase) return false;
      if (filters.environment && item.environment !== filters.environment) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = [
          item.activity,
          item.phase,
          item.environment,
          item.section_name,
          item.activity_number,
          item.responsible_teams,
          item.support_teams,
          item.assigned_resources,
          item.remarks,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [items, filters]);

  const groups: PhaseGroup[] = useMemo(() => {
    const map = new Map<string, RoadmapItem[]>();
    for (const item of filteredItems) {
      const key = item.phase || "(No Phase)";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).map(([phase, phaseItems]) => ({
      phase,
      items: phaseItems.sort((a, b) => a.display_order - b.display_order),
    }));
  }, [filteredItems]);

  const togglePhase = (phase: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const toggleActivity = (id: number) => {
    setExpandedActivity((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ phase: "", environment: "", status: "", search: "" });
  };

  const hasActiveFilters = filters.phase || filters.environment || filters.status || filters.search;

  return (
    <div className="ods-card">
      {/* ── Filters toolbar ────────────────────────────────── */}
      <div
        className="ods-list-toolbar"
        style={{ gap: "0.5rem", flexWrap: "nowrap" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Search */}
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            style={{ flex: 1, minWidth: 150 }}
          />

          {/* Phase filter */}
          <select
            className="form-select form-select-sm"
            value={filters.phase}
            onChange={(e) => updateFilter("phase", e.target.value)}
            style={{ flexShrink: 0, width: "auto" }}
          >
            <option value="">All phases</option>
            {uniquePhases.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Environment filter */}
          <select
            className="form-select form-select-sm"
            value={filters.environment}
            onChange={(e) => updateFilter("environment", e.target.value)}
            style={{ flexShrink: 0, width: "auto" }}
          >
            <option value="">All environments</option>
            {uniqueEnvs.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="form-select form-select-sm"
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            style={{ flexShrink: 0, width: "auto" }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value!}>
                {s.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={clearFilters}
              style={{ fontSize: "var(--ods-font-size-xs)", flexShrink: 0, whiteSpace: "nowrap" }}
            >
              Clear filters
            </button>
          )}
        </div>

        <span className="ods-list-count" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
          {filteredItems.length} of {items.length} items
        </span>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div style={{ overflowX: "auto" }}>
        <table className="ods-table" style={{ width: "100%" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--ods-gray-200)" }}>
              <th style={{ width: 32 }} />
              <th style={{ minWidth: 80 }}>#</th>
              <th style={{ minWidth: 180 }}>Activity</th>
              <th style={{ minWidth: 90 }}>Env</th>
              <th style={{ minWidth: 80 }}>Section</th>
              <th style={{ minWidth: 100 }}>Status</th>
              <th style={{ minWidth: 110 }}>Planned Start</th>
              <th style={{ minWidth: 110 }}>Planned End</th>
              <th style={{ minWidth: 140 }}>Responsible</th>
              <th style={{ minWidth: 130 }}>Resources</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <div
                    className="ods-empty-state"
                    style={{ padding: "2rem" }}
                  >
                    <p className="ods-empty-text">No roadmap items match your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const isCollapsed = collapsed.has(group.phase);
                return (
                  <Fragment key={group.phase}>
                    {/* Phase header row */}
                    <tr
                      key={`phase-${group.phase}`}
                      style={{
                        background: "var(--ods-gray-100)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => togglePhase(group.phase)}
                    >
                      <td colSpan={11} style={{ padding: "0.5rem 0.75rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {isCollapsed ? (
                            <ChevronRight size={16} style={{ color: "var(--ods-gray-500)" }} />
                          ) : (
                            <ChevronDown size={16} style={{ color: "var(--ods-gray-500)" }} />
                          )}
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "var(--ods-font-size-sm)",
                              color: "var(--ods-gray-800)",
                            }}
                          >
                            {group.phase}
                          </span>
                          <span
                            style={{
                              fontSize: "var(--ods-font-size-xs)",
                              color: "var(--ods-gray-500)",
                              marginLeft: "0.25rem",
                            }}
                          >
                            {group.items.length} {group.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Item rows */}
                    {!isCollapsed &&
                      group.items.map((item) => {
                        const isExpanded = expandedActivity.has(item.id);
                        const activityText = item.activity || "NA";
                        const needsTruncation = activityText.length > 80;

                        return (
                          <tr
                            key={item.id}
                            style={{
                              background: isExpanded ? "var(--ods-gray-50)" : undefined,
                            }}
                          >
                            <td style={{ padding: "0.625rem 0.5rem" }} />
                            <td
                              style={{
                                color: "var(--ods-gray-500)",
                                textAlign: "center",
                                fontSize: "var(--ods-font-size-xs)",
                              }}
                            >
                              {item.activity_number || item.display_order}
                            </td>
                            <td
                              style={{
                                color: "var(--ods-gray-800)",
                                maxWidth: 350,
                                cursor: needsTruncation ? "pointer" : undefined,
                              }}
                              onClick={
                                needsTruncation
                                  ? () => toggleActivity(item.id)
                                  : undefined
                              }
                              title={!isExpanded ? activityText : undefined}
                            >
                              <span
                                style={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: isExpanded ? "unset" : 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: isExpanded ? "visible" : "hidden",
                                  lineHeight: 1.4,
                                }}
                              >
                                {activityText}
                              </span>
                              {needsTruncation && !isExpanded && (
                                <span
                                  style={{
                                    color: "var(--ods-orange)",
                                    fontSize: "var(--ods-font-size-xs)",
                                    marginLeft: "0.25rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  more
                                </span>
                              )}
                            </td>
                            <td
                              style={{
                                color: "var(--ods-gray-600)",
                                fontSize: "var(--ods-font-size-xs)",
                              }}
                            >
                              {item.environment || "NA"}
                            </td>
                            <td
                              style={{
                                color: "var(--ods-gray-600)",
                                fontSize: "var(--ods-font-size-xs)",
                              }}
                            >
                              {item.section_name || "NA"}
                            </td>
                            <td>
                              <StatusBadge status={item.status} />
                            </td>
                            <td
                              style={{
                                color: "var(--ods-gray-600)",
                                whiteSpace: "nowrap",
                                fontSize: "var(--ods-font-size-sm)",
                              }}
                            >
                              {formatDate(item.planned_start_date)}
                            </td>
                            <td
                              style={{
                                color: "var(--ods-gray-600)",
                                whiteSpace: "nowrap",
                                fontSize: "var(--ods-font-size-sm)",
                              }}
                            >
                              {formatDate(item.planned_end_date)}
                            </td>
                            <td
                              style={{
                                color: "var(--ods-gray-700)",
                                maxWidth: 160,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "var(--ods-font-size-xs)",
                              }}
                              title={item.responsible_teams}
                            >
                              {item.responsible_teams || "NA"}
                            </td>
                            <td
                              style={{
                                color: "var(--ods-gray-700)",
                                maxWidth: 140,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "var(--ods-font-size-xs)",
                              }}
                              title={item.assigned_resources}
                            >
                              {item.assigned_resources || "NA"}
                            </td>
                            <td style={{ padding: "0.625rem 0.5rem" }}>
                              <button
                                type="button"
                                className="ods-icon-btn"
                                title="Edit item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(item);
                                }}
                              >
                                <Pencil size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
