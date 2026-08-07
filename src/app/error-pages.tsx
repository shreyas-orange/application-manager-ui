export function ForbiddenPage() {
  return (
    <div className="ods-empty-state">
      <span className="ods-empty-icon">🔒</span>
      <div className="ods-empty-title">Access Denied</div>
      <p className="ods-empty-text">
        You do not have permission to access this page.
      </p>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="ods-empty-state">
      <span className="ods-empty-icon">🔍</span>
      <div className="ods-empty-title">Page Not Found</div>
      <p className="ods-empty-text">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
