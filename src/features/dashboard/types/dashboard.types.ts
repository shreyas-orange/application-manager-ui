export interface DashboardSummary {
  total_applications: number;
  total_uploads: number;
  completed_migrations: number;
  in_progress_migrations: number;
  pending_migrations: number;
  failed_uploads: number;
  total_users: number;
}

export type Summary = DashboardSummary;

export interface MigrationStatusItem {
  status: string | null;
  count: number;
}

export interface CloudDistributionItem {
  cloud: string;
  count: number;
}

export interface ApplicationsByDomainItem {
  domain: string;
  count: number;
}

export interface RecentUpload {
  id: number;
  file_name: string;
  status: string;
  uploaded_by: string;
  created_at: string;
}

export interface RecentAuditLog {
  id?: number;
  user?: string;
  action: string;
  module?: string;
  description?: string;
  created_at: string;
}

export interface NamespaceMigrationSummary {
  total_namespaces: number;
  migrated: number;
  in_progress: number;
  decommissioned: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  migration_status: MigrationStatusItem[];
  cloud_distribution: CloudDistributionItem[];
  applications_by_domain: ApplicationsByDomainItem[];
  recent_uploads: RecentUpload[];
  recent_audit_logs: RecentAuditLog[];
}
