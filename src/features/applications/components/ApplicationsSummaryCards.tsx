import {
  AppWindow,
  CheckCircle,
  CircleX,
  Clock3,
  Hourglass,
} from "lucide-react";

import { StatCard } from "@/components/ui";

interface ApplicationsSummaryCardsProps {
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
  failed: number;
}

export default function ApplicationsSummaryCards({
  total,
  inProgress,
  completed,
  pending,
  failed,
}: ApplicationsSummaryCardsProps) {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap:                 "1rem",
        marginBottom:        "1.5rem",
      }}
    >
      <StatCard title="Total Applications" value={total} description="All registered" icon={<AppWindow size={18} />} />
      <StatCard title="In Progress" value={inProgress} description="Active migrations" icon={<Clock3 size={18} />} variant="warning" />
      <StatCard title="Completed" value={completed} description="Completed migrations" icon={<CheckCircle size={18} />} variant="success" />
      <StatCard title="Pending" value={pending} description="Pending migrations" icon={<Hourglass size={18} />} variant="info" />
      <StatCard title="Failed" value={failed} description="Failed migrations" icon={<CircleX size={18} />} variant="danger" />
    </div>
  );
}
