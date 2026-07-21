import type {
  RecentUpload,
} from "../types/dashboard.types";

interface RecentUploadsTableProps {
  uploads: RecentUpload[];
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function RecentUploadsTable({
  uploads,
}: RecentUploadsTableProps) {
  return (
    <section className="dashboard-panel">
      <h2>Recent Uploads</h2>

      {uploads.length === 0 ? (
        <p className="dashboard-empty">
          No recent uploads.
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>File name</th>
                <th>Status</th>
                <th>Uploaded by</th>
                <th>Created at</th>
              </tr>
            </thead>

            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id}>
                  <td>{upload.file_name}</td>

                  <td>
                    <span
                      className={`status-badge status-badge--${upload.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {upload.status}
                    </span>
                  </td>

                  <td>{upload.uploaded_by}</td>

                  <td>
                    {formatDate(upload.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}