import { getOwnerByType } from "./status";
import type { Application } from "../types/application.types";
import type { ApplicationEditFormInput } from "../schemas/application-edit.schema";

function dateInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

export function populateApplicationForm(app: Application): ApplicationEditFormInput {
  const qa      = getOwnerByType(app, "QA");
  const devops  = getOwnerByType(app, "DevOps");
  const pm      = getOwnerByType(app, "PM");
  const manager = getOwnerByType(app, "Application Manager");
  const last    = app.remarks?.[app.remarks.length - 1];

  return {
    application_name:          app.application_name          ?? "",
    carto_id:                  app.carto_id                  ?? "",
    basicat:                   app.basicat                   ?? "",
    domain:                    app.domain                    ?? "",
    confirmed_domain:          app.confirmed_domain          ?? "",
    portfolio:                 app.portfolio                 ?? "",
    business_importance:       app.business_importance       ?? "",
    application_status:        app.application_status        ?? "",
    priority:                  app.priority                  ?? "",
    sov_type:                  app.sov_type                  ?? "",
    out_of_scope:              app.out_of_scope              ?? false,
    qa_owner_name:             qa?.owner_name                ?? "",
    qa_owner_email:            qa?.owner_email               ?? "",
    devops_owner_name:         devops?.owner_name            ?? "",
    devops_owner_email:        devops?.owner_email           ?? "",
    pm_owner_name:             pm?.owner_name                ?? "",
    pm_owner_email:            pm?.owner_email               ?? "",
    manager_owner_name:        manager?.owner_name           ?? "",
    manager_owner_email:       manager?.owner_email          ?? "",
    migration_status:          app.migration?.migration_status          ?? "",
    migration_progress:        app.migration?.migration_progress        ?? 0,
    hosting_location:          app.migration?.hosting_location          ?? "",
    cloud_squad:               app.migration?.cloud_squad               ?? "",
    cluster:                   app.migration?.cluster                   ?? "",
    strategy:                  app.migration?.strategy                  ?? "",
    initiated:                 dateInputValue(app.migration?.initiated),
    tentative_start:           dateInputValue(app.migration?.tentative_start),
    tentative_end:             dateInputValue(app.migration?.tentative_end),
    confirmed_end:             dateInputValue(app.migration?.confirmed_end),
    go_live:                   dateInputValue(app.migration?.go_live),
    total_ns:                  app.migration?.total_ns                  ?? 0,
    ns_migration_progress:     app.migration?.ns_migration_progress     ?? "",
    migration_assessment_status:         "",
    migration_data_anonymization_status: "",
    ns_backup_creation:        app.migration?.ns_backup_creation        ?? "",
    ns_migration_status:       app.migration?.ns_migration_status       ?? "",
    dx_uid:                    app.meta_data?.dx_uid                    ?? "",
    mcp_id:                    app.meta_data?.mcp_id                    ?? "",
    assessment_status:         app.meta_data?.assessment_status         ?? "",
    wave:                      app.meta_data?.wave                      ?? "",
    gate:                      app.meta_data?.gate                      ?? "",
    data_anonymization_status: app.meta_data?.data_anonymization_status ?? "",
    benchmark_status:          app.security?.benchmark_status           ?? "",
    nexus_status:              app.security?.nexus_status               ?? "",
    rooted_status:             app.security?.rooted_status              ?? "",
    network_policy_status:     app.security?.network_policy_status      ?? "",
    security_prod_status:      app.security?.security_prod_status       ?? "",
    security_prod_date:        dateInputValue(app.security?.security_prod_date),
    remark:                    last?.remark                             ?? "",
    remarks_imp:               last?.remarks_imp                        ?? "",
    source_comments:           last?.source_comments                    ?? "",
    archived_remarks:          last?.archived_remarks                   ?? "",
    cloud_ids:                 app.cloud_mappings?.map((mapping) => mapping.cloud_id) ?? [],
  };
}
