import { z } from "zod";

// No format rules are enforced server-side beyond "these are free-text
// operational fields" — this schema exists to give the form one consistent
// validation/typing mechanism (RHF + zod), not to add new restrictions.
export const applicationEditSchema = z.object({
  application_name: z.string(),
  carto_id: z.string(),
  basicat: z.string(),
  domain: z.string(),
  confirmed_domain: z.string(),
  portfolio: z.string(),
  business_importance: z.string(),
  application_status: z.string(),
  priority: z.string(),
  sov_type: z.string(),
  out_of_scope: z.boolean(),

  qa_owner_name: z.string(),
  qa_owner_email: z.string(),
  devops_owner_name: z.string(),
  devops_owner_email: z.string(),
  pm_owner_name: z.string(),
  pm_owner_email: z.string(),
  manager_owner_name: z.string(),
  manager_owner_email: z.string(),

  migration_status: z.string(),
  migration_progress: z.coerce.number(),
  hosting_location: z.string(),
  cloud_squad: z.string(),
  cluster: z.string(),
  strategy: z.string(),
  initiated: z.string(),
  tentative_start: z.string(),
  tentative_end: z.string(),
  confirmed_end: z.string(),
  go_live: z.string(),
  total_ns: z.coerce.number(),
  ns_migration_progress: z.string(),
  migration_assessment_status: z.string(),
  migration_data_anonymization_status: z.string(),
  ns_backup_creation: z.string(),
  ns_migration_status: z.string(),

  dx_uid: z.string(),
  mcp_id: z.string(),
  assessment_status: z.string(),
  wave: z.string(),
  gate: z.string(),
  data_anonymization_status: z.string(),

  benchmark_status: z.string(),
  nexus_status: z.string(),
  rooted_status: z.string(),
  network_policy_status: z.string(),
  security_prod_status: z.string(),
  security_prod_date: z.string(),

  remark: z.string(),
  remarks_imp: z.string(),
  source_comments: z.string(),
  archived_remarks: z.string(),

  cloud_ids: z.array(z.number()),
});

// migration_progress is coerced from the <input type="number">'s string
// value to a number, so input and output shapes differ.
export type ApplicationEditFormInput = z.input<typeof applicationEditSchema>;
export type ApplicationEditFormValues = z.output<typeof applicationEditSchema>;
