// src/features/dashboard/components/DashboardCard.tsx
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardCardProps {
  title:       string;
  value:       number | string;
  description?: string;
  icon?:       ReactNode;
  variant?:    "default" | "success" | "warning" | "danger" | "info";
}

// ─── Variant → ODS token map ──────────────────────────────────────────────────
const VARIANT_COLOR: Record<string, string> = {
  default: "var(--ods-orange)",
  success: "var(--ods-success)",
  warning: "var(--ods-warning)",
  danger:  "var(--ods-danger)",
  info:    "var(--ods-info)",
};

const VARIANT_BORDER: Record<string, string> = {
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: DashboardCardProps) {
  const accentColor  = VARIANT_COLOR[variant]  ?? VARIANT_COLOR.default;
  const borderColor  = VARIANT_BORDER[variant] ?? VARIANT_BORDER.default;
  const iconBg       = VARIANT_BG[variant]     ?? VARIANT_BG.default;

  return (
    <div
      className="ods-stat-card"
      style={{ borderTopColor: borderColor }}
    >
      <div
        style={{
          display:         "flex",
          justifyContent:  "space-between",
          alignItems:      "flex-start",
        }}
      >
        {/* ── Left — value + labels ─────────────────────────── */}
        <div>
          <div
            style={{
              fontSize:     "2rem",
              fontWeight:   700,
              color:        accentColor,
              lineHeight:   1,
              marginBottom: "0.25rem",
            }}
          >
            {value}
          </div>

          <div className="ods-stat-label">{title}</div>

          {description && (
            <div className="ods-stat-sub">{description}</div>
          )}
        </div>

        {/* ── Right — icon ──────────────────────────────────── */}
        {icon && (
          <div
            style={{
              width:           40,
              height:          40,
              background:      iconBg,
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              color:           accentColor,
              flexShrink:      0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
