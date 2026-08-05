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
  application_id: number;
  uploaded_file_id: number;
}

export interface UpdateDbSyncupPayload {
  db_validation: string;
  migration_incharge: string;
  date_of_request: string;
  environment_count: number;
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
  remarks: string;
}
