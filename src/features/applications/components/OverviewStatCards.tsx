const BLUE_COLOR = "#0052CC";

interface OverviewStatCardsProps {
  total: number;
  azure: number;
  blue: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
}

export default function OverviewStatCards({
  total,
  azure,
  blue,
  completed,
  inProgress,
  pending,
  failed,
}: OverviewStatCardsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
      <div className="ods-stat-card">
        <div className="ods-stat-value">{total}</div>
        <div className="ods-stat-label">Total Applications</div>
      </div>
      <div className="ods-stat-card info">
        <div className="ods-stat-value">{azure}</div>
        <div className="ods-stat-label">Azure</div>
      </div>
      <div className="ods-stat-card" style={{ borderTopColor: BLUE_COLOR }}>
        <div className="ods-stat-value" style={{ color: BLUE_COLOR }}>{blue}</div>
        <div className="ods-stat-label">Blue</div>
      </div>
      <div className="ods-stat-card success">
        <div className="ods-stat-value">{completed}</div>
        <div className="ods-stat-label">Completed</div>
      </div>
      <div className="ods-stat-card warning">
        <div className="ods-stat-value">{inProgress}</div>
        <div className="ods-stat-label">In Progress</div>
      </div>
      <div className="ods-stat-card">
        <div className="ods-stat-value">{pending}</div>
        <div className="ods-stat-label">Pending</div>
      </div>
      <div className="ods-stat-card danger">
        <div className="ods-stat-value">{failed}</div>
        <div className="ods-stat-label">Failed</div>
      </div>
    </div>
  );
}
