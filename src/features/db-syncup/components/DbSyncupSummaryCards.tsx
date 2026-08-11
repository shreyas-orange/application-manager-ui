import { Database, CheckCircle, CircleX, Clock3, Hourglass } from "lucide-react";

import { StatCard } from "@/components/ui";

interface DbSyncupSummaryCardsProps {
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
  failed: number;
}

export default function DbSyncupSummaryCards({
  total,
  inProgress,
  completed,
  pending,
  failed,
}: DbSyncupSummaryCardsProps) {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap:                 "1rem",
        marginBottom:        "1.5rem",
      }}
    >
      <StatCard title="Total Syncups" value={total} description="All records" icon={<Database size={18} />} />
      <StatCard title="In Progress" value={inProgress} description="Active syncups" icon={<Clock3 size={18} />} variant="warning" />
      <StatCard title="Completed" value={completed} description="Completed syncups" icon={<CheckCircle size={18} />} variant="success" />
      <StatCard title="Pending" value={pending} description="Pending syncups" icon={<Hourglass size={18} />} variant="info" />
      <StatCard title="Failed" value={failed} description="Rejected / cancelled" icon={<CircleX size={18} />} variant="danger" />
    </div>
  );
}
