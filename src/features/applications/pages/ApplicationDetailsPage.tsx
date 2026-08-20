// src/features/applications/pages/ApplicationDetailsPage.tsx
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  ArrowLeft,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { EmptyState, PageHeader, PageLoader, Spinner, Tabs, useConfirmDialog } from "@/components/ui";
import RoadmapAnalytics from "@/features/roadmap/components/RoadmapAnalytics";
import RoadmapSection  from "@/features/roadmap/components/RoadmapSection";
import DbSyncupSection from "@/features/db-syncup/components/DbSyncupSection";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getUserRole } from "@/features/auth/utils/get-user-role";
import { isDbTeamRole } from "@/features/auth/utils/is-db-team-role";

import { useApplication } from "../hooks/useApplication";
import { useUpdateApplication } from "../hooks/useUpdateApplication";
import { useDeleteApplication } from "../hooks/useDeleteApplication";
import { populateApplicationForm } from "../utils/populate-application-form";
import {
  applicationEditSchema,
  type ApplicationEditFormInput,
  type ApplicationEditFormValues,
} from "../schemas/application-edit.schema";
import ApplicationEditFormFields from "../components/ApplicationEditFormFields";
import type {
  Application,
  UpdateApplicationPayload,
} from "../types/application.types";

type TabId = "analytics" | "roadmap" | "application" | "db-syncup";

const TABS: { id: TabId; label: string }[] = [
  { id: "analytics",   label: "Analytics (roadmap)" },
  { id: "roadmap",     label: "Roadmap" },
  { id: "application", label: "Application" },
  { id: "db-syncup",   label: "Database Migrations" },
];

function buildUpdatePayload(
  values: ApplicationEditFormValues,
  version: number,
  originalValues?: ApplicationEditFormValues,
): UpdateApplicationPayload {
  const payload: UpdateApplicationPayload = {
    version,
    application: {
      application_name:    values.application_name    || null,
      basicat:             values.basicat             || null,
      priority:            values.priority            || null,
      confirmed_domain:    values.confirmed_domain    || null,
      application_status:  values.application_status  || null,
      domain:              values.domain              || null,
      portfolio:           values.portfolio           || null,
      business_importance: values.business_importance || null,
      sov_type:            values.sov_type            || null,
      ns_migration_status_azure_count: values.ns_migration_status_azure_count,
      ns_to_migrate_bleu_environment_names: values.ns_to_migrate_bleu_environment_names || null,
      ns_migration_status_bleu_count: values.ns_migration_status_bleu_count,
    },
    migration: {
      migration_status:   values.migration_status  || null,
      migration_progress: values.migration_progress,
      strategy:           values.strategy           || null,
      hosting_location:   values.hosting_location   || null,
      cloud_squad:        values.cloud_squad         || null,
      cluster:             values.cluster             || null,
      initiated:           values.initiated           || null,
      tentative_start:    values.tentative_start     || null,
      tentative_end:      values.tentative_end       || null,
      confirmed_end:      values.confirmed_end       || null,
      go_live:            values.go_live             || null,
      total_ns:            values.total_ns,
      ns_migration_progress: values.ns_migration_progress || null,
      assessment_status:  values.migration_assessment_status         || null,
      data_anonymization_status: values.migration_data_anonymization_status || null,
      ns_backup_creation: values.ns_backup_creation || null,
      ns_migration_status: values.ns_migration_status || null,
    },
    meta_data: {
      dx_uid:                    values.dx_uid                    || null,
      mcp_id:                    values.mcp_id                    || null,
      wave:                      values.wave                      || null,
      gate:                      values.gate                      || null,
      assessment_status:         values.assessment_status         || null,
      data_anonymization_status: values.data_anonymization_status || null,
    },
    security: {
      benchmark_status:       values.benchmark_status       || null,
      nexus_status:           values.nexus_status           || null,
      rooted_status:          values.rooted_status          || null,
      network_policy_status:  values.network_policy_status  || null,
      security_prod_status:   values.security_prod_status   || null,
      security_prod_date:     values.security_prod_date     || null,
    },
    remark: {
      remark:           values.remark           || null,
      remarks_imp:      values.remarks_imp      || null,
      source_comments:  values.source_comments  || null,
      archived_remarks: values.archived_remarks || null,
    },
    owners: [
      { owner_type: "QA",                  owner_name: values.qa_owner_name      || null, owner_email: values.qa_owner_email      || null },
      { owner_type: "DevOps",              owner_name: values.devops_owner_name  || null, owner_email: values.devops_owner_email  || null },
      { owner_type: "PM",                  owner_name: values.pm_owner_name      || null, owner_email: values.pm_owner_email      || null },
      { owner_type: "Application Manager", owner_name: values.manager_owner_name || null, owner_email: values.manager_owner_email || null },
    ],
    cloud_ids: values.cloud_ids,
  };

  if (!originalValues) return payload;

  const originalPayload = buildUpdatePayload(originalValues, version);
  const changedPayload = getChangedFields(payload, originalPayload) as
    | Partial<UpdateApplicationPayload>
    | undefined;

  return {
    ...changedPayload,
    // The API requires the version even when every editable value is unchanged.
    version,
  };
}

function getChangedFields(current: unknown, original: unknown): unknown | undefined {
  if (Array.isArray(current)) {
    return JSON.stringify(current) === JSON.stringify(original) ? undefined : current;
  }

  if (current !== null && typeof current === "object") {
    const originalRecord =
      original !== null && typeof original === "object"
        ? original as Record<string, unknown>
        : {};
    const changedEntries = Object.entries(current as Record<string, unknown>)
      .flatMap(([key, value]) => {
        // Version is added explicitly after pruning.
        if (key === "version") return [];
        const changedValue = getChangedFields(value, originalRecord[key]);
        return changedValue === undefined ? [] : [[key, changedValue] as const];
      });

    return changedEntries.length > 0 ? Object.fromEntries(changedEntries) : undefined;
  }

  return Object.is(current, original) ? undefined : current;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicationDetailsPage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const params        = useParams<{ id: string }>();
  const { data: currentUser } = useCurrentUser();
  const role = getUserRole(currentUser);
  const isDbTeam = isDbTeamRole(role);
  const isAdmin = role === "admin";
  const { confirm, dialog } = useConfirmDialog();

  const applicationId = Number(params.id);

  // If we arrived here by clicking a row in the list, that row's data is
  // already in hand — use it as a placeholder so there's no loading flash,
  // while the query still fetches (and replaces it with) the current data.
  const navigationStateApplication =
    (location.state as { application?: Application } | null)?.application ?? null;
  const placeholderData =
    navigationStateApplication?.id === applicationId
      ? navigationStateApplication
      : undefined;

  const applicationQuery = useApplication(applicationId, placeholderData);
  const application = applicationQuery.data ?? null;

  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  const [updateError, setUpdateError] = useState("");

  const form = useForm<ApplicationEditFormInput, unknown, ApplicationEditFormValues>({
    resolver: zodResolver(applicationEditSchema),
    defaultValues: application ? populateApplicationForm(application) : undefined,
  });

  useEffect(() => {
    if (application) {
      form.reset(populateApplicationForm(application));
      setEditing(false);
    }
    // form.reset is stable across renders; only re-sync when the application data itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application]);

  if (!Number.isFinite(applicationId) || applicationId <= 0) {
    return (
      <EmptyState
        icon="⚠️"
        title="Application not found"
        text="No application data was found. Please go back to the list and try again."
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => navigate("/app/applications")}
          >
            Back to Applications
          </button>
        }
      />
    );
  }

  if (applicationQuery.isLoading) {
    return <PageLoader label="Loading application..." />;
  }

  if (applicationQuery.isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load application"
        text={
          applicationQuery.error instanceof Error
            ? applicationQuery.error.message
            : "Something went wrong."
        }
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => { void applicationQuery.refetch(); }}
          >
            Try again
          </button>
        }
      />
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon="⚠️"
        title="Application not found"
        text="No application data was found. Please go back to the list and try again."
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => navigate("/app/applications")}
          >
            Back to Applications
          </button>
        }
      />
    );
  }

  const cancelEditing = () => {
    form.reset(populateApplicationForm(application));
    setEditing(false);
  };

  const onSubmit = async (values: ApplicationEditFormValues) => {
    setUpdateError("");

    // List responses are used as placeholder data while the full application is
    // loading. Some list endpoints do not include the optimistic-lock version;
    // JSON.stringify would omit an undefined version and the API would reject
    // the request with `body.version: Field required`.
    if (!Number.isFinite(application.version)) {
      setUpdateError("Application version is still loading. Please try again.");
      await applicationQuery.refetch();
      return;
    }

    try {
      await updateMutation.mutateAsync({
        applicationId,
        payload: buildUpdatePayload(
          values,
          application.version,
          applicationEditSchema.parse(populateApplicationForm(application)),
        ),
      });
      setEditing(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setUpdateError("This record was changed by another user. Reload it and try again.");
        await applicationQuery.refetch();
        return;
      }
      setUpdateError(error instanceof Error ? error.message : "Unable to update application.");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Move application to trash",
      message: `Are you sure you want to move ${application.application_name} to trash?`,
      confirmLabel: "Move to Trash",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(applicationId);
      navigate("/app/applications", { replace: true });
    } catch {
      // The mutation error is displayed on this page.
    }
  };

  return (
    <div>
      <PageHeader
        leading={
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/app/applications")}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        }
        title={application.application_name}
        subtitle={
          <>
            Application ID: {applicationId}
            {application.carto_id ? ` · Carto: ${application.carto_id}` : ""}
          </>
        }
        actions={(
          <>
            {activeTab === "application" && !isDbTeam && !editing && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={applicationQuery.isPlaceholderData}
                onClick={() => setEditing(true)}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Pencil size={15} />
                Edit
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteMutation.isPending}
                onClick={() => { void handleDelete(); }}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Trash2 size={15} />
                {deleteMutation.isPending ? "Moving..." : "Move to Trash"}
              </button>
            )}
          </>
        )}
      />

      {deleteMutation.isError && (
        <div className="ods-form-message error" style={{ marginBottom: "1rem" }}>
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : "Unable to delete application."}
        </div>
      )}

      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} />

      {/* ── Tab: Analytics (roadmap) ─────────────────────────────── */}
      {activeTab === "analytics" && (
        <RoadmapAnalytics appId={applicationId} />
      )}

      {/* ── Tab: Roadmap ─────────────────────────────────────────── */}
      {activeTab === "roadmap" && (
        <RoadmapSection appId={applicationId} />
      )}

      {/* ── Tab: DB Syncup ───────────────────────────────────────── */}
      {activeTab === "db-syncup" && (
        <DbSyncupSection application={application} applicationId={applicationId} />
      )}

      {/* ── Tab: Application ─────────────────────────────────────── */}
      {activeTab === "application" && (
        <FormProvider {...form}>
          {updateError && (
            <div className="ods-form-message error">
              {updateError}
            </div>
          )}

          <form>
            <div className="ods-card">
              <div className="ods-card-body">
                <ApplicationEditFormFields readOnly />
              </div>
            </div>
          </form>

          {editing && (
            <>
              <div className="ods-drawer-overlay" onMouseDown={cancelEditing} />
              <aside
                className="ods-drawer open ods-drawer--wide"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="ods-drawer-header">
                  <div>
                    <div className="ods-drawer-title">Edit Application</div>
                    <div style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", marginTop: "0.15rem" }}>
                      {application.application_name}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ods-drawer-close"
                    onClick={cancelEditing}
                    aria-label="Close edit application drawer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "contents" }}>
                  <div className="ods-drawer-body">
                    <ApplicationEditFormFields readOnly={false} />
                  </div>
                  <div className="ods-drawer-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={updateMutation.isPending}
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updateMutation.isPending}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      {updateMutation.isPending ? (
                        <><Spinner size={16} />Saving...</>
                      ) : (
                        <><Save size={15} />Save changes</>
                      )}
                    </button>
                  </div>
                </form>
              </aside>
            </>
          )}
        </FormProvider>
      )}
      {dialog}
    </div>
  );
}
