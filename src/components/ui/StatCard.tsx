import type { ReactNode } from "react";

interface StatCardProps {
  title:       string;
  value:       number;
  description: string;
  icon?:       ReactNode;
  variant?:    "default" | "success" | "warning" | "danger" | "info";
}

const VARIANT_COLOR: Record<string, string> = {
  default: "var(--ods-orange)",
  success: "var(--ods-success)",
  warning: "#f59e0b",
  danger:  "var(--ods-danger)",
  info:    "var(--ods-info)",
};

const VARIANT_BG: Record<string, string> = {
  default: "rgba(255, 121, 0, 0.08)",
  success: "rgba(25, 135, 84, 0.08)",
  warning: "rgba(245, 158, 11, 0.08)",
  danger:  "rgba(205, 60, 20, 0.08)",
  info:    "rgba(82, 126, 219, 0.08)",
};

const VARIANT_BORDER: Record<string, string> = {
  default: "var(--ods-orange)",
  success: "var(--ods-success)",
  warning: "#f59e0b",
  danger:  "var(--ods-danger)",
  info:    "var(--ods-info)",
};

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: StatCardProps) {
  const accentColor = VARIANT_COLOR[variant]  ?? VARIANT_COLOR.default;
  const iconBg      = VARIANT_BG[variant]     ?? VARIANT_BG.default;
  const borderColor = VARIANT_BORDER[variant] ?? VARIANT_BORDER.default;

  return (
    <div className="ods-stat-card" style={{ borderTopColor: borderColor }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: accentColor, lineHeight: 1, marginBottom: "0.25rem" }}>
            {value}
          </div>

          <div className="ods-stat-label">{title}</div>

          <div className="ods-stat-sub">{description}</div>
        </div>

        {icon && (
          <div
            style={{
              width:          40,
              height:         40,
              background:     iconBg,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              color:          accentColor,
              flexShrink:     0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
