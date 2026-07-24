export interface AuditLogUser {
  id?: number;
  email?: string;
  name?: string;
}

export interface AuditLog {
  id: number;
  user?: AuditLogUser;
  user_email?: string;
  action: string;
  entity?: string;
  entity_type?: string;
  resource_type?: string;
  performed_by?: string;
  description?: string;
  details?: string;
  module?: string;
  created_at: string;
}

export interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
