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
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem", flexWrap: "wrap" }}>
            <div style={{ width: 280, height: 280, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={50}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
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
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.map((entry) => (
                <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ width: 14, height: 14, background: STATUS_COLORS[entry.name] ?? "#999", flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-700)", minWidth: 90 }}>
                    {entry.name}
                  </span>
                  <strong style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-900)" }}>
                    {entry.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
