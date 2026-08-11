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

interface MonthlyMigrationCardProps {
  data: { month: string; monthLabel: string; count: number }[];
  activeCloud: string;
  cloudColor: string;
}

export default function MonthlyMigrationCard({ data, activeCloud, cloudColor }: MonthlyMigrationCardProps) {
  return (
    <div className="ods-card">
      <div className="ods-card-header">
        <h2 className="ods-card-title">Monthly Migration Data</h2>
      </div>
      <div className="ods-card-body">
        {data.length === 0 ? (
          <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
            No migration date data available for {activeCloud}.
          </p>
        ) : (
          <>
            <div style={{ width: "100%", height: 350, marginBottom: "1.5rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ods-gray-200)" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: "var(--ods-gray-600)" }} />
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
                  <Bar dataKey="count" name={activeCloud} fill={cloudColor} radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="ods-table-wrapper">
              <table className="ods-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>{activeCloud} Migrations</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.month}>
                      <td style={{ fontWeight: 600, color: "var(--ods-gray-800)" }}>{row.monthLabel}</td>
                      <td>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
