export interface ApplicationOwner {
  id: number;
  application_id: number;
  owner_type: string;
  owner_name: string;
  owner_email: string | null;
}

export interface Cloud {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CloudMapping {
  id: number;
  cloud_id: number;
  application_id: number;
  created_at?: string;
  updated_at?: string;
  cloud: Cloud;
}

export interface ApplicationMigration {
  id: number;
  application_id: number;
  hosting_location: string | null;
  total_ns: number | null;
  cloud_squad: string | null;
  ns_migration_progress: string | null;
  initiated: string | null;
  tentative_start: string | null;
  tentative_end: string | null;
  tentative_end_nonprod: string | null;
  tentative_end_prod: string | null;
  confirmed_end: string | null;
  go_live: string | null;
  migration_status: string | null;
  migration_progress: number | null;
  ns_migration_status: string | null;
  ns_backup_creation: string | null;
  cluster: string | null;
  strategy: string | null;
  non_production_azure_clusters: string | null;
}

export interface ApplicationMetaData {
  id: number;
  application_id: number;
  mcp_id: string | null;
  dx_uid: string | null;
  gate: string | null;
  wave: string | null;
  assessment_status: string | null;
  data_anonymization_status: string | null;
}

export interface ApplicationSecurity {
  id: number;
  application_id: number;
  nexus_status: string | null;
  security_prod_status: string | null;
  security_prod_date: string | null;
  benchmark_status: string | null;
  rooted_status: string | null;
  network_policy_status: string | null;
}

export interface ApplicationRemark {
  id: number;
  application_id: number;
  remark: string | null;
  source_comments: string | null;
  remarks_imp: string | null;
  archived_remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  uploaded_file_id: number | null;
  application_name: string;
  application_status: string | null;
  domain: string | null;
  confirmed_domain: string | null;
  portfolio: string | null;
  carto_id: string | null;
  basicat: string | null;
  priority: string | null;
  business_importance: string | null;
  sov_type: string | null;
  out_of_scope: boolean;
  created_at: string;
  updated_at: string;
  owners: ApplicationOwner[];
  cloud_mappings: CloudMapping[];
  migration: ApplicationMigration | null;
  meta_data: ApplicationMetaData | null;
  security: ApplicationSecurity | null;
  remarks: ApplicationRemark[];
}

export interface ApplicationsApiResponse {
  page: number;
  size: number;
  total: number;
  data: Application[];
}

export interface ApplicationsResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Application[];
}

export interface UpdateOwnerPayload {
  owner_type: string;
  owner_name: string;
  owner_email: string | null;
}

export interface UpdateApplicationPayload {
  application_name?: string;
  carto_id?: string;
  basicat?: string;
  domain?: string;
  confirmed_domain?: string;
  portfolio?: string;
  business_importance?: string;
  application_status?: string;
  priority?: string;
  sov_type?: string;
  out_of_scope?: boolean;

  owners?: UpdateOwnerPayload[];

  migration?: {
    migration_status?: string;
    migration_progress?: number;
    hosting_location?: string;
    cloud_squad?: string;
    cluster?: string | null;
    strategy?: string | null;
    tentative_start?: string | null;
    tentative_end?: string | null;
    confirmed_end?: string | null;
    go_live?: string | null;
  };

  meta_data?: {
    assessment_status?: string;
    wave?: string;
    gate?: string | null;
    data_anonymization_status?: string;
  };

  security?: {
    nexus_status?: string | null;
    rooted_status?: string | null;
    network_policy_status?: string | null;
    security_prod_status?: string | null;
  };

  remarks?: Array<{
    remark?: string | null;
    remarks_imp?: string | null;
    source_comments?: string | null;
  }>;
}