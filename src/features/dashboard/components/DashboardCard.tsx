import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: DashboardCardProps) {
  return (
    <div
      className={`dashboard-card dashboard-card--${variant}`}
    >
      <div className="dashboard-card-header">
        <div>
          <p className="dashboard-card-title">
            {title}
          </p>

          {description && (
            <p className="dashboard-card-description">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div className="dashboard-card-icon">
            {icon}
          </div>
        )}
      </div>

      <div className="dashboard-card-value">
        {value}
      </div>
    </div>
  );
}