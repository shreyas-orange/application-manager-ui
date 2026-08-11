import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  text?: ReactNode;
  action?: ReactNode;
  /** Use inside table cells or smaller panels — reduces padding. */
  compact?: boolean;
}

export function EmptyState({ icon, title, text, action, compact }: EmptyStateProps) {
  return (
    <div className={`ods-empty-state${compact ? " compact" : ""}`}>
      {icon && <span className="ods-empty-icon">{icon}</span>}
      {title && <div className="ods-empty-title">{title}</div>}
      {text && <p className="ods-empty-text">{text}</p>}
      {action}
    </div>
  );
}
