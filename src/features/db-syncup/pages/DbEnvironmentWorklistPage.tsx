import { type FormEvent, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { formatDate } from "@/lib/format";

import { getPriorityBadgeClass, getStatusBadgeClass } from "../constants";
import { useEnvironmentWorklist } from "../hooks/useEnvironmentWorklist";

const PAGE_SIZE = 10;

export default function DbEnvironmentWorklistPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [userInput, setUserInput] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState("");

  const query = useEnvironmentWorklist({
    page,
    pageSize: PAGE_SIZE,
    search: userFilter || search,
    deploymentTarget: target,
    status,
  });
  const data = query.data;
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const chartData = [
    { name: "Requested", value: data?.pie_chart.requested ?? 0, fill: "#FF7900" },
    { name: "Pending", value: data?.pie_chart.pending ?? 0, fill: "#FFC107" },
    { name: "Completed", value: data?.pie_chart.completed ?? 0, fill: "#198754" },
  ];

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setUserFilter(userInput.trim());
  };

  const clearFilters = () => {
    setSearchInput(""); setSearch(""); setUserInput(""); setUserFilter(""); setTarget(""); setStatus(""); setPage(1);
  };

  if (query.isLoading) return <PageLoader label="Loading environment requests..." />;
  if (query.isError) return <EmptyState title="Unable to load environment requests" text={query.error instanceof Error ? query.error.message : "Something went wrong."} />;

  return (
    <div>
      <PageHeader
        title="Environment Requests"
        subtitle="Review requested database environments across applications."
        actions={(
          <button type="button" className="btn btn-outline-secondary" disabled={query.isFetching} onClick={() => { void query.refetch(); }}>
            <RefreshCw size={15} /> {query.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        )}
      />

      <div className="ods-card" style={{ marginBottom: "1rem", padding: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", alignItems: "center" }}>
          <div><strong style={{ fontSize: "1.5rem" }}>{data?.pie_chart.total ?? 0}</strong><div>Total</div></div>
          <div><strong style={{ fontSize: "1.5rem", color: "#FF7900" }}>{data?.pie_chart.requested ?? 0}</strong><div>Requested</div></div>
          <div><strong style={{ fontSize: "1.5rem", color: "#FFC107" }}>{data?.pie_chart.pending ?? 0}</strong><div>Pending</div></div>
          <div><strong style={{ fontSize: "1.5rem", color: "#198754" }}>{data?.pie_chart.completed ?? 0}</strong><div>Completed</div></div>
          <div style={{ minWidth: 300, gridColumn: "span 2", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <div style={{ width: 145, height: 130, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={48}>
                    {chartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
              {chartData.map((entry) => (
                <span key={entry.name} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap", fontSize: "var(--ods-font-size-xs)" }}>
                  <span style={{ width: 11, height: 11, background: entry.fill, display: "inline-block" }} />
                  {entry.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ods-card">
        <div className="ods-card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <form onSubmit={submitSearch} style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 260 }}>
            <div className="ods-search" style={{ flex: 1 }}><Search className="ods-search-icon" size={15} /><input className="form-control form-control-sm" value={searchInput} placeholder="Search application or Carto ID..." onChange={(event) => setSearchInput(event.target.value)} /></div>
            <input
              className="form-control form-control-sm"
              style={{ width: 180 }}
              value={userInput}
              placeholder="Filter by user..."
              aria-label="Filter by requester or assignee"
              onChange={(event) => setUserInput(event.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit">Search</button>
          </form>
          <select className="form-select form-select-sm" style={{ width: "auto" }} value={target} onChange={(event) => { setTarget(event.target.value); setPage(1); }}><option value="">All clouds</option><option value="AZURE">Azure</option><option value="BLEU">Bleu</option></select>
          <select className="form-select form-select-sm" style={{ width: "auto" }} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option value="REQUESTED">Requested</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option></select>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearFilters}><X size={13} /> Clear</button>
        </div>

        <div className="ods-table-wrapper"><table className="ods-table"><thead><tr><th>Application</th><th>Carto ID</th><th>Domain</th><th>Cloud</th><th>Environment</th><th>Status</th><th>Priority</th><th>Requested</th><th>Requested by</th><th>Migration Manager</th><th>Remarks</th></tr></thead><tbody>
          {(data?.items ?? []).length === 0 ? <tr><td colSpan={11}><EmptyState compact text="No environment requests found." /></td></tr> : data?.items.map((item) => (
            <tr
              key={item.environment_id}
              style={{ cursor: "pointer" }}
              title={`Open DB sync details for ${item.application_name || "application"}`}
              onClick={() => navigate(`/app/db-syncups/${item.db_syncup_id}?applicationId=${item.application_id}`)}
            ><td>{item.application_name || "NA"}</td><td>{item.carto_id || "NA"}</td><td>{item.domain || "NA"}</td><td>{item.deployment_target}</td><td>{item.environment}</td><td><span className={getStatusBadgeClass(item.request_status)}>{item.request_status}</span></td><td><span className={getPriorityBadgeClass(item.priority)}>{item.priority}</span></td><td>{formatDate(item.date_of_request || item.requested_at)}</td><td>{item.requested_by_name || "NA"}</td><td>{item.assigned_to_name || "NA"}</td><td>{item.remarks || "NA"}</td></tr>
          ))}
        </tbody></table></div>

        <div className="ods-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>Page <strong>{page}</strong> of <strong>{totalPages}</strong> · {data?.total ?? 0} records</span><div style={{ display: "flex", gap: "0.5rem" }}><button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>
      </div>
    </div>
  );
}
