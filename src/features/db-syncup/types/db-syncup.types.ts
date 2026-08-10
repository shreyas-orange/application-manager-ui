export type DbSyncupStatusField =
  | "dev_status"
  | "qa_status"
  | "uat_am_status"
  | "pprod_perf_status"
  | "mnt_e_status"
  | "prod_status";

export type DbSyncupPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface DbSyncEnvironmentRequest {
  id: number;
  request_id: number;
  environment: string;
  priority: string;
  environment_score: number;
  request_status: string;
  remarks: string;
}

export interface DbSyncRequest {
  id: number;
  db_syncup_id: number;
  requested_by_user_id: number;
  requested_by_name: string;
  assigned_to_user_id: number | null;
  assigned_to_name: string;
  application_priority: string;
  migration_progress_snapshot: number;
  priority_score: number;
  request_status: string;
  remarks: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  environments: DbSyncEnvironmentRequest[];
}

export interface DbSyncup {
  id: number;
  serial_number: number;
  application_id: number;
  uploaded_file_id: number;
  application_name: string;
  carto_id: string;
  basicat: string;
  hosting: string;
  reason: string;
  data_anonymization_status: string;
  domain: string;
  dx_uid: string;
  mcp_id: string;
  remarks: string;
  environment_count: number;
  db_validation: string;
  migration_incharge: string;
  date_of_request: string;
  dev_status: string;
  qa_status: string;
  uat_am_status: string;
  pprod_perf_status: string;
  mnt_e_status: string;
  prod_status: string;
  environment_priority: string;
  application_priority: string;
  time_taken_in_prod: string;
  ns_migration_progress?: string | null;
  requests: DbSyncRequest[];
}

export interface CreateDbSyncupPayload {
  serial_number: number;
  application_name: string;
  carto_id: string;
  basicat: string;
  hosting: string;
  reason: string;
  data_anonymization_status: string;
  domain: string;
  dx_uid: string;
  mcp_id: string;
  remarks: string;
  environment_count: number;
  db_validation: string;
  migration_incharge: string;
  date_of_request: string;
  dev_status: string;
  qa_status: string;
  uat_am_status: string;
  pprod_perf_status: string;
  mnt_e_status: string;
  prod_status: string;
  environment_priority: string;
  application_priority: string;
  time_taken_in_prod: string;
  application_id: number;
  uploaded_file_id: number;
}

export interface DbSyncEnvironmentUpdate {
  id: number;
  request_status?: string;
  priority?: string;
  remarks?: string;
}

export interface DbSyncRequestUpdate {
  id: number;
  assigned_to_user_id?: number | null;
  remarks?: string;
  environments?: DbSyncEnvironmentUpdate[];
}

export interface UpdateDbSyncupPayload {
  db_validation?: string;
  migration_incharge?: string;
  remarks?: string;
  request?: DbSyncRequestUpdate;
}
