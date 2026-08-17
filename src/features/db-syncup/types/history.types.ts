export interface DbSyncHistoryEntry {
  id: number;
  entity_type: string;
  entity_id: number;
  db_syncup_id: number;
  request_id: number;
  request_environment_id: number;
  action: string;
  field_name: string;
  old_value: string;
  new_value: string;
  message?: string | null;
  old_snapshot?: Record<string, unknown> | null;
  new_snapshot?: Record<string, unknown> | null;
  changed_by_user_id: number;
  changed_by_name: string;
  changed_by_full_name: string;
  changed_by_email: string;
  source: string;
  change_reason: string;
  created_at: string;
}

export interface DbSyncHistoryResponse {
  total: number;
  items: DbSyncHistoryEntry[];
}
