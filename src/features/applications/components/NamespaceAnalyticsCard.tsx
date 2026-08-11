import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const NS_COLORS: Record<string, string> = {
  Migrated:       "#198754",
  "In Progress":  "#FFC107",
  Decommissioned: "#6C757D",
};

interface NamespaceAnalytics {
  total_namespaces: number;
  migrated: number;
  in_progress: number;
  decommissioned: number;
}

interface NamespaceAnalyticsCardProps {
  analytics: NamespaceAnalytics;
  activeCloud: string;
  cloudColor: string;
}

export default function NamespaceAnalyticsCard({ analytics, activeCloud, cloudColor }: NamespaceAnalyticsCardProps) {
  const chartData = [{
    name: "Namespaces",
    Migrated: analytics.migrated,
    "In Progress": analytics.in_progress,
    Decommissioned: analytics.decommissioned,
  }];

  const hasData =
    analytics.total_namespaces !== 0 ||
    analytics.migrated !== 0 ||
    analytics.in_progress !== 0 ||
    analytics.decommissioned !== 0;

  return (
    <div className="ods-card" style={{ marginTop: "1.5rem" }}>
      <div className="ods-card-header">
        <h2 className="ods-card-title">{activeCloud} — Namespace Migration</h2>
      </div>
      <div className="ods-card-body">
        {!hasData ? (
          <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
            No namespace migration data available for {activeCloud}.
          </p>
        ) : (
          <>
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap:                 "1rem",
                marginBottom:        "1.5rem",
              }}
            >
              <div className="ods-stat-card" style={{ borderTopColor: cloudColor }}>
                <div className="ods-stat-value" style={{ color: cloudColor }}>{analytics.total_namespaces}</div>
                <div className="ods-stat-label">Total Namespaces</div>
              </div>
              <div className="ods-stat-card success">
                <div className="ods-stat-value">{analytics.migrated}</div>
                <div className="ods-stat-label">Migrated</div>
              </div>
              <div className="ods-stat-card warning">
                <div className="ods-stat-value">{analytics.in_progress}</div>
                <div className="ods-stat-label">In Progress</div>
              </div>
              <div className="ods-stat-card">
                <div className="ods-stat-value" style={{ color: NS_COLORS.Decommissioned }}>
                  {analytics.decommissioned}
                </div>
                <div className="ods-stat-label">Decommissioned</div>
              </div>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ods-gray-200)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--ods-gray-600)" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--ods-gray-600)" }} />
                  <Tooltip
                    contentStyle={{
                      background:   "var(--ods-white)",
                      border:       "1px solid var(--ods-gray-200)",
                      borderRadius: 0,
                      fontSize:     "var(--ods-font-size-sm)",
                    }}
                  />
                  <Legend />
                  {Object.entries(NS_COLORS).map(([name, color]) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      stackId="ns"
                      fill={color}
                      radius={
                        name === "Migrated" ? [4, 0, 0, 4]
                          : name === "Decommissioned" ? [0, 4, 4, 0]
                          : [0, 0, 0, 0]
                      }
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
