export type DbSyncupStatusField =
  | "dev_status"
  | "demo_status"
  | "qa_status"
  | "uat_am_status"
  | "pprod_perf_status"
  | "mnt_e_status"
  | "bench_status"
  | "staging_status"
  | "int_status"
  | "prod_status";

export type DbSyncupPriority =
  | "P1"
  | "P2"
  | "P3";

export interface DbSyncEnvironmentRequest {
  id: number;
  request_id: number;
  deployment_target: "AZURE" | "BLEU" | string;
  environment: string;
  priority: string;
  environment_score: number;
  request_status: string;
  remarks: string;
  date_of_request: string;
  prod_second_load_cut_over: string;
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
  version: number;
  serial_number?: number | null;
  application_id: number;
  uploaded_file_id: number;
  application_name: string;
  clouds?: Array<{ id: number; name: string; provider?: string | null; region?: string | null; status?: string }>;
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
  demo_status: string;
  qa_status: string;
  uat_am_status: string;
  pprod_perf_status: string;
  mnt_e_status: string;
  bench_status: string;
  staging_status: string;
  int_status: string;
  prod_status: string;
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
  dx_uid?: string;
  mcp_id: string;
  remarks: string;
  environment_count: number;
  db_validation: string;
  migration_incharge: string;
  date_of_request: string;
  dev_status: string;
  demo_status: string;
  qa_status: string;
  uat_am_status: string;
  pprod_perf_status: string;
  mnt_e_status: string;
  bench_status: string;
  staging_status: string;
  int_status: string;
  prod_status: string;
  environment_priority: string;
  application_priority: string;
  time_taken_in_prod: string;
  application_id: number;
  uploaded_file_id: number;
}

export interface DbSyncEnvironmentUpdate {
  /** Omit to request a new environment — `environment` must be set instead. */
  id?: number;
  /** Required when creating a new environment (id omitted). e.g. "DEV", "PROD" */
  environment?: string;
  deployment_target?: "AZURE" | "BLEU" | string;
  request_status?: string;
  priority?: string;
  remarks?: string;
  date_of_request?: string | null;
  prod_second_load_cut_over?: string;
}

export interface DbSyncRequestUpdate {
  id?: number;
  requested_by_user_id?: number | null;
  assigned_to_user_id?: number | null;
  remarks?: string;
  environments?: DbSyncEnvironmentUpdate[];
}

export interface UpdateDbSyncupPayload {
  version: number;
  application_id?: number;
  uploaded_file_id?: number | null;
  serial_number?: number | null;
  application_name?: string;
  carto_id?: string;
  basicat?: string;
  domain?: string;
  dx_uid?: string;
  mcp_id?: string;
  hosting?: string;
  reason?: string;
  data_anonymization_status?: string;
  db_validation?: string;
  migration_incharge?: string;
  date_of_request?: string | null;
  environment_count?: number;
  remarks?: string;
  dev_status?: string;
  demo_status?: string;
  qa_status?: string;
  uat_am_status?: string;
  pprod_perf_status?: string;
  mnt_e_status?: string;
  bench_status?: string;
  staging_status?: string;
  int_status?: string;
  prod_status?: string;
  time_taken_in_prod?: string;
  request?: DbSyncRequestUpdate;
}

export interface DbEnvironmentWorklistItem {
  environment_id: number;
  request_id: number;
  db_syncup_id: number;
  application_id: number;
  application_name: string | null;
  carto_id: string | null;
  domain: string | null;
  deployment_target: "AZURE" | "BLEU";
  environment: string;
  request_status: string;
  priority: string;
  remarks: string | null;
  date_of_request: string | null;
  requested_at: string;
  requested_by_name: string | null;
  assigned_to_name: string | null;
  clouds: Array<{ id: number; name: string; provider: string | null; region: string | null; status: string }>;
}

export interface DbEnvironmentWorklistResponse {
  total: number;
  page: number;
  page_size: number;
  pie_chart: { requested: number; pending: number; completed: number; total: number };
  items: DbEnvironmentWorklistItem[];
}
