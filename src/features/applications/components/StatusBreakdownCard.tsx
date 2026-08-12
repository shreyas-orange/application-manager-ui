import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "Completed":   "#198754",
  "In Progress": "#FFC107",
  "Failed":      "#DC3545",
  "Pending":     "#6C757D",
};

interface StatusBreakdownCardProps {
  data: { name: string; value: number }[];
  activeCloud: string;
}

export default function StatusBreakdownCard({ data, activeCloud }: StatusBreakdownCardProps) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="ods-card" style={{ marginTop: "1.5rem" }}>
      <div className="ods-card-header">
        <h2 className="ods-card-title">{activeCloud} — Application Status</h2>
      </div>
      <div className="ods-card-body">
        {data.length === 0 ? (
          <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
            No {activeCloud} applications found.
          </p>
        ) : (
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            "3rem",
              flexWrap:       "wrap",
              minHeight:      300,
              padding:        "1rem",
            }}
          >
            <div style={{ width: 260, height: 260, flexShrink: 0, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={68}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#999"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background:   "var(--ods-white)",
                      border:       "1px solid var(--ods-gray-200)",
                      borderRadius: 0,
                      fontSize:     "var(--ods-font-size-sm)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                aria-hidden="true"
                style={{
                  position:       "absolute",
                  inset:          0,
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  pointerEvents:  "none",
                }}
              >
                <strong style={{ color: "var(--ods-gray-900)", fontSize: "1.75rem", lineHeight: 1 }}>
                  {total}
                </strong>
                <span style={{ color: "var(--ods-gray-500)", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                  Applications
                </span>
              </div>
            </div>

            <div
              aria-label="Application status legend"
              style={{ display: "flex", flexDirection: "column", gap: "0.875rem", minWidth: 190 }}
            >
              {data.map((entry) => (
                <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ width: 14, height: 14, background: STATUS_COLORS[entry.name] ?? "#999", flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-700)", flex: 1 }}>
                    {entry.name}
                  </span>
                  <strong style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-900)" }}>
                    {entry.value}
                  </strong>
                  <span style={{ width: 42, textAlign: "right", color: "var(--ods-gray-500)", fontSize: "0.75rem" }}>
                    {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
