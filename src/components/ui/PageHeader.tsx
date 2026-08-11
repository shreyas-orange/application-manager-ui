import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered left of the title — e.g. a "Back" button. */
  leading?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, leading, actions }: PageHeaderProps) {
  return (
    <div className="ods-page-header">
      <div className="ods-page-header-title-row">
        {leading}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="ods-page-header-actions">{actions}</div>}
    </div>
  );
}
