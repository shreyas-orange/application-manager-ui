// src/features/dashboard/components/StatsGrid.tsx
import {
  CheckCircle,
  CircleX,
  Clock3,
  FolderOpen,
  Hourglass,
  Upload,
  Users,
} from "lucide-react";

import DashboardCard        from "./DashboardCard";
import type { Summary }     from "../types/dashboard.types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatsGridProps {
  summary: Summary | undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StatsGrid({ summary }: StatsGridProps) {
  return (
    <div
      style={{
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap:                 "1rem",
        marginBottom:        "1.5rem",
      }}
    >
      <DashboardCard
        title="Total Users"
        value={summary?.total_users ?? 0}
        description="Registered users"
        icon={<Users size={18} />}
      />
      <DashboardCard
        title="Total Applications"
        value={summary?.total_applications ?? 0}
        description="Registered applications"
        icon={<FolderOpen size={18} />}
      />
      <DashboardCard
        title="Total Uploads"
        value={summary?.total_uploads ?? 0}
        description="Uploaded files"
        icon={<Upload size={18} />}
      />
      <DashboardCard
        title="Completed"
        value={summary?.completed_migrations ?? 0}
        description="Completed migrations"
        icon={<CheckCircle size={18} />}
        variant="success"
      />
      <DashboardCard
        title="In Progress"
        value={summary?.in_progress_migrations ?? 0}
        description="Active migrations"
        icon={<Clock3 size={18} />}
        variant="warning"
      />
      <DashboardCard
        title="Pending"
        value={summary?.pending_migrations ?? 0}
        description="Pending migrations"
        icon={<Hourglass size={18} />}
        variant="warning"
      />
      <DashboardCard
        title="Failed Uploads"
        value={summary?.failed_uploads ?? 0}
        description="Failed uploads"
        icon={<CircleX size={18} />}
        variant="danger"
      />
    </div>
  );
}
