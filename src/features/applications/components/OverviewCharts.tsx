import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "Completed":   "#198754",
  "In Progress": "#FFC107",
  "Failed":      "#DC3545",
  "Pending":     "#6C757D",
};

const AZURE_COLOR = "#0078D4";
const BLUE_COLOR  = "#0052CC";

interface MonthlyDatum {
  month: string;
  monthLabel: string;
  Azure: number;
  Blue: number;
}

interface StatusDatum {
  name: string;
  value: number;
}

interface OverviewChartsProps {
  monthlyData: MonthlyDatum[];
  statusPieData: StatusDatum[];
}

export default function OverviewCharts({ monthlyData, statusPieData }: OverviewChartsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
      {/* Bar chart */}
      <div className="ods-card">
        <div className="ods-card-header">
          <h2 className="ods-card-title">Monthly Migration</h2>
        </div>
        <div className="ods-card-body">
          {monthlyData.length === 0 ? (
            <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ods-gray-200)" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: "var(--ods-gray-600)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ods-gray-600)" }} />
                <Tooltip contentStyle={{ background: "var(--ods-white)", border: "1px solid var(--ods-gray-200)", borderRadius: 0, fontSize: "var(--ods-font-size-sm)" }} />
                <Legend />
                <Bar dataKey="Azure" fill={AZURE_COLOR} />
                <Bar dataKey="Blue" fill={BLUE_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie chart */}
      <div className="ods-card">
        <div className="ods-card-header">
          <h2 className="ods-card-title">Status Breakdown</h2>
        </div>
        <div className="ods-card-body">
          {statusPieData.length === 0 ? (
            <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>No data.</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" labelLine={false}
                    label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {statusPieData.map((e) => (
                      <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? "#999"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--ods-white)", border: "1px solid var(--ods-gray-200)", borderRadius: 0, fontSize: "var(--ods-font-size-sm)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {statusPieData.map((e) => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 12, height: 12, background: STATUS_COLORS[e.name] ?? "#999", flexShrink: 0 }} />
                    <span style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-700)" }}>{e.name}</span>
                    <strong style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-900)" }}>{e.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
