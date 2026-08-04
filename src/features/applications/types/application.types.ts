// src/features/applications/types/application.types.ts

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface ApplicationOwner {
  id:             number;
  application_id: number;
  owner_type:     string;
  owner_name:     string;
  owner_email:    string | null;
}

export interface Cloud {
  id:          number;
  name:        string;
  created_at?: string;
  updated_at?: string;
}

export interface CloudMapping {
  id:             number;
  cloud_id:       number;
  application_id: number;
  created_at?:    string;
  updated_at?:    string;
  cloud:          Cloud;
}

export interface ApplicationMigration {
  id:                          number;
  application_id:              number;
  hosting_location:            string | null;
  total_ns:                    number | null;
  ns_migrated:                 number | null;
  ns_in_progress:              number | null;
  ns_decommissioned:           number | null;
  cloud_squad:                 string | null;
  ns_migration_progress:       string | null;
  initiated:                   string | null;
  tentative_start:             string | null;
  tentative_end:               string | null;
  tentative_end_nonprod:       string | null;
  tentative_end_prod:          string | null;
  confirmed_end:               string | null;
  go_live:                     string | null;
  migration_status:            string | null;
  migration_progress:          number | null;
  ns_migration_status:         string | null;
  ns_backup_creation:          string | null;
  cluster:                     string | null;
  strategy:                    string | null;
  non_production_azure_clusters: string | null;
}

export interface ApplicationMetaData {
  id:                        number;
  application_id:            number;
  mcp_id:                    string | null;
  dx_uid:                    string | null;
  gate:                      string | null;
  wave:                      string | null;
  assessment_status:         string | null;
  data_anonymization_status: string | null;
}

export interface ApplicationSecurity {
  id:                    number;
  application_id:        number;
  nexus_status:          string | null;
  security_prod_status:  string | null;
  security_prod_date:    string | null;
  benchmark_status:      string | null;
  rooted_status:         string | null;
  network_policy_status: string | null;
}

export interface ApplicationRemark {
  id:               number;
  application_id:   number;
  remark:           string | null;
  source_comments:  string | null;
  remarks_imp:      string | null;
  archived_remarks: string | null;
  created_at:       string;
  updated_at:       string;
}

export interface Application {
  id:                 number;
  uploaded_file_id:   number | null;
  application_name:   string;
  application_status: string | null;
  domain:             string | null;
  confirmed_domain:   string | null;
  portfolio:          string | null;
  carto_id:           string | null;
  basicat:            string | null;
  priority:           string | null;
  business_importance: string | null;
  sov_type:           string | null;
  out_of_scope:       boolean;
  has_roadmap:        boolean;
  created_at:         string;
  updated_at:         string;
  owners:             ApplicationOwner[];
  cloud_mappings:     CloudMapping[];
  migration:          ApplicationMigration | null;
  meta_data:          ApplicationMetaData | null;
  security:           ApplicationSecurity | null;
  remarks:            ApplicationRemark[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApplicationsApiResponse {
  page:  number;
  size:  number;
  total: number;
  data:  Application[];
}

export interface ApplicationsResponse {
  page:     number;
  pageSize: number;
  total:    number;
  items:    Application[];
}

// ─── Payload Types ────────────────────────────────────────────────────────────

export interface UpdateOwnerPayload {
  owner_type:   string;
  owner_name:   string | null;
  owner_email:  string | null;
}

export interface UpdateApplicationPayload {
  application?: {
    application_name?:    string | null;
    carto_id?:            string | null;
    basicat?:             string | null;
    domain?:              string | null;
    confirmed_domain?:    string | null;
    portfolio?:           string | null;
    business_importance?: string | null;
    application_status?:  string | null;
    priority?:            string | null;
    sov_type?:            string | null;
    out_of_scope?:        boolean;
  };

  owners?: UpdateOwnerPayload[];

  migration?: {
    migration_status?:   string | null;
    migration_progress?: number | null;
    hosting_location?:   string | null;
    cloud_squad?:        string | null;
    cluster?:            string | null;
    strategy?:           string | null;
    initiated?:          string | null;
    tentative_start?:    string | null;
    tentative_end?:      string | null;
    confirmed_end?:      string | null;
    go_live?:            string | null;
    total_ns?:           number | null;
    ns_migration_progress?: string | null;
    ns_backup_creation?: string | null;
    ns_migration_status?: string | null;
    assessment_status?:  string | null;
    data_anonymization_status?: string | null;
  };

  meta_data?: {
    dx_uid?:                   string | null;
    mcp_id?:                   string | null;
    wave?:                     string | null;
    gate?:                     string | null;
    assessment_status?:        string | null;
    data_anonymization_status?: string | null;
  };

  security?: {
    benchmark_status?:      string | null;
    nexus_status?:          string | null;
    rooted_status?:         string | null;
    network_policy_status?: string | null;
    security_prod_status?:  string | null;
    security_prod_date?:    string | null;
  };

  remark?: {
    remark?:           string | null;
    remarks_imp?:      string | null;
    source_comments?:  string | null;
    archived_remarks?: string | null;
    out_of_scope?:     string | null;
  };

  cloud_ids?: number[];
}
