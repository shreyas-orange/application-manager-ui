import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useUpdateApplication } from "../hooks/useUpdateApplication";
import type {
  Application,
  UpdateApplicationPayload,
} from "../types/application.types";

interface ApplicationDetailsDrawerProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (
    application: Application,
  ) => void;
}

interface FormState {
  application_name: string;
  carto_id: string;
  basicat: string;
  domain: string;
  confirmed_domain: string;
  portfolio: string;
  business_importance: string;
  application_status: string;
  priority: string;
  sov_type: string;
  out_of_scope: boolean;

  qa_owner_name: string;
  qa_owner_email: string;

  devops_owner_name: string;
  devops_owner_email: string;

  pm_owner_name: string;
  pm_owner_email: string;

  manager_owner_name: string;
  manager_owner_email: string;

  migration_status: string;
  migration_progress: number;
  hosting_location: string;
  cloud_squad: string;
  cluster: string;
  strategy: string;
  tentative_start: string;
  tentative_end: string;
  confirmed_end: string;
  go_live: string;

  assessment_status: string;
  wave: string;
  gate: string;
  data_anonymization_status: string;

  nexus_status: string;
  rooted_status: string;
  network_policy_status: string;
  security_prod_status: string;

  remark: string;
  remarks_imp: string;
  source_comments: string;
}

const EMPTY_FORM: FormState = {
  application_name: "",
  carto_id: "",
  basicat: "",
  domain: "",
  confirmed_domain: "",
  portfolio: "",
  business_importance: "",
  application_status: "",
  priority: "",
  sov_type: "",
  out_of_scope: false,

  qa_owner_name: "",
  qa_owner_email: "",
  devops_owner_name: "",
  devops_owner_email: "",
  pm_owner_name: "",
  pm_owner_email: "",
  manager_owner_name: "",
  manager_owner_email: "",

  migration_status: "",
  migration_progress: 0,
  hosting_location: "",
  cloud_squad: "",
  cluster: "",
  strategy: "",
  tentative_start: "",
  tentative_end: "",
  confirmed_end: "",
  go_live: "",

  assessment_status: "",
  wave: "",
  gate: "",
  data_anonymization_status: "",

  nexus_status: "",
  rooted_status: "",
  network_policy_status: "",
  security_prod_status: "",

  remark: "",
  remarks_imp: "",
  source_comments: "",
};

function getOwner(
  application: Application,
  type: string,
) {
  return application.owners?.find(
    (owner) =>
      owner.owner_type
        ?.trim()
        .toLowerCase() ===
      type.trim().toLowerCase(),
  );
}

function dateInputValue(
  value: string | null | undefined,
) {
  return value ? value.slice(0, 10) : "";
}

export default function ApplicationDetailsDrawer({
  application,
  isOpen,
  onClose,
  onUpdated,
}: ApplicationDetailsDrawerProps) {
  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  const updateMutation =
    useUpdateApplication();

  useEffect(() => {
    if (!application) {
      setForm(EMPTY_FORM);
      return;
    }

    const qaOwner = getOwner(
      application,
      "QA",
    );

    const devOpsOwner = getOwner(
      application,
      "DevOps",
    );

    const pmOwner = getOwner(
      application,
      "PM",
    );

    const managerOwner = getOwner(
      application,
      "Application Manager",
    );

    const latestRemark =
      application.remarks?.[
        application.remarks.length - 1
      ];

    setForm({
      application_name:
        application.application_name ?? "",
      carto_id: application.carto_id ?? "",
      basicat: application.basicat ?? "",
      domain: application.domain ?? "",
      confirmed_domain:
        application.confirmed_domain ?? "",
      portfolio:
        application.portfolio ?? "",
      business_importance:
        application.business_importance ?? "",
      application_status:
        application.application_status ?? "",
      priority: application.priority ?? "",
      sov_type: application.sov_type ?? "",
      out_of_scope:
        application.out_of_scope ?? false,

      qa_owner_name:
        qaOwner?.owner_name ?? "",
      qa_owner_email:
        qaOwner?.owner_email ?? "",

      devops_owner_name:
        devOpsOwner?.owner_name ?? "",
      devops_owner_email:
        devOpsOwner?.owner_email ?? "",

      pm_owner_name:
        pmOwner?.owner_name ?? "",
      pm_owner_email:
        pmOwner?.owner_email ?? "",

      manager_owner_name:
        managerOwner?.owner_name ?? "",
      manager_owner_email:
        managerOwner?.owner_email ?? "",

      migration_status:
        application.migration
          ?.migration_status ?? "",

      migration_progress:
        application.migration
          ?.migration_progress ?? 0,

      hosting_location:
        application.migration
          ?.hosting_location ?? "",

      cloud_squad:
        application.migration
          ?.cloud_squad ?? "",

      cluster:
        application.migration?.cluster ??
        "",

      strategy:
        application.migration?.strategy ??
        "",

      tentative_start: dateInputValue(
        application.migration
          ?.tentative_start,
      ),

      tentative_end: dateInputValue(
        application.migration
          ?.tentative_end,
      ),

      confirmed_end: dateInputValue(
        application.migration
          ?.confirmed_end,
      ),

      go_live: dateInputValue(
        application.migration?.go_live,
      ),

      assessment_status:
        application.meta_data
          ?.assessment_status ?? "",

      wave:
        application.meta_data?.wave ?? "",

      gate:
        application.meta_data?.gate ?? "",

      data_anonymization_status:
        application.meta_data
          ?.data_anonymization_status ?? "",

      nexus_status:
        application.security
          ?.nexus_status ?? "",

      rooted_status:
        application.security
          ?.rooted_status ?? "",

      network_policy_status:
        application.security
          ?.network_policy_status ?? "",

      security_prod_status:
        application.security
          ?.security_prod_status ?? "",

      remark:
        latestRemark?.remark ?? "",

      remarks_imp:
        latestRemark?.remarks_imp ?? "",

      source_comments:
        latestRemark?.source_comments ?? "",
    });
  }, [application]);

  if (!isOpen || !application) {
    return null;
  }

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload: UpdateApplicationPayload = {
          application: {
            application_name:
              form.application_name || null,
            carto_id: form.carto_id || null,
            basicat: form.basicat || null,
            priority: form.priority || null,
            confirmed_domain:
              form.confirmed_domain || null,
            application_status:
              form.application_status || null,
            domain: form.domain || null,
            portfolio: form.portfolio || null,
            business_importance:
              form.business_importance || null,
            sov_type: form.sov_type || null,
          },

          meta_data: {
            dx_uid: form.dx_uid || null,
            mcp_id: form.mcp_id || null,
            wave: form.wave || null,
            gate: form.gate || null,
            assessment_status:
              form.assessment_status || null,
            data_anonymization_status:
              form.data_anonymization_status || null,
          },

          migration: {
            migration_status:
              form.migration_status || null,

            migration_progress:
              form.migration_progress === ""
                ? null
                : Number(form.migration_progress),

            strategy: form.strategy || null,
            hosting_location:
              form.hosting_location || null,
            cloud_squad: form.cloud_squad || null,

            initiated: form.initiated || null,
            tentative_start:
              form.tentative_start || null,
            tentative_end:
              form.tentative_end || null,
            confirmed_end:
              form.confirmed_end || null,
            go_live: form.go_live || null,

            total_ns:
              form.total_ns === ""
                ? null
                : Number(form.total_ns),

            ns_migration_progress:
              form.ns_migration_progress || null,
            assessment_status:
              form.migration_assessment_status ||
              null,
            data_anonymization_status:
              form.migration_data_anonymization_status ||
              null,
            ns_backup_creation:
              form.ns_backup_creation || null,
            ns_migration_status:
              form.ns_migration_status || null,
            cluster: form.cluster || null,
          },

          security: {
            benchmark_status:
              form.benchmark_status || null,
            nexus_status:
              form.nexus_status || null,
            rooted_status:
              form.rooted_status || null,
            network_policy_status:
              form.network_policy_status || null,
            security_prod_status:
              form.security_prod_status || null,
            security_prod_date:
              form.security_prod_date || null,
          },

          remark: {
            remark: form.remark || null,
            remarks_imp:
              form.remarks_imp || null,
            source_comments:
              form.source_comments || null,
            archived_remarks:
              form.archived_remarks || null,
            out_of_scope:
              form.out_of_scope_remark || null,
          },

          owners: [
            {
              owner_type: "QA",
              owner_name:
                form.qa_owner_name || null,
              owner_email:
                form.qa_owner_email || null,
            },
            {
              owner_type: "DevOps",
              owner_name:
                form.devops_owner_name || null,
              owner_email:
                form.devops_owner_email || null,
            },
            {
              owner_type: "PM",
              owner_name:
                form.pm_owner_name || null,
              owner_email:
                form.pm_owner_email || null,
            },
            {
              owner_type:
                "Application Manager",
              owner_name:
                form.manager_owner_name || null,
              owner_email:
                form.manager_owner_email || null,
            },
          ],

          cloud_ids: form.cloud_ids,
        };

    try {
      const updatedApplication =
        await updateMutation.mutateAsync({
          applicationId: application.id,
          payload,
        });

      onUpdated(updatedApplication);
      onClose();
    } catch {
      // The mutation error is displayed below.
    }
  };

  return (
    <div
      className="application-drawer-backdrop"
      onMouseDown={onClose}
    >
      <aside
        className="application-drawer"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="application-drawer-header">
          <div>
            <h2>
              {application.application_name}
            </h2>

            <p>
              Application ID: {application.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          className="application-edit-form"
          onSubmit={handleSubmit}
        >
          <FormSection title="Application information">
            <FormInput
              label="Application name"
              value={form.application_name}
              onChange={(value) =>
                updateField(
                  "application_name",
                  value,
                )
              }
            />

            <FormInput
              label="Carto ID"
              value={form.carto_id}
              onChange={(value) =>
                updateField(
                  "carto_id",
                  value,
                )
              }
            />

            <FormInput
              label="Basicat"
              value={form.basicat}
              onChange={(value) =>
                updateField(
                  "basicat",
                  value,
                )
              }
            />

            <FormInput
              label="Domain"
              value={form.domain}
              onChange={(value) =>
                updateField("domain", value)
              }
            />

            <FormInput
              label="Confirmed domain"
              value={form.confirmed_domain}
              onChange={(value) =>
                updateField(
                  "confirmed_domain",
                  value,
                )
              }
            />

            <FormInput
              label="Portfolio"
              value={form.portfolio}
              onChange={(value) =>
                updateField(
                  "portfolio",
                  value,
                )
              }
            />

            <FormInput
              label="Business importance"
              value={
                form.business_importance
              }
              onChange={(value) =>
                updateField(
                  "business_importance",
                  value,
                )
              }
            />

            <FormInput
              label="Application status"
              value={
                form.application_status
              }
              onChange={(value) =>
                updateField(
                  "application_status",
                  value,
                )
              }
            />

            <FormInput
              label="Priority"
              value={form.priority}
              onChange={(value) =>
                updateField(
                  "priority",
                  value,
                )
              }
            />

            <FormInput
              label="SOV type"
              value={form.sov_type}
              onChange={(value) =>
                updateField(
                  "sov_type",
                  value,
                )
              }
            />

            <label className="application-checkbox">
              <input
                type="checkbox"
                checked={form.out_of_scope}
                onChange={(event) =>
                  updateField(
                    "out_of_scope",
                    event.target.checked,
                  )
                }
              />

              Out of scope
            </label>
          </FormSection>

          <FormSection title="Owners">
            <FormInput
              label="QA owner"
              value={form.qa_owner_name}
              onChange={(value) =>
                updateField(
                  "qa_owner_name",
                  value,
                )
              }
            />

            <FormInput
              label="QA email"
              value={form.qa_owner_email}
              onChange={(value) =>
                updateField(
                  "qa_owner_email",
                  value,
                )
              }
            />

            <FormInput
              label="DevOps owner"
              value={
                form.devops_owner_name
              }
              onChange={(value) =>
                updateField(
                  "devops_owner_name",
                  value,
                )
              }
            />

            <FormInput
              label="DevOps email"
              value={
                form.devops_owner_email
              }
              onChange={(value) =>
                updateField(
                  "devops_owner_email",
                  value,
                )
              }
            />

            <FormInput
              label="PM owner"
              value={form.pm_owner_name}
              onChange={(value) =>
                updateField(
                  "pm_owner_name",
                  value,
                )
              }
            />

            <FormInput
              label="PM email"
              value={form.pm_owner_email}
              onChange={(value) =>
                updateField(
                  "pm_owner_email",
                  value,
                )
              }
            />

            <FormInput
              label="Application manager"
              value={
                form.manager_owner_name
              }
              onChange={(value) =>
                updateField(
                  "manager_owner_name",
                  value,
                )
              }
            />

            <FormInput
              label="Manager email"
              value={
                form.manager_owner_email
              }
              onChange={(value) =>
                updateField(
                  "manager_owner_email",
                  value,
                )
              }
            />
          </FormSection>

          <FormSection title="Migration">
            <FormInput
              label="Migration status"
              value={form.migration_status}
              onChange={(value) =>
                updateField(
                  "migration_status",
                  value,
                )
              }
            />

            <label>
              Migration progress
              <input
                type="number"
                min={0}
                max={100}
                value={
                  form.migration_progress
                }
                onChange={(event) =>
                  updateField(
                    "migration_progress",
                    Number(
                      event.target.value,
                    ),
                  )
                }
              />
            </label>

            <FormInput
              label="Hosting location"
              value={
                form.hosting_location
              }
              onChange={(value) =>
                updateField(
                  "hosting_location",
                  value,
                )
              }
            />

            <FormInput
              label="Cloud squad"
              value={form.cloud_squad}
              onChange={(value) =>
                updateField(
                  "cloud_squad",
                  value,
                )
              }
            />

            <FormInput
              label="Cluster"
              value={form.cluster}
              onChange={(value) =>
                updateField(
                  "cluster",
                  value,
                )
              }
            />

            <FormInput
              label="Strategy"
              value={form.strategy}
              onChange={(value) =>
                updateField(
                  "strategy",
                  value,
                )
              }
            />

            <FormDateInput
              label="Tentative start"
              value={form.tentative_start}
              onChange={(value) =>
                updateField(
                  "tentative_start",
                  value,
                )
              }
            />

            <FormDateInput
              label="Tentative end"
              value={form.tentative_end}
              onChange={(value) =>
                updateField(
                  "tentative_end",
                  value,
                )
              }
            />

            <FormDateInput
              label="Confirmed end"
              value={form.confirmed_end}
              onChange={(value) =>
                updateField(
                  "confirmed_end",
                  value,
                )
              }
            />

            <FormDateInput
              label="Go live"
              value={form.go_live}
              onChange={(value) =>
                updateField(
                  "go_live",
                  value,
                )
              }
            />
          </FormSection>

          <FormSection title="Metadata">
            <FormInput
              label="Assessment status"
              value={
                form.assessment_status
              }
              onChange={(value) =>
                updateField(
                  "assessment_status",
                  value,
                )
              }
            />

            <FormInput
              label="Wave"
              value={form.wave}
              onChange={(value) =>
                updateField("wave", value)
              }
            />

            <FormInput
              label="Gate"
              value={form.gate}
              onChange={(value) =>
                updateField("gate", value)
              }
            />

            <FormTextarea
              label="Data anonymization"
              value={
                form.data_anonymization_status
              }
              onChange={(value) =>
                updateField(
                  "data_anonymization_status",
                  value,
                )
              }
            />
          </FormSection>

          <FormSection title="Security">
            <FormInput
              label="Nexus status"
              value={form.nexus_status}
              onChange={(value) =>
                updateField(
                  "nexus_status",
                  value,
                )
              }
            />

            <FormInput
              label="Rooted status"
              value={form.rooted_status}
              onChange={(value) =>
                updateField(
                  "rooted_status",
                  value,
                )
              }
            />

            <FormInput
              label="Network policy status"
              value={
                form.network_policy_status
              }
              onChange={(value) =>
                updateField(
                  "network_policy_status",
                  value,
                )
              }
            />

            <FormInput
              label="Security production status"
              value={
                form.security_prod_status
              }
              onChange={(value) =>
                updateField(
                  "security_prod_status",
                  value,
                )
              }
            />
          </FormSection>

          <FormSection title="Remarks">
            <FormTextarea
              label="Remark"
              value={form.remark}
              onChange={(value) =>
                updateField(
                  "remark",
                  value,
                )
              }
            />

            <FormTextarea
              label="Important remarks"
              value={form.remarks_imp}
              onChange={(value) =>
                updateField(
                  "remarks_imp",
                  value,
                )
              }
            />

            <FormTextarea
              label="Source comments"
              value={
                form.source_comments
              }
              onChange={(value) =>
                updateField(
                  "source_comments",
                  value,
                )
              }
            />
          </FormSection>

          {updateMutation.isError && (
            <div className="application-form-error">
              {updateMutation.error instanceof
              Error
                ? updateMutation.error.message
                : "Unable to update application."}
            </div>
          )}

          <div className="application-form-actions">
            <button
              type="button"
              className="application-cancel-button"
              disabled={
                updateMutation.isPending
              }
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="application-save-button"
              disabled={
                updateMutation.isPending
              }
            >
              {updateMutation.isPending
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="application-form-section">
      <h3>{title}</h3>

      <div className="application-form-grid">
        {children}
      </div>
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function FormDateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="application-form-full-width">
      {label}

      <textarea
        rows={4}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}